import React, { useEffect, useState } from "react";
import { AuthProvider } from "./context/AuthContext";
import { StashSnap } from "./StashSnap";
import { LandingPage } from "./LandingPage";
import { PALETTE } from "./lib/constants";

function AppShell() {
  const [view, setView] = useState("app"); // "app" | "account"
  const [checkoutNotice, setCheckoutNotice] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    if (params.get("checkout") === "success") {
      setCheckoutNotice("🎉 Welcome to Stash Snap Plus! Syncing your stash now...");
      setView("account");
    } else if (params.get("checkout") === "cancelled") {
      setCheckoutNotice("Checkout cancelled — no charge was made.");
      setView("account");
    }

    if (params.get("checkout")) {
      // Clean the URL so refreshing doesn't re-trigger the notice.
      params.delete("checkout");
      const cleanUrl = `${window.location.pathname}${params.toString() ? `?${params}` : ""}`;
      window.history.replaceState({}, "", cleanUrl);
    }
  }, []);

  return (
    <>
      {view === "account" ? (
        <div>
          <div style={{ background: "white", borderBottom: `1px solid ${PALETTE.blush}`, padding: "14px 16px" }}>
            <button
              onClick={() => setView("app")}
              style={{ background: "none", border: "none", color: PALETTE.teal, fontFamily: "sans-serif", fontSize: 14, fontWeight: 700, cursor: "pointer" }}
            >
              ← Back to Stash Snap
            </button>
          </div>
          {checkoutNotice && (
            <div style={{ background: PALETTE.mist, padding: "12px 16px", fontFamily: "sans-serif", fontSize: 13, textAlign: "center" }}>
              {checkoutNotice}
            </div>
          )}
          <LandingPage />
        </div>
      ) : (
        <StashSnap onOpenAccount={() => setView("account")} />
      )}
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}

export default App;
