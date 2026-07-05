import React from "react";
import { PALETTE } from "../lib/constants";

export function LoadingSpinner({ label = "Loading your stash..." }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "60px 20px", gap: 12 }}>
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          border: `3px solid ${PALETTE.mist}`,
          borderTopColor: PALETTE.teal,
          animation: "stashSnapSpin 0.8s linear infinite"
        }}
      />
      <p style={{ color: "#999", fontFamily: "sans-serif", fontSize: 13, margin: 0 }}>{label}</p>
      <style>{`@keyframes stashSnapSpin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
