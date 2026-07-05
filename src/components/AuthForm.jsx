import React, { useState } from "react";
import { PALETTE } from "../lib/constants";
import { inputStyle, labelStyle } from "../lib/styles";
import { useAuth } from "../hooks/useAuth";

export function AuthForm({ onDone }) {
  const { signIn, signUp, signInWithMagicLink, resetPassword } = useAuth();
  const [mode, setMode] = useState("signin"); // signin | signup | magic
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState(null); // { type: 'error'|'success', message }
  const [busy, setBusy] = useState(false);

  const handleForgotPassword = async () => {
    if (!email) {
      setStatus({ type: "error", message: "Enter your email above first, then tap \"Forgot password?\"." });
      return;
    }

    setStatus(null);
    setBusy(true);
    try {
      const { error } = await resetPassword(email);
      if (error) throw error;
      setStatus({ type: "success", message: "Check your email for a link to reset your password." });
    } catch (error) {
      setStatus({ type: "error", message: error.message || "Something went wrong." });
    } finally {
      setBusy(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);
    setBusy(true);

    try {
      if (mode === "magic") {
        const { error } = await signInWithMagicLink(email);
        if (error) throw error;
        setStatus({ type: "success", message: "Check your email for a sign-in link." });
      } else if (mode === "signup") {
        const { error } = await signUp(email, password);
        if (error) throw error;
        setStatus({ type: "success", message: "Account created! Check your email to confirm, then sign in." });
      } else {
        const { error } = await signIn(email, password);
        if (error) throw error;
        onDone?.();
      }
    } catch (error) {
      setStatus({ type: "error", message: error.message || "Something went wrong." });
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {[
          ["signin", "Sign In"],
          ["signup", "Sign Up"],
          ["magic", "Magic Link"]
        ].map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => { setMode(id); setStatus(null); }}
            style={{
              flex: 1,
              padding: "8px 4px",
              borderRadius: 8,
              border: `1.5px solid ${mode === id ? PALETTE.teal : PALETTE.blush}`,
              background: mode === id ? PALETTE.teal : "white",
              color: mode === id ? "white" : PALETTE.ink,
              fontSize: 12,
              fontFamily: "sans-serif",
              fontWeight: 700,
              cursor: "pointer"
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <label style={labelStyle}>Email</label>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        style={inputStyle}
        placeholder="you@example.com"
      />

      {mode !== "magic" && (
        <>
          <label style={labelStyle}>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            style={inputStyle}
            placeholder="At least 6 characters"
          />
        </>
      )}

      {mode === "signin" && (
        <button
          type="button"
          onClick={handleForgotPassword}
          disabled={busy}
          style={{
            background: "none",
            border: "none",
            padding: 0,
            marginTop: -10,
            marginBottom: 16,
            fontSize: 12,
            fontFamily: "sans-serif",
            color: PALETTE.teal,
            textDecoration: "underline",
            cursor: busy ? "default" : "pointer"
          }}
        >
          Forgot password?
        </button>
      )}

      {status && (
        <p
          style={{
            fontSize: 13,
            fontFamily: "sans-serif",
            color: status.type === "error" ? "#c0392b" : PALETTE.teal,
            marginTop: -6,
            marginBottom: 12
          }}
        >
          {status.message}
        </p>
      )}

      <button
        type="submit"
        disabled={busy}
        style={{
          width: "100%",
          border: "none",
          borderRadius: 50,
          padding: 14,
          fontSize: 15,
          color: "white",
          background: `linear-gradient(135deg, ${PALETTE.teal}, ${PALETTE.sage})`,
          opacity: busy ? 0.6 : 1,
          cursor: busy ? "default" : "pointer"
        }}
      >
        {busy ? "Please wait..." : mode === "signup" ? "Create Account" : mode === "magic" ? "Send Magic Link" : "Sign In"}
      </button>
    </form>
  );
}
