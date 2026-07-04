import React from "react";
import { APP_VERSION } from "../lib/constants";

// Update FEEDBACK_EMAIL if you'd rather route feedback somewhere else
// (a Google Form link works too — just swap the href).
const FEEDBACK_EMAIL = "feedback@craftingdreamsfabric.com";

export function AppFooter() {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "20px 16px 100px",
        fontFamily: "sans-serif",
        fontSize: 11,
        color: "#bbb"
      }}
    >
      <a
        href={`mailto:${FEEDBACK_EMAIL}?subject=Stash%20Snap%20Feedback`}
        style={{ color: "#999", textDecoration: "underline" }}
      >
        Send feedback
      </a>
      <span style={{ margin: "0 8px" }}>·</span>
      <span>Stash Snap {APP_VERSION} (beta)</span>
    </div>
  );
}
