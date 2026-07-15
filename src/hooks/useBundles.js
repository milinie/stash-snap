import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "./useAuth";

const LOCAL_KEY = "saved-bundles";

function loadLocalBundles() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveLocalBundles(bundles) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(bundles));
}

function rowsToBundles(rows, stash) {
  const stashById = new Map(stash.map((item) => [item.id, item]));
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    fabrics: row.fabric_ids.map((fid) => stashById.get(fid)).filter(Boolean)
  }));
}

export function useBundles({ cloudMode, stash }) {
  const { user, refreshSignal } = useAuth();
  const userId = user?.id ?? null;
  const [savedBundles, setSavedBundles] = useState([]);
  const [bundlesLoading, setBundlesLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      setBundlesLoading(true);

      if (cloudMode && userId) {
        const { data, error } = await supabase
          .from("bundles")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        if (!isMounted) return;

        if (error) {
          console.error("Failed to load cloud bundles:", error);
          setSavedBundles([]);
        } else {
          setSavedBundles(rowsToBundles(data, stash));
        }
      } else {
        setSavedBundles(loadLocalBundles());
      }

      if (isMounted) setBundlesLoading(false);
    }

    load();
    return () => {
      isMounted = false;
    };
  }, [cloudMode, userId, refreshSignal, stash]);

  const saveBundle = useCallback(
    async (designWall) => {
      const name = `Bundle ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;

      if (cloudMode && userId) {
        const { data, error } = await supabase
          .from("bundles")
          .insert({ user_id: userId, name, fabric_ids: designWall.map((f) => f.id) })
          .select()
          .single();

        if (error) throw error;

        const newBundle = { id: data.id, name: data.name, fabrics: designWall };
        setSavedBundles((prev) => [newBundle, ...prev]);
        return newBundle;
      }

      const newBundle = { id: Date.now(), name, fabrics: designWall };
      const updated = [newBundle, ...savedBundles];
      setSavedBundles(updated);
      saveLocalBundles(updated);
      return newBundle;
    },
    [cloudMode, userId, savedBundles]
  );

  const deleteBundle = useCallback(
    async (id) => {
      if (cloudMode && userId) {
        const { data: deletedRows, error } = await supabase
          .from("bundles")
          .delete()
          .eq("id", id)
          .eq("user_id", userId)
          .select();

        if (error) {
          console.error("Delete failed for bundle", id, error);
          return { error };
        }

        if (!deletedRows || deletedRows.length === 0) {
          const silentFailError = new Error(
            "Delete affected 0 rows — likely blocked by a missing/misconfigured RLS DELETE policy on public.bundles, or the bundle no longer belongs to this user."
          );
          console.error("Delete silently failed for bundle", id, silentFailError);
          return { error: silentFailError };
        }

        const updated = savedBundles.filter((bundle) => bundle.id !== id);
        setSavedBundles(updated);
        return { error: null };
      }

      const updated = savedBundles.filter((bundle) => bundle.id !== id);
      setSavedBundles(updated);
      saveLocalBundles(updated);
      return { error: null };
    },
    [cloudMode, userId, savedBundles]
  );

  // ---------- REFRESH FROM CLOUD ----------
  // Manually re-pulls this user's bundles from Supabase and replaces local
  // state entirely. Takes the current `stash` as a parameter (rather than
  // relying on the closed-over value) so callers doing a combined
  // "refresh everything" can pass in freshly-refreshed fabric data,
  // ensuring bundle fabric references resolve against up-to-date fabrics
  // rather than a stale stash from before the refresh.
  const refreshFromCloud = useCallback(
    async (freshStash) => {
      if (!cloudMode || !userId) {
        return { error: new Error("refreshFromCloud called while not signed in.") };
      }

      const { data, error } = await supabase
        .from("bundles")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("refreshFromCloud (bundles) failed:", error);
        return { error };
      }

      setSavedBundles(rowsToBundles(data, freshStash ?? stash));
      return { error: null };
    },
    [cloudMode, userId, stash]
  );

  return { savedBundles, bundlesLoading, saveBundle, deleteBundle, refreshFromCloud };
}
