import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { SAMPLE_STASH, FREE_TIER_FABRIC_LIMIT } from "../lib/constants";
import { deleteFabricPhoto, uploadFabricPhoto } from "../lib/fabricPhotos";
import { useAuth } from "./useAuth";
import { useSubscription } from "./useSubscription";

const LOCAL_KEY = "stash-snap-data";
const MIGRATION_FLAG_KEY = "stash-snap-migrated";

function loadLocalStash() {
  try {
    const saved = localStorage.getItem(LOCAL_KEY);
    return saved ? JSON.parse(saved) : SAMPLE_STASH;
  } catch {
    return SAMPLE_STASH;
  }
}

function saveLocalStash(stash) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(stash));
  } catch (error) {
    console.error("Could not save stash:", error);
    throw error;
  }
}

// DB row -> UI shape (matches what FabricCard / AddModal already expect)
function fromRow(row) {
  return {
    id: row.id,
    name: row.name,
    color: row.color,
    style: row.style,
    fabricType: row.fabric_type,
    pieceCount: row.piece_count,
    pieceSize: row.piece_size,
    yardage: row.yardage,
    collection: row.collection,
    notes: row.notes,
    photo: row.photo_url,
    photoPath: row.photo_storage_path,
    date: row.fabric_date
  };
}

function toRow(userId, item) {
  return {
    user_id: userId,
    name: item.name,
    color: item.color,
    style: item.style,
    fabric_type: item.fabricType,
    piece_count: item.pieceCount ? String(item.pieceCount) : null,
    piece_size: item.pieceSize || null,
    yardage: item.yardage,
    collection: item.collection,
    notes: item.notes,
    fabric_date: item.date
  };
}

