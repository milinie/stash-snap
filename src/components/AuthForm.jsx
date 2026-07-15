import React, { useState } from "react";
import { PALETTE } from "../lib/constants";
import { inputStyle, labelStyle } from "../lib/styles";
import { useAuth } from "../hooks/useAuth";

function getErrorMessage(
  error,
  fallback = "Something went wrong. Please try again."
) {
  if (typeof error === "string" && error.trim()) {
    return error;
  }

  if (
    typeof error?.message === "string" &&
    error.message.trim() &&
    error.message !== "{}"
  ) {
    return error.message;
  }

  if (
    typeof error?.error_description === "string" &&
    error.error_description.trim()
  ) {
    return error.error_description;
  }

  return fallback;
}

export function AuthForm({ onDone }) {
  const { signIn, signUp, signInWithMagicLink, resetPassword } = useAuth();

  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState(null);
  const [busy, setBusy] = useState(false);

  const handleModeChange = (nextMode) => {
    setMode(nextMode);
    setStatus(null);
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setStatus({
        type: "error",
        message:
          'Enter your email above first, then tap "Forgot password?".',
      });
      return;
    }

    setStatus(null);
    setBusy(true);

    try {
      const { error } = await resetPassword(email.trim());

      if (error) {
        throw error;
      }

      setStatus({
        type: "success",
        message: "Check your email for a link to reset your password.",
      });
    } catch (error) {
      console.error("Password reset error:", error);

      setStatus({
        type: "error",
        message: getErrorMessage(
          error,
          "Could not send the password reset email. Please try again."
        ),
      });
    } finally {
      setBusy(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus(null);
    setBusy(true);

    try {
      const trimmedEmail = email.trim();

      if (mode === "magic") {
        const { error } = await signInWithMagicLink(trimmedEmail);

        if (error) {
          throw error;
        }

        setStatus({
          type: "success",
          message: "Check your email for a sign-in link.",
        });

        return;
      }

      if (mode === "signup") {
        const { error } = await signUp(trimmedEmail, password);

        if (error) {
          throw error;
        }

        setStatus({
          type: "success",
          message:
            "Account created! Check your email to confirm, then sign in.",
        });

        return;
      }

      const { error } = await signIn(trimmedEmail, password);

      if (error) {
        throw error;
      }

      onDone?.();
    } catch (error) {
      console.error("Authentication error:", error);

      const fallback =
        mode === "magic"
          ? "Could not send the magic link. Please try again."
          : mode === "signup"
            ? "Could not create the account. Please try again."
            : "Could not sign in. Please check your email and password.";

      setStatus({
        type: "error",
        message: getErrorMessage(error, fallback),
      });
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
          ["magic", "Magic Link"],
        ].map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => handleModeChange(id)}
            style={{
              flex: 1,
              padding: "8px 4px",
              borderRadius: 8,
              border: `1.5px solid ${
                mode === id ? PALETTE.teal : PALETTE.blush
              }`,
              background: mode === id ? PALETTE.teal : "white",
              color: mode === id ? "white" : PALETTE.ink,
              fontSize: 12,
              fontFamily: "sans-serif",
              fontWeight: 700,
              cursor: "pointer",
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
        onChange={(event) => setEmail(event.target.value)}
        required
        autoComplete="email"
        style={inputStyle}
        placeholder="you@example.com"
      />

      {mode !== "magic" && (
        <>
          <label style={labelStyle}>Password</label>

          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            minLength={6}
            autoComplete={
              mode === "signup" ? "new-password" : "current-password"
            }
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
            cursor: busy ? "default" : "pointer",
          }}
        >
          Forgot password?
        </button>
      )}

      {status && (
        <p
          role={status.type === "error" ? "alert" : "status"}
          style={{
            fontSize: 13,
            fontFamily: "sans-serif",
            color: status.type === "error" ? "#c0392b" : PALETTE.teal,
            marginTop: -6,
            marginBottom: 12,
          }}
        >
          {typeof status.message === "string"
            ? status.message
            : "Something went wrong. Please try again."}
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
          cursor: busy ? "default" : "pointer",
        }}
      >
        {busy
          ? "Please wait..."
          : mode === "signup"
            ? "Create Account"
            : mode === "magic"
              ? "Send Magic Link"
              : "Sign In"}
      </button>
    </form>
  );
}