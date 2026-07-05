import React from "react";
import { PALETTE } from "../lib/constants";

export function EmptyState({ icon = "🧵", title, subtitle, actionLabel, onAction }) {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "48px 20px",
        background: "white",
        borderRadius: 16,
        border: `1.5px dashed ${PALETTE.blush}`
      }}
    >
      <div style={{ fontSize: 40, marginBottom: 8 }}>{icon}</div>
      <h3 style={{ margin: "0 0 6px", color: PALETTE.ink }}>{title}</h3>
      {subtitle && (
        <p style={{ color: "#999", fontFamily: "sans-serif", fontSize: 13, margin: "0 0 16px", maxWidth: 340, marginLeft: "auto", marginRight: "auto" }}>
          {subtitle}
        </p>
      )}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          style={{
            background: PALETTE.teal,
            color: "white",
            border: "none",
            borderRadius: 50,
            padding: "10px 20px",
            fontSize: 13,
            fontFamily: "sans-serif",
            fontWeight: 700,
            cursor: "pointer"
          }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
