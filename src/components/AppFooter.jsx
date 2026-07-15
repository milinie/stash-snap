import React from "react";
import { APP_VERSION } from "../lib/constants";
import { BETA_FEEDBACK_URL } from "../lib/betaFeedback";

export function AppFooter() {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "20px 16px 100px",
        fontFamily: "sans-serif",
        fontSize: 11,
        color: "#bbb",
      }}
    >
      <a
        href={BETA_FEEDBACK_URL}
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: "#999", textDecoration: "underline" }}
      >
        Send feedback
      </a>

      <span style={{ margin: "0 8px" }}>·</span>

      <span>Stash Snap {APP_VERSION} (beta)</span>
    </div>
  );
}