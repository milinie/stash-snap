// App.jsx
import React, { useEffect, useState } from "react";
import { AuthProvider } from "./context/AuthContext";
import { StashSnap } from "./StashSnap";
import { LandingPage } from "./LandingPage";
import { PALETTE } from "./lib/constants";

// Reads Supabase auth-callback error params from the URL hash or query
// string (implicit-grant links put them in the hash, e.g.
// "#error=access_denied&error_code=otp_expired&error_description=...";
// some flows put them in the query string instead), then immediately
// strips only those keys via history.replaceState so a refresh doesn't
// re-show the same error. Any unrelated params sharing the same hash or
// query string (e.g. ?checkout=success) are left intact.
//
// history.state is passed through (not {}) so this doesn't clobber
// whatever state the browser/router already has attached to this
// history entry.
//
// This performs a side effect (history.replaceState), so it must NOT be
// called from inside a useState lazy initializer — Strict Mode may
// invoke a lazy initializer twice and discard one result, but it can't
// undo a side effect from the discarded call. Instead this is called
// once at module scope, below, and that single result is passed into
// useState as a plain value.
function consumeAuthCallbackError() {
  if (typeof window === "undefined") return null;

  const sources = [
    { type: "hash", raw: window.location.hash.startsWith("#") ? window.location.hash.slice(1) : window.location.hash },
    { type: "search", raw: window.location.search.startsWith("?") ? window.location.search.slice(1) : window.location.search }
  ];

  for (const source of sources) {
    if (!source.raw) continue;

    const params = new URLSearchParams(source.raw);
    if (!params.has("error") && !params.has("error_code") && !params.has("error_description")) continue;

    const errorType = params.get("error");
    const errorCode = params.get("error_code");
    const errorDescription = params.get("error_description");

    params.delete("error");
    params.delete("error_code");
    params.delete("error_description");
    const remaining = params.toString();

    if (source.type === "hash") {
      const newHash = remaining ? `#${remaining}` : "";
      const newUrl = `${window.location.pathname}${window.location.search}${newHash}`;
      window.history.replaceState(window.history.state, "", newUrl);
    } else {
      const newSearch = remaining ? `?${remaining}` : "";
      const newUrl = `${window.location.pathname}${newSearch}${window.location.hash}`;
      window.history.replaceState(window.history.state, "", newUrl);
    }

    return { errorType, errorCode, errorDescription };
  }

  return null;
}

function friendlyAuthErrorMessage(authError) {
  if (!authError) return null;

  if (authError.errorCode === "otp_expired") {
    return "This sign-in link has expired or has already been used. Request a new link and use only the newest email.";
  }

  return (
    authError.errorDescription ||
    "There was a problem signing in with that link. Please request a new sign-in link."
  );
}

// Runs once during normal module evaluation for each full page load.
// Development hot-module replacement may evaluate the module again,
// but the URL will already be clean, so subsequent calls simply return null.
const initialAuthCallbackError = consumeAuthCallbackError();

function AppShell() {
  const [view, setView] = useState("app"); // "app" | "account"
  const [checkoutNotice, setCheckoutNotice] = useState(null);

  // Initialized from the module-level constant above, not from a lazy
  // initializer function — consumeAuthCallbackError has already run by
  // this point, so this is just a plain value being handed to useState.
  const [authError, setAuthError] = useState(initialAuthCallbackError);
  const authErrorMessage = friendlyAuthErrorMessage(authError);

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
      const cleanUrl = `${window.location.pathname}${
        params.toString() ? `?${params}` : ""
      }${window.location.hash}`;

      window.history.replaceState(window.history.state, "", cleanUrl);
    }
  }, []);

  return (
    <>
      {authErrorMessage && (
        <div
          style={{
            background: PALETTE.mist,
            borderBottom: `1px solid ${PALETTE.blush}`,
            padding: "12px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            flexWrap: "wrap",
            fontFamily: "sans-serif",
            fontSize: 13,
            textAlign: "center"
          }}
        >
          <span>{authErrorMessage}</span>
          <button
            onClick={() => {
              setAuthError(null);
              setView("account");
            }}
            style={{
              background: "none",
              border: "none",
              color: PALETTE.teal,
              fontFamily: "sans-serif",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer"
            }}
          >
            Get a new sign-in link →
          </button>
          <button
            onClick={() => setAuthError(null)}
            aria-label="Dismiss"
            style={{
              background: "none",
              border: "none",
              color: "#999",
              fontFamily: "sans-serif",
              fontSize: 15,
              cursor: "pointer"
            }}
          >
            ×
          </button>
        </div>
      )}

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
