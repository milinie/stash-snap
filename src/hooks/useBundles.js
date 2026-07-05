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

export function useBundles({ cloudMode, stash }) {
  const { user } = useAuth();
  const [savedBundles, setSavedBundles] = useState([]);
  const [bundlesLoading, setBundlesLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      setBundlesLoading(true);

      if (cloudMode) {
        const { data, error } = await supabase
          .from("bundles")
          .select("*")
          .order("created_at", { ascending: false });

        if (!isMounted) return;

        if (error) {
          console.error("Failed to load cloud bundles:", error);
          setSavedBundles([]);
        } else {
          const stashById = new Map(stash.map((item) => [item.id, item]));
          setSavedBundles(
            data.map((row) => ({
              id: row.id,
              name: row.name,
              fabrics: row.fabric_ids.map((fid) => stashById.get(fid)).filter(Boolean)
            }))
          );
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
  }, [cloudMode, stash]);

  const saveBundle = useCallback(
    async (designWall) => {
      const name = `Bundle ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;

      if (cloudMode) {
        const { data, error } = await supabase
          .from("bundles")
          .insert({ user_id: user.id, name, fabric_ids: designWall.map((f) => f.id) })
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
    [cloudMode, user, savedBundles]
  );

  const deleteBundle = useCallback(
    async (id) => {
      if (cloudMode) {
        const { error } = await supabase.from("bundles").delete().eq("id", id);
        if (error) throw error;
      }

      const updated = savedBundles.filter((bundle) => bundle.id !== id);
      setSavedBundles(updated);
      if (!cloudMode) saveLocalBundles(updated);
    },
    [cloudMode, savedBundles]
  );

  return { savedBundles, bundlesLoading, saveBundle, deleteBundle };
}
