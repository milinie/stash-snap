import React from "react";
import { getColorHex } from "../lib/bundleLogic";

export function FabricThumb({ color, style, photo, size = 76 }) {
  if (photo) {
    return (
      <img
        src={photo}
        alt="Fabric"
        style={{ width: size, height: size, objectFit: "cover", display: "block" }}
      />
    );
  }

  return (
    <svg width={size} height={size} viewBox="0 0 48 48">
      <rect width="48" height="48" fill={getColorHex(color)} />
      <rect x="8" y="8" width="32" height="32" fill="white" opacity="0.15" rx="2" />
    </svg>
  );
}
