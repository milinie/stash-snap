import React, { useState } from "react";
import { PALETTE, APP_WIDTH } from "../lib/constants";
import { useAuth } from "../hooks/useAuth";
import { useSubscription } from "../hooks/useSubscription";
import { AuthForm } from "../components/AuthForm";
import { LoadingSpinner } from "../components/LoadingSpinner";

const PRICE_MONTHLY = import.meta.env.VITE_STRIPE_PRICE_MONTHLY;
const PRICE_ANNUAL = import.meta.env.VITE_STRIPE_PRICE_ANNUAL;

async function redirectToCheckout(priceId, userId, email) {
  const res = await fetch("/api/create-checkout-session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ priceId, userId, email })
  });
  const data = await res.json();
  if (data.url) {
    window.location.href = data.url;
  } else {
    alert(data.error || "Could not start checkout. Please try again.");
  }
}

async function redirectToPortal(customerId) {
  const res = await fetch("/api/create-portal-session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ customerId })
  });
  const data = await res.json();
  if (data.url) {
    window.location.href = data.url;
  } else {
    alert(data.error || "Could not open billing portal.");
  }
}

export function LandingPage() {
  const { user, authLoading, signOut } = useAuth();
  const { subscription, isPaid, subLoading } = useSubscription();
  const [checkoutBusy, setCheckoutBusy] = useState(null); // "monthly" | "annual" | null

  if (authLoading) return <LoadingSpinner label="Loading account..." />;

  const startCheckout = async (interval) => {
    setCheckoutBusy(interval);
    try {
      await redirectToCheckout(interval === "annual" ? PRICE_ANNUAL : PRICE_MONTHLY, user.id, user.email);
    } finally {
      setCheckoutBusy(null);
    }
  };

  return (
    <div style={{ maxWidth: APP_WIDTH, margin: "0 auto", padding: "24px 16px 100px" }}>
      <h2 style={{ marginBottom: 4 }}>Account</h2>

      {!user && (
        <>
          <p style={{ color: "#999", fontFamily: "sans-serif", fontSize: 13, marginBottom: 20 }}>
            Sign in to sync your stash across devices and back up your fabric photos. You can keep using
            Stash Snap on this device without an account, too.
          </p>
          <AuthForm />
        </>
      )}

      {user && (
        <div>
          <div style={{ background: "white", borderRadius: 16, padding: 18, marginBottom: 16 }}>
            <p style={{ fontFamily: "sans-serif", fontSize: 13, color: "#999", margin: "0 0 4px" }}>Signed in as</p>
            <p style={{ margin: 0, fontWeight: 700 }}>{user.email}</p>
          </div>

          <div style={{ background: "white", borderRadius: 16, padding: 18, marginBottom: 16 }}>
            {subLoading ? (
              <LoadingSpinner label="Checking subscription..." />
            ) : isPaid ? (
              <>
                <p style={{ margin: "0 0 4px", fontFamily: "sans-serif", fontSize: 13, color: PALETTE.teal, fontWeight: 700 }}>
                  ✓ Stash Snap Plus — {subscription.status === "trialing" ? "Trial active" : "Active"}
                </p>
                {subscription.current_period_end && (
                  <p style={{ margin: "0 0 12px", fontFamily: "sans-serif", fontSize: 12, color: "#999" }}>
                    {subscription.cancel_at_period_end ? "Cancels" : "Renews"} on{" "}
                    {new Date(subscription.current_period_end).toLocaleDateString()}
                  </p>
                )}
                <button
                  onClick={() => redirectToPortal(subscription.stripe_customer_id)}
                  style={{
                    border: `1px solid ${PALETTE.blush}`,
                    background: "white",
                    borderRadius: 8,
                    padding: "8px 14px",
                    fontSize: 13,
                    fontFamily: "sans-serif",
                    cursor: "pointer"
                  }}
                >
                  Manage billing
                </button>
              </>
            ) : (
              <>
                <p style={{ margin: "0 0 12px", fontFamily: "sans-serif", fontSize: 13, color: "#999" }}>
                  Free plan — up to 30 fabrics, saved on this device only.
                </p>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={() => startCheckout("monthly")}
                    disabled={checkoutBusy !== null}
                    style={{
                      flex: 1,
                      border: "none",
                      borderRadius: 8,
                      padding: "10px 14px",
                      fontSize: 13,
                      fontFamily: "sans-serif",
                      fontWeight: 700,
                      color: "white",
                      background: PALETTE.teal,
                      cursor: "pointer",
                      opacity: checkoutBusy && checkoutBusy !== "monthly" ? 0.6 : 1
                    }}
                  >
                    {checkoutBusy === "monthly" ? "Redirecting..." : "Upgrade Monthly"}
                  </button>
                  <button
                    onClick={() => startCheckout("annual")}
                    disabled={checkoutBusy !== null}
                    style={{
                      flex: 1,
                      border: `1.5px solid ${PALETTE.teal}`,
                      borderRadius: 8,
                      padding: "10px 14px",
                      fontSize: 13,
                      fontFamily: "sans-serif",
                      fontWeight: 700,
                      color: PALETTE.teal,
                      background: "white",
                      cursor: "pointer",
                      opacity: checkoutBusy && checkoutBusy !== "annual" ? 0.6 : 1
                    }}
                  >
                    {checkoutBusy === "annual" ? "Redirecting..." : "Upgrade Annual (save more)"}
                  </button>
                </div>
              </>
            )}
          </div>

          <button
            onClick={signOut}
            style={{ border: "1px solid #f0c8c0", background: "none", color: PALETTE.rose, borderRadius: 8, padding: "8px 14px", fontSize: 13, fontFamily: "sans-serif", cursor: "pointer" }}
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
