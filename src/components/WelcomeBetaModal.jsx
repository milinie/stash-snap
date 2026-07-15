// src/components/WelcomeBetaModal.jsx
//
// Standalone, self-contained modal. No external UI library dependencies
// beyond React itself, so it can be dropped into any layout without
// affecting existing styles or components.
//
// Usage:
//   <WelcomeBetaModal open={showWelcome} onStartExploring={handleDismiss} />

import React, { useEffect, useRef } from "react";
import { BETA_FEEDBACK_URL } from "../constants/betaFeedback";

export default function WelcomeBetaModal({ open, onStartExploring }) {
  const dialogRef = useRef(null);
  const startButtonRef = useRef(null);

  // Focus the primary action when the modal opens (accessibility)
  useEffect(() => {
    if (open && startButtonRef.current) {
      startButtonRef.current.focus();
    }
  }, [open]);

  // Trap Escape key from closing without dismissal being recorded,
  // since this modal should only close via "Start Exploring".
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e) => {
      if (e.key === "Tab") {
        // Simple focus trap within the dialog
        const focusable = dialogRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable || focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  if (!open) return null;

  const handleSendFeedback = () => {
   window.open(BETA_FEEDBACK_URL, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      style={styles.overlay}
      role="presentation"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="beta-welcome-title"
        aria-describedby="beta-welcome-body"
        style={styles.dialog}
      >
        <div style={styles.scrollArea}>
          <h2 id="beta-welcome-title" style={styles.title}>
            Welcome to the Stash Snap Founding Beta
          </h2>

          <p id="beta-welcome-body" style={styles.paragraph}>
            Thank you for helping shape Stash Snap. You're one of our first
            testers, and your feedback will directly influence what we
            improve before launch.
          </p>

          <p style={styles.subheading}>Please try:</p>
          <ul style={styles.list}>
            <li>Adding fabrics and photos</li>
            <li>Editing and deleting fabrics</li>
            <li>Building and saving bundles</li>
            <li>Using the app on more than one device</li>
            <li>Reporting anything confusing or broken</li>
          </ul>

          <p style={styles.note}>
            This is beta software, so you may occasionally encounter bugs or
            unfinished details.
          </p>

          <p style={styles.signature}>
            Thank you for being part of this journey.
            <br />
            — Milinie, Founder of Stash Snap
          </p>
        </div>

        <div style={styles.buttonRow}>
          <button
            ref={startButtonRef}
            type="button"
            onClick={onStartExploring}
            style={styles.primaryButton}
          >
            Start Exploring
          </button>
          <button
            type="button"
            onClick={handleSendFeedback}
            style={styles.secondaryButton}
          >
            Send Feedback
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "16px",
    zIndex: 1000,
  },
  dialog: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    maxWidth: "480px",
    width: "100%",
    maxHeight: "90vh",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 10px 40px rgba(0, 0, 0, 0.2)",
    overflow: "hidden",
  },
  scrollArea: {
    padding: "24px 24px 8px 24px",
    overflowY: "auto",
  },
  title: {
    fontSize: "1.25rem",
    fontWeight: 700,
    margin: "0 0 12px 0",
    lineHeight: 1.3,
  },
  paragraph: {
    fontSize: "0.95rem",
    lineHeight: 1.5,
    margin: "0 0 16px 0",
  },
  subheading: {
    fontSize: "0.95rem",
    fontWeight: 600,
    margin: "0 0 8px 0",
  },
  list: {
    margin: "0 0 16px 0",
    paddingLeft: "20px",
    fontSize: "0.9rem",
    lineHeight: 1.6,
  },
  note: {
    fontSize: "0.85rem",
    fontStyle: "italic",
    color: "#555",
    margin: "0 0 16px 0",
  },
  signature: {
    fontSize: "0.9rem",
    lineHeight: 1.5,
    margin: "0 0 8px 0",
  },
  buttonRow: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    padding: "16px 24px 24px 24px",
    borderTop: "1px solid #eee",
  },
  primaryButton: {
    width: "100%",
    padding: "12px 16px",
    fontSize: "1rem",
    fontWeight: 600,
    color: "#ffffff",
    backgroundColor: "#C98580",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
  secondaryButton: {
    width: "100%",
    padding: "12px 16px",
    fontSize: "1rem",
    fontWeight: 500,
    color: "#C98580",
    backgroundColor: "transparent",
    border: "1px solid #c98580",
    borderRadius: "8px",
    cursor: "pointer",
  },
};