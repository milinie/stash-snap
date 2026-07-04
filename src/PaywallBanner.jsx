import React from "react";
import { PALETTE, FREE_TIER_FABRIC_LIMIT } from "../lib/constants";

export function PaywallBanner({ variant = "limit", onUpgrade, count }) {
  const copy =
    variant === "limit"
      ? {
          title: `You've reached the free limit of ${FREE_TIER_FABRIC_LIMIT} fabrics`,
          body: "Upgrade to Stash Snap Plus for unlimited fabrics, cloud sync across devices, and photo backup."
        }
      : {
          title: "Sync your stash everywhere",
          body: `You have ${count} fabric${count === 1 ? "" : "s"} saved on this device only. Upgrade to back it up and access it on your phone, tablet, or laptop.`
        };

  return (
    <div
      style={{
        background: `linear-gradient(135deg, ${PALETTE.teal}, ${PALETTE.sage})`,
        color: "white",
        borderRadius: 16,
        padding: 18,
        marginBottom: 16
      }}
    >
      <h3 style={{ margin: "0 0 6px", fontSize: 16 }}>{copy.title}</h3>
      <p style={{ margin: "0 0 12px", fontSize: 13, fontFamily: "sans-serif", opacity: 0.9 }}>{copy.body}</p>
      <button
        onClick={onUpgrade}
        style={{
          background: "white",
          color: PALETTE.teal,
          border: "none",
          borderRadius: 50,
          padding: "10px 20px",
          fontSize: 13,
          fontFamily: "sans-serif",
          fontWeight: 700,
          cursor: "pointer"
        }}
      >
        Upgrade to Plus →
      </button>
    </div>
  );
}
