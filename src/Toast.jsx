import React from "react";
import { toastStyle } from "../lib/styles";

export function Toast({ message }) {
  if (!message) return null;
  return <div style={toastStyle}>{message}</div>;
}
