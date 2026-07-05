import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "./useAuth";

const ACTIVE_STATUSES = new Set(["active", "trialing", "past_due"]);
// past_due is included as "still paid" so a temporarily failed card doesn't
// instantly lock the user out mid-grace-period. Stripe retries automatically;
// the webhook will flip this to "canceled" if retries exhaust.

export function useSubscription() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState(null);
  const [subLoading, setSubLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (!user) {
      setSubscription(null);
      setSubLoading(false);
      return;
    }

    setSubLoading(true);

    const { data, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.error("Failed to load subscription:", error);
    }

    setSubscription(data ?? null);
    setSubLoading(false);
  }, [user]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  // Live-update if the webhook writes a new status while the user is on the page
  // (e.g. they just completed Stripe Checkout in another tab).
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`subscriptions-${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "subscriptions", filter: `user_id=eq.${user.id}` },
        (payload) => setSubscription(payload.new)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const isPaid = Boolean(subscription && ACTIVE_STATUSES.has(subscription.status));

  return {
    subscription,
    isPaid,
    subLoading,
    refetchSubscription: refetch
  };
}
