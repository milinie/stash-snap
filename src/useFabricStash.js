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
  const { user } = useAuth();
  const { isPaid, subLoading } = useSubscription();

  const [stash, setStash] = useState([]);
  const [stashLoading, setStashLoading] = useState(true);

  const cloudMode = Boolean(user) && isPaid;

  // ---------- LOAD ----------
  useEffect(() => {
    if (subLoading) return; // wait until we know free vs paid

    let isMounted = true;

    async function load() {
      setStashLoading(true);

      if (cloudMode) {
        const { data, error } = await supabase
          .from("fabrics")
          .select("*")
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
  }, [cloudMode, subLoading]);

  // ---------- persist local mode on every change ----------
  useEffect(() => {
    if (cloudMode || stashLoading) return;
    try {
      saveLocalStash(stash);
    } catch {
      alert("Photo is too large to save. Try a smaller photo.");
    }
  }, [stash, cloudMode, stashLoading]);

  // ---------- ONE-TIME MIGRATION: local -> cloud, the moment a free user's payment activates ----------
  useEffect(() => {
    if (!cloudMode || !user) return;

    const migrationKey = `${MIGRATION_FLAG_KEY}-${user.id}`;
    if (localStorage.getItem(migrationKey)) return;

    const localItems = loadLocalStash().filter((item) => item.id !== undefined);
    if (localItems.length === 0) {
      localStorage.setItem(migrationKey, "true");
      return;
    }

    (async () => {
      try {
        for (const item of localItems) {
          const row = toRow(user.id, item);
          const { data: inserted, error } = await supabase.from("fabrics").insert(row).select().single();
          if (error) {
            console.error("Migration insert failed for", item.name, error);
            continue;
          }

          // Local photos are inline data URLs — re-upload them to Storage so
          // cloud fabrics behave the same as newly-added ones.
          if (item.photo && item.photo.startsWith("data:")) {
            try {
              const blob = await (await fetch(item.photo)).blob();
              const file = new File([blob], "migrated.jpg", { type: "image/jpeg" });
              const { path, url } = await uploadFabricPhoto(user.id, inserted.id, file);
              await supabase
                .from("fabrics")
                .update({ photo_url: url, photo_storage_path: path })
                .eq("id", inserted.id);
            } catch (photoError) {
              console.error("Migration photo upload failed for", item.name, photoError);
            }
          }
        }

        localStorage.setItem(migrationKey, "true");
        // Reload from cloud so the UI reflects the migrated + newly uploaded data.
        const { data } = await supabase.from("fabrics").select("*").order("created_at", { ascending: false });
        if (data) setStash(data.map(fromRow));
      } catch (error) {
        console.error("Stash migration failed:", error);
      }
    })();
  }, [cloudMode, user]);

  const isAtFreeLimit = !cloudMode && stash.length >= FREE_TIER_FABRIC_LIMIT;

  // ---------- ADD ----------
  const addFabric = useCallback(
    async (form) => {
      if (isAtFreeLimit) {
        throw new Error("FREE_LIMIT_REACHED");
      }

      if (cloudMode) {
        const { data: inserted, error } = await supabase
          .from("fabrics")
          .insert(toRow(user.id, form))
          .select()
          .single();

        if (error) throw error;

        let photoUrl = null;
        let photoPath = null;

        if (form.photoFile) {
          const uploaded = await uploadFabricPhoto(user.id, inserted.id, form.photoFile);
          photoUrl = uploaded.url;
          photoPath = uploaded.path;
          await supabase
            .from("fabrics")
            .update({ photo_url: photoUrl, photo_storage_path: photoPath })
            .eq("id", inserted.id);
        }

        const newItem = fromRow({ ...inserted, photo_url: photoUrl, photo_storage_path: photoPath });
        setStash((prev) => [newItem, ...prev]);
        return newItem;
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
      return newItem;
    },
    [cloudMode, user, isAtFreeLimit]
  );

  // ---------- UPDATE ----------
  const updateFabric = useCallback(
    async (updated) => {
      if (cloudMode) {
        let photoUrl = updated.photo;
        let photoPath = updated.photoPath;

        if (updated.photoFile) {
          if (photoPath) await deleteFabricPhoto(photoPath);
          const uploaded = await uploadFabricPhoto(user.id, updated.id, updated.photoFile);
          photoUrl = uploaded.url;
          photoPath = uploaded.path;
        } else if (updated.photoRemoved) {
          if (photoPath) await deleteFabricPhoto(photoPath);
          photoUrl = null;
          photoPath = null;
        }

        const { error } = await supabase
          .from("fabrics")
          .update({ ...toRow(user.id, updated), photo_url: photoUrl, photo_storage_path: photoPath })
          .eq("id", updated.id);

        if (error) throw error;

        const merged = { ...updated, photo: photoUrl, photoPath };
        setStash((prev) => prev.map((item) => (item.id === updated.id ? merged : item)));
        return merged;
      }

      const merged = { ...updated };
      delete merged.photoFile;
      delete merged.photoRemoved;

      setStash((prev) => prev.map((item) => (item.id === merged.id ? { ...item, ...merged } : item)));
      return merged;
    },
    [cloudMode, user]
  );

  // ---------- DELETE ----------
  const deleteFabric = useCallback(
    async (id) => {
      if (cloudMode) {
        const existing = stash.find((item) => item.id === id);
        const { error } = await supabase.from("fabrics").delete().eq("id", id);
        if (error) throw error;
        if (existing?.photoPath) await deleteFabricPhoto(existing.photoPath);
      }

      setStash((prev) => prev.filter((item) => item.id !== id));
    },
    [cloudMode, stash]
  );

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
    deleteFabric
  };
}
