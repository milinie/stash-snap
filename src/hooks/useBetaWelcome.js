// src/hooks/useBetaWelcome.js
//
// Isolated hook: queries `profiles.has_seen_beta_welcome` for the
// current signed-in user and exposes a function to mark it seen.
//
// // Uses the existing Supabase client from:
// src/lib/supabaseClient.js
//
// This hook does NOT touch auth, fabrics, bundles, subscriptions, or
// Stripe. It only reads/writes the `profiles` table added in the
// beta-welcome migration.

import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";

export function useBetaWelcome(user) {
  // null = not yet determined, true = show it, false = don't show it
  const [showWelcome, setShowWelcome] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchProfile() {
      if (!user) {
        // Signed-out users never see the modal
        if (isMounted) {
          setShowWelcome(false);
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("has_seen_beta_welcome")
        .eq("id", user.id)
        .single();

      if (!isMounted) return;

      if (error) {
        // Fail closed: if we can't confirm the flag, don't show the
        // modal, so we never risk repeatedly interrupting the user
        // due to a transient network/query error.
        console.error("useBetaWelcome: failed to load profile", error);
        setShowWelcome(false);
      } else {
        setShowWelcome(data?.has_seen_beta_welcome === false);
      }
      setLoading(false);
    }

    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const dismissWelcome = useCallback(async () => {
    if (!user) return;

    // Optimistically close the modal immediately
    setShowWelcome(false);

    const { error } = await supabase
      .from("profiles")
      .update({ has_seen_beta_welcome: true })
      .eq("id", user.id);

    if (error) {
      console.error("useBetaWelcome: failed to update profile", error);
      // Modal stays closed for this session even if the write fails;
      // it will simply re-appear next sign-in, which is safe.
    }
  }, [user]);

  return { showWelcome: showWelcome === true, loading, dismissWelcome };
}