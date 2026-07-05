import React, { useState } from "react";
import { PALETTE } from "../lib/constants";
import { pairingsForColor } from "../lib/bundleLogic";
import { cardStyle, editButtonStyle, removeButton, smallHeadingStyle, tagStyle } from "../lib/styles";
import { FabricThumb } from "./FabricThumb";

export function FabricCard({ item, onDelete, onEdit }) {
  const [expanded, setExpanded] = useState(false);
  const pairings = pairingsForColor(item.color);

  return (
    <div style={cardStyle}>
      <div onClick={() => setExpanded((value) => !value)} style={{ display: "flex", cursor: "pointer" }}>
        <FabricThumb color={item.color} style={item.style} photo={item.photo} />
        <div style={{ padding: "12px 14px", flex: 1 }}>
          <h3 style={{ fontSize: 16, color: PALETTE.ink, margin: "0 0 4px" }}>{item.name}</h3>
          <p style={{ fontSize: 12, color: "#999", fontFamily: "sans-serif", margin: 0 }}>
            {item.fabricType || "Fabric"}
            {item.pieceCount ? ` · ${item.pieceCount} pcs` : ""}
            {item.pieceSize ? ` · ${item.pieceSize}` : ""}
            {item.yardage ? ` · ${item.yardage} yds` : ""}
            {` · ${item.collection}`}
          </p>

          <div style={{ display: "flex", gap: 4, marginTop: 6 }}>
            <span style={tagStyle(PALETTE.blush, PALETTE.rose)}>✔ {item.color}</span>
            <span style={tagStyle(PALETTE.mist, PALETTE.teal)}>✔ {item.style}</span>
          </div>
        </div>
      </div>

      {expanded && (
        <div style={{ padding: "0 14px 14px", borderTop: `1px solid ${PALETTE.mist}` }}>
          <p style={{ fontSize: 13, color: "#888", fontFamily: "sans-serif", fontStyle: "italic" }}>
            {item.notes || "No notes added"}
          </p>

          <p style={smallHeadingStyle}>Add these to complete the look</p>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {pairings.map((color) => (
              <span
                key={color}
                style={{ background: PALETTE.mist, padding: "3px 10px", borderRadius: 99, fontSize: 12, fontFamily: "sans-serif" }}
              >
                ➕ {color}
              </span>
            ))}
          </div>

          <button onClick={() => onEdit(item)} style={editButtonStyle}>Edit ✏️</button>
          <button onClick={() => onDelete(item.id)} style={removeButton}>Remove</button>
        </div>
      )}
    </div>
  );
}