export function useFabricStash() {
  const { user, refreshSignal } = useAuth();
  const { isPaid } = useSubscription();

  const [stash, setStash] = useState([]);
  const [stashLoading, setStashLoading] = useState(true);

  const cloudMode = Boolean(user);
  const userId = user?.id ?? null;

  // ---------- LOAD ----------
  useEffect(() => {
    let isMounted = true;

    async function load() {
      setStashLoading(true);

      if (cloudMode && userId) {
        const { data, error } = await supabase
          .from("fabrics")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        if (!isMounted) return;

        if (error) {
          console.error("Failed to load cloud stash:", error);
          setStash([]);
        } else {
          setStash(data.map(fromRow));
        }
      } else {
        setStash(loadLocalStash());
      }

      if (isMounted) setStashLoading(false);
    }

    load();
    return () => {
      isMounted = false;
    };
  }, [cloudMode, userId, refreshSignal]);
  useEffect(() => {
    if (cloudMode || stashLoading) return;
    try {
      saveLocalStash(stash);
    } catch {
      alert("Photo is too large to save. Try a smaller photo.");
    }
  }, [stash, cloudMode, stashLoading]);

  // ---------- ONE-TIME MIGRATION: local -> cloud, the moment someone signs in ----------
  useEffect(() => {
    if (!cloudMode || !userId) return;

    const migrationKey = `${MIGRATION_FLAG_KEY}-${userId}`;
    if (localStorage.getItem(migrationKey)) return;

    const localItems = loadLocalStash().filter((item) => item.id !== undefined);
    if (localItems.length === 0) {
      localStorage.setItem(migrationKey, "true");
      return;
    }

    (async () => {
      try {
        for (const item of localItems) {
          const row = toRow(userId, item);
          const { data: inserted, error } = await supabase.from("fabrics").insert(row).select().single();
          if (error) {
            console.error("Migration insert failed for", item.name, error);
            continue;
          }

          if (item.photo && item.photo.startsWith("data:")) {
            try {
              const blob = await (await fetch(item.photo)).blob();
              const file = new File([blob], "migrated.jpg", { type: "image/jpeg" });
              const { path, url } = await uploadFabricPhoto(userId, inserted.id, file);
              await supabase
                .from("fabrics")
                .update({ photo_url: url, photo_storage_path: path })
                .eq("id", inserted.id)
                .eq("user_id", userId);
            } catch (photoError) {
              console.error("Migration photo upload failed for", item.name, photoError);
            }
          }
        }

        localStorage.setItem(migrationKey, "true");
        const { data } = await supabase
          .from("fabrics")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });
        if (data) setStash(data.map(fromRow));
      } catch (error) {
        console.error("Stash migration failed:", error);
      }
    })();
  }, [cloudMode, userId]);

  const isAtFreeLimit = !isPaid && stash.length >= FREE_TIER_FABRIC_LIMIT;

  // ---------- ADD ----------
  // Contract: returns { data, error }. FREE_LIMIT_REACHED is reported as
  // error.code rather than a thrown exception, so all outcomes go through
  // the same return shape per the {data, error} requirement.
  const addFabric = useCallback(
    async (form) => {
      if (isAtFreeLimit) {
        return { data: null, error: { code: "FREE_LIMIT_REACHED", message: "Free plan fabric limit reached." } };
      }

      if (cloudMode && userId) {
        const row = toRow(userId, form);

        const { data: inserted, error } = await supabase
          .from("fabrics")
          .insert(row)
          .select()
          .single();

        if (error) {
          console.error("Insert failed for fabric", form.name, error);
          return { data: null, error };
        }

        let photoUrl = null;
        let photoPath = null;

        if (form.photoFile) {
          try {
            const uploaded = await uploadFabricPhoto(userId, inserted.id, form.photoFile);
            photoUrl = uploaded.url;
            photoPath = uploaded.path;

            const { data: withPhoto, error: photoUpdateError } = await supabase
              .from("fabrics")
              .update({ photo_url: photoUrl, photo_storage_path: photoPath })
              .eq("id", inserted.id)
              .eq("user_id", userId)
              .select()
              .single();

            if (photoUpdateError) {
              console.error("Saving photo URL to fabric row failed for", inserted.id, photoUpdateError);
              // The fabric row itself was inserted successfully; only the
              // photo attach step failed. Fall through using inserted data
              // without the photo rather than reporting the whole save as failed.
            } else {
              const newItem = fromRow(withPhoto);
              setStash((prev) => [newItem, ...prev]);
              return { data: newItem, error: null };
            }
          } catch (photoError) {
            console.error("Photo upload failed for fabric", inserted.id, photoError);
            // Same reasoning: row is saved, photo attach failed — don't
            // fail the whole save, but the returned item won't have a photo.
          }
        }

        const newItem = fromRow(inserted);
        setStash((prev) => [newItem, ...prev]);
        return { data: newItem, error: null };
      }

      const newItem = {
        ...form,
        id: form.id || Date.now(),
        date: form.date || new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        yardage: Number(form.yardage) || 0
      };
      delete newItem.photoFile;
      delete newItem.photoRemoved;

      setStash((prev) => [newItem, ...prev]);
      return { data: newItem, error: null };
    },
    [cloudMode, userId, isAtFreeLimit]
  );

  // ---------- UPDATE ----------
  // FIX (root cause of cross-device sync bug): previously this update had
  // no .select(), so a write blocked by RLS or a non-matching id/user_id
  // (0 rows affected) reported error: null, and local state was optimistically
  // merged from the INPUT form data rather than anything Supabase confirmed.
  // The UI showed the edit as saved even when nothing changed in the database.
  //
  // Fix: .select().single() forces Supabase to return the actual updated row,
  // and .single() itself throws if 0 (or more than 1) rows matched — so a
  // silently-blocked update now surfaces as an error instead of a false
  // success. Local state is now built from the row Postgres returns, not
  // from the locally-typed form data, so cloud is the actual source of truth.
  //
  // Contract: returns { data, error } instead of throwing.
  const updateFabric = useCallback(
    async (updated) => {
      if (cloudMode && userId) {
        let photoUrl = updated.photo;
        let photoPath = updated.photoPath;

        try {
          if (updated.photoFile) {
            if (photoPath) await deleteFabricPhoto(photoPath);
            const uploaded = await uploadFabricPhoto(userId, updated.id, updated.photoFile);
            photoUrl = uploaded.url;
            photoPath = uploaded.path;
          } else if (updated.photoRemoved) {
            if (photoPath) await deleteFabricPhoto(photoPath);
            photoUrl = null;
            photoPath = null;
          }
        } catch (photoError) {
          console.error("Photo handling failed during update for fabric", updated.id, photoError);
          return { data: null, error: photoError };
        }

        const { data: updatedRow, error } = await supabase
          .from("fabrics")
          .update({ ...toRow(userId, updated), photo_url: photoUrl, photo_storage_path: photoPath })
          .eq("id", updated.id)
          .eq("user_id", userId)
          .select()
          .single();

        if (error) {
          console.error("Update failed for fabric", updated.id, error);
          return { data: null, error };
        }

        const merged = fromRow(updatedRow);
        setStash((prev) => prev.map((item) => (item.id === merged.id ? merged : item)));
        return { data: merged, error: null };
      }

      const merged = { ...updated };
      delete merged.photoFile;
      delete merged.photoRemoved;

      setStash((prev) => prev.map((item) => (item.id === merged.id ? { ...item, ...merged } : item)));
      return { data: merged, error: null };
    },
    [cloudMode, userId]
  );

  // ---------- DELETE ----------
  const deleteFabric = useCallback(
    async (id) => {
      if (cloudMode && userId) {
        const existing = stash.find((item) => item.id === id);

        const { data: deletedRows, error } = await supabase
          .from("fabrics")
          .delete()
          .eq("id", id)
          .eq("user_id", userId)
          .select();

        if (error) {
          console.error("Delete failed for fabric", id, error);
          return { error };
        }

        if (!deletedRows || deletedRows.length === 0) {
          const silentFailError = new Error(
            "Delete affected 0 rows — likely blocked by a missing/misconfigured RLS DELETE policy on public.fabrics, or the fabric no longer belongs to this user."
          );
          console.error("Delete silently failed for fabric", id, silentFailError);
          return { error: silentFailError };
        }

        if (existing?.photoPath) {
          try {
            await deleteFabricPhoto(existing.photoPath);
          } catch (photoError) {
            console.error("Fabric row deleted, but photo cleanup failed for", id, photoError);
          }
        }

        setStash((prev) => prev.filter((item) => item.id !== id));
        return { error: null };
      }

      setStash((prev) => prev.filter((item) => item.id !== id));
      return { error: null };
    },
    [cloudMode, userId, stash]
  );

  // ---------- REFRESH FROM CLOUD ----------
  // Manually re-pulls this user's fabrics from Supabase and replaces local
  // state entirely, discarding any unconfirmed local assumptions. Returns
  // the fetched data (not just {error}) so callers — e.g. a combined
  // "refresh everything" handler — can pass fresh fabric data straight
  // into a bundles refresh without waiting on this hook's own re-render.
  const refreshFromCloud = useCallback(async () => {
    if (!cloudMode || !userId) {
      return { data: null, error: new Error("refreshFromCloud called while not signed in.") };
    }

    const { data, error } = await supabase
      .from("fabrics")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("refreshFromCloud (fabrics) failed:", error);
      return { data: null, error };
    }

    const mapped = data.map(fromRow);
    setStash(mapped);
    return { data: mapped, error: null };
  }, [cloudMode, userId]);

  const totalYards = useMemo(() => stash.reduce((sum, item) => sum + (item.yardage || 0), 0), [stash]);
  const collections = useMemo(() => [...new Set(stash.map((item) => item.collection))], [stash]);

  return {
    stash,
    stashLoading,
    cloudMode,
    isAtFreeLimit,
    freeLimit: FREE_TIER_FABRIC_LIMIT,
    totalYards,
    collections,
    addFabric,
    updateFabric,
    deleteFabric,
    refreshFromCloud
  };
}
