import { PALETTE, APP_WIDTH } from "./constants";

export const contentWrap = { width: "100%", maxWidth: APP_WIDTH, margin: "0 auto", paddingLeft: 16, paddingRight: 16, boxSizing: "border-box" };
export const contentWrapNoPadding = { width: "100%", maxWidth: APP_WIDTH, margin: "0 auto", display: "flex" };
export const headerStyle = { background: `linear-gradient(160deg, ${PALETTE.teal} 0%, #3a6b5e 100%)`, padding: "48px 0 28px" };
export const eyebrowStyle = { color: "rgba(255,255,255,0.6)", fontSize: 11, fontFamily: "sans-serif", letterSpacing: 3, textTransform: "uppercase", margin: "0 0 4px" };
export const statBoxStyle = { background: "rgba(255,255,255,0.12)", borderRadius: 12, padding: "10px 14px", flex: 1, textAlign: "center" };
export const searchStyle = { width: "100%", padding: "12px 16px", border: `1.5px solid ${PALETTE.blush}`, borderRadius: 50, fontSize: 14, fontFamily: "sans-serif", background: "white", boxSizing: "border-box", marginBottom: 12 };
export const cardStyle = { background: "white", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 12px rgba(44,44,44,0.07)", marginBottom: 12 };
export const modalOverlay = { position: "fixed", inset: 0, background: "rgba(44,44,44,0.75)", zIndex: 90, display: "flex", alignItems: "flex-end", justifyContent: "center" };
export const modalBox = { background: PALETTE.cream, borderRadius: "24px 24px 0 0", padding: "28px 24px 40px", width: "100%", maxWidth: APP_WIDTH, maxHeight: "90vh", overflowY: "auto", fontFamily: "Georgia, serif", boxSizing: "border-box" };
export const labelStyle = { fontSize: 11, fontFamily: "sans-serif", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "#999", display: "block", marginBottom: 6 };
export const inputStyle = { width: "100%", padding: 12, border: `1.5px solid ${PALETTE.blush}`, borderRadius: 10, fontSize: 15, background: "white", boxSizing: "border-box", fontFamily: "Georgia, serif", outline: "none", marginBottom: 16 };
export const smallHeadingStyle = { fontSize: 11, fontFamily: "sans-serif", fontWeight: 700, color: "#bbb", textTransform: "uppercase", letterSpacing: 1, margin: "0 0 6px" };
export const editButtonStyle = { marginTop: 12, marginRight: 8, border: "1px solid #ddd", background: "white", color: PALETTE.ink, borderRadius: 8, padding: "6px 14px" };
export const removeButton = { marginTop: 12, border: "1px solid #f0c8c0", background: "none", color: PALETTE.rose, borderRadius: 8, padding: "6px 14px" };
export const shopBoxStyle = { background: `linear-gradient(135deg, ${PALETTE.blush}, ${PALETTE.cloud})`, borderRadius: 20, padding: 24, textAlign: "center" };
export const shopButtonStyle = { display: "inline-block", background: PALETTE.teal, color: "white", padding: "12px 24px", borderRadius: 50, textDecoration: "none", fontFamily: "sans-serif", fontWeight: 700 };
export const floatingButtonStyle = { position: "fixed", bottom: 28, left: "50%", transform: "translateX(-50%)", background: `linear-gradient(135deg, ${PALETTE.teal}, ${PALETTE.sage})`, color: "white", border: "none", borderRadius: 50, padding: "18px 32px", fontSize: 17, boxShadow: "0 6px 28px rgba(74,124,111,0.45)", fontFamily: "sans-serif", fontWeight: 700, zIndex: 50 };
export const toastStyle = { position: "fixed", top: 24, left: "50%", transform: "translateX(-50%)", background: PALETTE.ink, color: "white", padding: "12px 24px", borderRadius: 50, fontSize: 14, fontFamily: "sans-serif", zIndex: 200 };
export const autoButtonStyle = { background: PALETTE.teal, color: "white", border: "none", borderRadius: 50, padding: "12px 18px", fontSize: 14, fontFamily: "sans-serif", fontWeight: 700, marginBottom: 16 };
export const designWallBoxStyle = { background: "white", borderRadius: 16, padding: 16, marginBottom: 16 };
export const designWallGridStyle = { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(70px, 1fr))", gap: 8 };
export const wallRemoveButtonStyle = { position: "absolute", top: -6, right: -6, background: "white", borderRadius: "50%", border: "1px solid #ddd", cursor: "pointer" };
export const clearWallButtonStyle = { marginTop: 12, background: "none", border: "1px solid #ddd", borderRadius: 8, padding: "6px 12px" };
export const saveBundleButtonStyle = { marginTop: 10, marginLeft: 8, background: PALETTE.rose, color: "white", border: "none", borderRadius: 8, padding: "8px 12px", fontSize: 13, cursor: "pointer" };
export const addWallButtonStyle = { background: PALETTE.teal, color: "white", border: "none", borderRadius: 8, padding: "6px 12px", fontSize: 12, cursor: "pointer" };
export const missingItemStyle = { background: "#fff4df", padding: "8px 12px", borderRadius: 10, fontSize: 12, fontFamily: "sans-serif", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 };
export const miniButtonStyle = { fontSize: 11, padding: "4px 8px", borderRadius: 6, border: "1px solid #ddd", background: "white", cursor: "pointer" };
export const saveModalButtonStyle = { width: "100%", border: "none", borderRadius: 50, padding: 16, fontSize: 17, color: "white", background: `linear-gradient(135deg, ${PALETTE.teal}, ${PALETTE.sage})`, marginTop: 8 };
export const cancelModalButtonStyle = { width: "100%", border: "1px solid #ddd", borderRadius: 50, padding: 14, fontSize: 15, background: "white", color: PALETTE.ink, marginTop: 10 };

export function tabStyle(active) {
  return {
    flex: 1,
    padding: "14px 8px",
    background: "none",
    border: "none",
    fontSize: 12,
    fontFamily: "sans-serif",
    fontWeight: 700,
    color: active ? PALETTE.teal : "#bbb",
    borderBottom: `2px solid ${active ? PALETTE.teal : "transparent"}`
  };
}

export function pillStyle(active, color) {
  return {
    padding: "6px 12px",
    borderRadius: 99,
    border: `1.5px solid ${active ? color : PALETTE.blush}`,
    background: active ? color : "white",
    color: active ? "white" : PALETTE.ink,
    fontSize: 13,
    cursor: "pointer",
    whiteSpace: "nowrap",
    fontFamily: "sans-serif"
  };
}

export function tagStyle(background, color) {
  return {
    background,
    color,
    padding: "3px 9px",
    borderRadius: 99,
    fontSize: 11,
    fontFamily: "sans-serif"
  };
}
