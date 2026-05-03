import { useEffect, useMemo, useState } from "react”;
// ─── Constants ────────────────────────────────────────────────────────────────
const PALETTE = {
cream: "#FAF6F0”,
blush: "#F2D5C8”,
rose:  "#C97B6E”,
sage:  "#8FAF8A”,
teal:  "#4A7C6F”,
ink:   "#2C2C2C”,
mist:  "#E8EEE7”,
honey: "#D4A853”,
cloud: "#E8E4EE”,
};
const STYLE_TAGS  = ["Floral”, "Geometric”, "Solid”, "Stripe”, "Blender”, "Vintage”];
const COLOR_TAGS  = ["Sage”, "Rose”, "Cream”, "Navy”, "Honey”, "Lavender”, "Teal”, "Blush”, "Cloud”];
const COLLECTIONS = ["My Stash”, "Current Project”, "Gifted”, "Shop Sample”, "Fat Quarters”];
const SAMPLE_STASH = [
{ id: 1, name: "Garden Party Floral”, color: "Rose”,  style: "Floral”,    yardage: 2.5, collection: "Current Project”, notes: "For quilt border”,  photo: null, date: "Apr 28” },
{ id: 2, name: "Sage Blender”,        color: "Sage”,  style: "Blender”,   yardage: 1,   collection: "My Stash”,        notes: "”,                  photo: null, date: "Apr 20” },
{ id: 3, name: "Honey Geometric”,     color: "Honey”, style: "Geometric”, yardage: 3,   collection: "Fat Quarters”,    notes: "Lori Holt style”,   photo: null, date: "Apr 15” },
{ id: 4, name: "Cloud Stripe”,        color: "Cloud”, style: "Stripe”,    yardage: 0.5, collection: "My Stash”,        notes: "Sashing fabric”,    photo: null, date: "Apr 10” },
];
const BUNDLE_SUGGESTIONS = {
Rose:     ["Sage”, "Cream”, "Honey”, "Cloud”],
Sage:     ["Rose”, "Honey”, "Cream”, "Blush”],
Honey:    ["Teal”, "Cream”, "Rose”, "Sage”],
Teal:     ["Honey”, "Cream”, "Blush”, "Lavender”],
Lavender: ["Blush”, "Cloud”, "Cream”, "Sage”],
Navy:     ["Cream”, "Rose”, "Honey”, "Cloud”],
Blush:    ["Sage”, "Lavender”, "Cream”, "Cloud”],
Cloud:    ["Rose”, "Sage”, "Cream”, "Honey”],
Cream:    ["Rose”, "Sage”, "Honey”, "Cloud”],
};
// ─── localStorage helpers ─────────────────────────────────────────────────────
function lsGet(key, fallback) {
try {
const raw = localStorage.getItem(key);
return raw ? JSON.parse(raw) : fallback;
} catch {
return fallback;
}
}
function lsSet(key, value) {
try {
localStorage.setItem(key, JSON.stringify(value));
} catch (e) {
console.warn("localStorage.setItem failed:”, e);
}
}
// ─── Utility helpers ──────────────────────────────────────────────────────────
function getColorHex(color) {
const map = {
Rose: "#C97B6E”, Sage: "#8FAF8A”, Cream: "#FAF0D7”, Navy: "#2E4057”,
Honey: "#D4A853”, Lavender: "#B8A8C8”, Teal: "#4A7C6F”, Blush: "#F2D5C8”, Cloud: "#E8E4EE”,
};
return map[color] || "#DDD”;
}
function todayLabel() {
return new Date().toLocaleDateString("en-US”, { month: "short”, day: "numeric” });
}
function compressImage(file, maxWidth = 700, quality = 0.65) {
return new Promise((resolve, reject) => {
const reader = new FileReader();
reader.onload = (e) => {
const img = new Image();
img.onload = () => {
const scale = Math.min(1, maxWidth / img.width);
const canvas = document.createElement("canvas”);
canvas.width  = img.width  * scale;
canvas.height = img.height * scale;
canvas.getContext("2d”).drawImage(img, 0, 0, canvas.width, canvas.height);
resolve(canvas.toDataURL("image/jpeg”, quality));
};
img.onerror = reject;
img.src = e.target.result;
};
reader.onerror = reject;
reader.readAsDataURL(file);
});
}
function autoBuildBundle(stash) {
const pick = (pred) => stash.find(pred);
const candidates = [
pick((i) => i.style === "Floral”),
pick((i) => i.style === "Blender”),
pick((i) => i.style === "Solid”) || pick((i) => i.style === "Stripe”),
pick((i) => ["Cream”, "Cloud”, "Blush”].includes(i.color)),
pick((i) => ["Honey”, "Teal”, "Navy”, "Sage”, "Rose”].includes(i.color)),
];
return candidates
.filter(Boolean)
.filter((item, idx, arr) => arr.findIndex((x) => x.id === item.id) === idx)
.slice(0, 5);
}
function analyzeBundle(wall) {
const styles = wall.map((f) => f.style);
const colors = wall.map((f) => f.color);
const missing = [];
if (!styles.includes("Floral”))                                           missing.push("Focal Print”);
if (!styles.includes("Blender”))                                          missing.push("Blender”);
if (!styles.includes("Solid”) && !styles.includes("Stripe”))             missing.push("Solid or Stripe”);
if (!colors.some((c) => ["Cream”, "Cloud”, "Blush”].includes(c)))        missing.push("Light Neutral”);
if (!colors.some((c) => ["Honey”, "Teal”, "Navy”, "Rose”, "Sage”].includes(c))) missing.push("Contrast Color”);
return missing;
}
function missingToFilter(m) {
if (m === "Blender”)       return "Blender”;
if (m === "Focal Print”)   return "Floral”;
if (m === "Solid or Stripe”) return "Solid”;
return null;
}
// ─── FabricThumb ──────────────────────────────────────────────────────────────
function FabricThumb({ color, style, photo, size = 76 }) {
if (photo) {
return (
<img
src={photo}
alt="Fabric”
style={{ width: size, height: size, objectFit: "cover”, display: "block” }}
/>
);
}
const bg = getColorHex(color);
return (
<svg width={size} height={size} viewBox="0 0 48 48">
<rect width="48" height="48" fill={bg} />
```
  {style === "Floral" &&
    [{ x: 12, y: 12 }, { x: 36, y: 12 }, { x: 24, y: 30 }, { x: 8, y: 38 }, { x: 40, y: 38 }].map((p, i) => (
      <g key={i} transform={`translate(${p.x},${p.y})`}>
        {[0, 60, 120, 180, 240, 300].map((a) => (
          <ellipse key={a} rx="3.5" ry="1.5" transform={`rotate(${a})`} fill="white" opacity="0.6" />
        ))}
        <circle r="2" fill="white" opacity="0.8" />
      </g>
    ))}
  {style === "Geometric" &&
    [0, 1, 2, 3].map((row) =>
      [0, 1, 2, 3].map((col) => (
        <polygon
          key={`${row}-${col}`}
          points={`${col * 12 + 6},${row * 12 + 2} ${col * 12 + 10},${row * 12 + 10} ${col * 12 + 2},${row * 12 + 10}`}
          fill="white"
          opacity="0.25"
        />
      ))
    )}
  {style === "Stripe" &&
    [4, 12, 20, 28, 36, 44].map((x) => (
      <rect key={x} x={x - 2} y="0" width="4" height="48" fill="white" opacity="0.25" />
    ))}
  {style === "Blender" &&
    Array.from({ length: 20 }).map((_, i) => (
      <circle
        key={i}
        cx={Math.sin(i * 2.3) * 18 + 24}
        cy={Math.cos(i * 1.7) * 18 + 24}
        r="2"
        fill="white"
        opacity="0.22"
      />
    ))}
  {(style === "Solid" || style === "Vintage") && (
    <rect x="8" y="8" width="32" height="32" fill="white" opacity="0.12" rx="2" />
  )}
</svg>
```
);
}
// ─── AddModal (add & edit) ────────────────────────────────────────────────────
function AddModal({ onSave, onClose, initialData }) {
const isEdit = Boolean(initialData);
const [form, setForm] = useState({
id:         initialData?.id         ?? undefined,
date:       initialData?.date       ?? undefined,
name:       initialData?.name       ?? "”,
color:      initialData?.color      ?? "Rose”,
style:      initialData?.style      ?? "Floral”,
yardage:    initialData             ? String(initialData.yardage) : "”,
collection: initialData?.collection ?? "My Stash”,
notes:      initialData?.notes      ?? "”,
photo:      initialData?.photo      ?? null,
});
const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));
const handlePhoto = async (e) => {
const file = e.target.files?.[0];
if (!file) return;
try {
update("photo”, await compressImage(file));
} catch {
alert("That photo could not be added. Try a smaller image.”);
}
};
const canSave = form.name.trim() !== "” && String(form.yardage).trim() !== "”;
const handleSubmit = () => {
onSave({
...form,
id:      form.id   || Date.now(),
date:    form.date || todayLabel(),
yardage: parseFloat(form.yardage) || 0,
});
};
return (
<div style={modalOverlay}>
<div style={modalBox}>
<h2 style={{ margin: "0 0 20px” }}>{isEdit ? "Edit Fabric” : "Add Fabric”}</h2>
```
    <label style={labelStyle}>Fabric Photo</label>
    <input type="file" accept="image/*" onChange={handlePhoto} style={{ marginBottom: 16 }} />
    {form.photo && (
      <div style={{ borderRadius: 14, overflow: "hidden", width: 96, height: 96, marginBottom: 16 }}>
        <FabricThumb photo={form.photo} size={96} />
      </div>
    )}
    <label style={labelStyle}>Fabric Name</label>
    <input
      value={form.name}
      onChange={(e) => update("name", e.target.value)}
      placeholder="Example: Sage Floral"
      style={inputStyle}
    />
    <label style={labelStyle}>Yardage</label>
    <input
      value={form.yardage}
      onChange={(e) => update("yardage", e.target.value)}
      placeholder="Example: 2.5"
      inputMode="decimal"
      style={inputStyle}
    />
    <label style={labelStyle}>Color</label>
    <select value={form.color} onChange={(e) => update("color", e.target.value)} style={inputStyle}>
      {COLOR_TAGS.map((c) => <option key={c} value={c}>{c}</option>)}
    </select>
    <label style={labelStyle}>Style</label>
    <select value={form.style} onChange={(e) => update("style", e.target.value)} style={inputStyle}>
      {STYLE_TAGS.map((s) => <option key={s} value={s}>{s}</option>)}
    </select>
    <label style={labelStyle}>Collection</label>
    <select value={form.collection} onChange={(e) => update("collection", e.target.value)} style={inputStyle}>
      {COLLECTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
    </select>
    <label style={labelStyle}>Notes</label>
    <textarea
      value={form.notes}
      onChange={(e) => update("notes", e.target.value)}
      rows={3}
      style={{ ...inputStyle, resize: "none" }}
    />
    <button disabled={!canSave} onClick={handleSubmit} style={saveModalButtonStyle}>
      {isEdit ? "Save Changes" : "Save Fabric"}
    </button>
    <button onClick={onClose} style={cancelModalButtonStyle}>Cancel</button>
  </div>
</div>
```
);
}
// ─── FabricCard ───────────────────────────────────────────────────────────────
function FabricCard({ item, onDelete, onEdit }) {
const [expanded, setExpanded] = useState(false);
const pairings = (BUNDLE_SUGGESTIONS[item.color] || ["Cream”, "Sage”, "Cloud”, "Honey”]).slice(0, 4);
return (
<div style={cardStyle}>
<div onClick={() => setExpanded((v) => !v)} style={{ display: "flex”, cursor: "pointer” }}>
<div style={{ flexShrink: 0 }}>
<FabricThumb color={item.color} style={item.style} photo={item.photo} />
</div>
<div style={{ padding: "12px 14px”, flex: 1 }}>
<h3 style={{ fontSize: 16, color: PALETTE.ink, margin: "0 0 4px” }}>{item.name}</h3>
<p style={{ fontSize: 12, color: "#999”, fontFamily: "sans-serif”, margin: 0 }}>
{item.yardage} yds · {item.collection}
</p>
<div style={{ display: "flex”, gap: 4, marginTop: 6 }}>
<span style={tagStyle(PALETTE.blush, PALETTE.rose)}>✔ {item.color}</span>
<span style={tagStyle(PALETTE.mist,  PALETTE.teal)}>✔ {item.style}</span>
</div>
</div>
</div>
```
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
      <button onClick={() => onEdit(item)}      style={editButtonStyle}>Edit ✏️</button>
      <button onClick={() => onDelete(item.id)} style={removeButton}>Remove</button>
    </div>
  )}
</div>
```
);
}
// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
// Initialise state directly from localStorage so data is available on first render
const [stash, setStash]               = useState(() => lsGet("stash-snap-data”, SAMPLE_STASH));
const [savedBundles, setSavedBundles] = useState(() => lsGet("saved-bundles”,   []));
const [activeTab,             setActiveTab]             = useState("stash”);
const [adding,                setAdding]                = useState(false);
const [editingItem,           setEditingItem]           = useState(null);
const [filterStyle,           setFilterStyle]           = useState(null);
const [bundleFilter,          setBundleFilter]          = useState(null);
const [bundleSearch,          setBundleSearch]          = useState(””);
const [bundleColorFilter,     setBundleColorFilter]     = useState(null);
const [bundleCollectionFilter,setBundleCollectionFilter]= useState(null);
const [designWall,            setDesignWall]            = useState([]);
const [search,                setSearch]                = useState(””);
const [toast,                 setToast]                 = useState(null);
useEffect(() => {
document.body.style.margin     = "0”;
document.body.style.background = PALETTE.cream;
}, []);
// Persist stash whenever it changes
useEffect(() => { lsSet("stash-snap-data”, stash); },        [stash]);
// Persist bundles whenever they change
useEffect(() => { lsSet("saved-bundles”,   savedBundles); }, [savedBundles]);
// ── Derived values ─────────────────────────────────────────────────────────
const totalYards  = useMemo(() => stash.reduce((s, i) => s + i.yardage, 0), [stash]);
const collections = useMemo(() => [...new Set(stash.map((i) => i.collection))],   [stash]);
const missing     = analyzeBundle(designWall);
const filtered = stash.filter((item) => {
const hay = [item.name, item.color, item.style, item.collection, item.notes, String(item.yardage)].join(” ").toLowerCase();
if (filterStyle && item.style !== filterStyle)              return false;
if (search       && !hay.includes(search.toLowerCase()))   return false;
return true;
});
const bundleFiltered = stash.filter((item) => {
const hay = [item.name, item.color, item.style, item.collection, item.notes, String(item.yardage)].join(” ").toLowerCase();
if (bundleFilter           && item.style      !== bundleFilter)           return false;
if (bundleColorFilter      && item.color      !== bundleColorFilter)      return false;
if (bundleCollectionFilter && item.collection !== bundleCollectionFilter) return false;
if (bundleSearch           && !hay.includes(bundleSearch.toLowerCase()))  return false;
return true;
});
// ── Handlers ───────────────────────────────────────────────────────────────
const showToast = (msg) => {
setToast(msg);
setTimeout(() => setToast(null), 2500);
};
/** Add a brand-new fabric */
const handleSave = (form) => {
setStash((prev) => [
{ ...form, id: Date.now(), date: todayLabel(), yardage: Number(form.yardage) || 0 },
...prev,
]);
setAdding(false);
showToast("✅ Added to your stash!”);
};
/** Update an existing fabric by id */
const handleUpdate = (form) => {
const updated = { ...form, yardage: Number(form.yardage) || 0 };
setStash((prev)       => prev.map((i) => i.id === updated.id ? updated : i));
setDesignWall((prev)  => prev.map((i) => i.id === updated.id ? updated : i));
setEditingItem(null);
showToast("✏️ Fabric updated!”);
};
const handleDelete = (id) => {
setStash((prev)      => prev.filter((i) => i.id !== id));
setDesignWall((prev) => prev.filter((i) => i.id !== id));
showToast("Removed from stash”);
};
const handleSaveBundle = () => {
if (designWall.length === 0) { showToast("Add fabrics to the wall first”); return; }
setSavedBundles((prev) => [
{ id: Date.now(), name: `Bundle ${todayLabel()}`, fabrics: designWall },
...prev,
]);
showToast("✨ Bundle saved!”);
};
const handleDeleteBundle = (id) => {
setSavedBundles((prev) => prev.filter((b) => b.id !== id));
showToast("Bundle deleted”);
};
// ── Render ─────────────────────────────────────────────────────────────────
return (
<div style={{ minHeight: "100vh”, background: PALETTE.cream, fontFamily: "Georgia, serif”, width: "100%” }}>
```
  {/* ── Header ── */}
  <header style={headerStyle}>
    <div style={contentWrap}>
      <p style={eyebrowStyle}>Crafting Dreams Fabric</p>
      <h1 style={{ color: "white", fontSize: 34, margin: "0 0 4px" }}>Stash Snap 📸</h1>
      <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 14, margin: "0 0 24px", fontStyle: "italic" }}>
        Snap · Identify · Organize
      </p>
      <div style={{ display: "flex", gap: 12 }}>
        {[
          { label: `${stash.length} Fabrics`,           icon: "🧵" },
          { label: `${totalYards.toFixed(1)} Yards`,    icon: "📏" },
          { label: `${collections.length} Collections`, icon: "📂" },
        ].map((stat) => (
          <div key={stat.label} style={statBoxStyle}>
            <div style={{ fontSize: 18 }}>{stat.icon}</div>
            <div style={{ color: "white", fontSize: 11, fontFamily: "sans-serif", marginTop: 2 }}>{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  </header>
  {/* ── Nav ── */}
  <nav style={{ background: "white", borderBottom: `1px solid ${PALETTE.blush}` }}>
    <div style={contentWrapNoPadding}>
      {[["stash","My Stash"],["bundles","Build Bundle"],["saved","Saved Bundles"],["shop","Shop Match"]].map(([id, label]) => (
        <button key={id} onClick={() => setActiveTab(id)} style={tabStyle(activeTab === id)}>{label}</button>
      ))}
    </div>
  </nav>
  {/* ── Main ── */}
  <main style={{ ...contentWrap, paddingTop: 20, paddingBottom: 120 }}>
    {/* MY STASH */}
    {activeTab === "stash" && (
      <>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="🔍 Search your stash..."
          style={searchStyle}
        />
        <div style={{ display: "flex", gap: 6, overflowX: "auto", marginBottom: 16 }}>
          <button onClick={() => setFilterStyle(null)} style={pillStyle(!filterStyle, PALETTE.teal)}>All</button>
          {["Floral", "Geometric", "Blender", "Vintage", "Solid"].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStyle(filterStyle === s ? null : s)}
              style={pillStyle(filterStyle === s, PALETTE.rose)}
            >
              {s}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map((item) => (
            <FabricCard key={item.id} item={item} onDelete={handleDelete} onEdit={setEditingItem} />
          ))}
          {filtered.length === 0 && (
            <p style={{ color: "#bbb", fontFamily: "sans-serif", textAlign: "center", paddingTop: 32 }}>
              No fabrics match your search.
            </p>
          )}
        </div>
      </>
    )}
    {/* BUILD BUNDLE */}
    {activeTab === "bundles" && (
      <div>
        <h2>Build Your Bundle 🎨</h2>
        <p style={{ color: "#999", fontFamily: "sans-serif" }}>
          Tap fabrics to add them to your design wall, or let Stash Snap suggest a balanced bundle.
        </p>
        <button onClick={() => setDesignWall(autoBuildBundle(stash))} style={autoButtonStyle}>
          ✨ Auto Build Bundle
        </button>
        {designWall.length > 0 && (
          <div style={designWallBoxStyle}>
            <h3 style={{ marginBottom: 10 }}>Design Wall</h3>
            <p style={{ fontSize: 12, color: "#999", fontFamily: "sans-serif", marginTop: 0 }}>
              Tip: A balanced bundle includes a focal print, a blender, a light fabric, and a contrast color.
            </p>
            <div style={designWallGridStyle}>
              {designWall.map((item) => (
                <div key={item.id} style={{ position: "relative" }}>
                  <FabricThumb {...item} size={70} />
                  <button
                    onClick={() => setDesignWall((prev) => prev.filter((f) => f.id !== item.id))}
                    style={wallRemoveButtonStyle}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            {missing.length > 0 && (
              <div style={{ marginTop: 10 }}>
                <p style={smallHeadingStyle}>To improve this bundle</p>
                <div style={{ display: "flex", gap: 8, flexDirection: "column" }}>
                  {missing.map((m) => (
                    <div key={m} style={missingItemStyle}>
                      <span>➕ {m}</span>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          onClick={() => { const f = missingToFilter(m); if (f) setBundleFilter(f); }}
                          style={miniButtonStyle}
                        >
                          Find in Stash
                        </button>
                        <a
                          href={`https://craftingdreamsfabric.com/search?q=${encodeURIComponent(m)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={miniShopButtonStyle}
                        >
                          Shop →
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <button onClick={() => setDesignWall([])}  style={clearWallButtonStyle}>Clear Wall</button>
            <button onClick={handleSaveBundle}          style={saveBundleButtonStyle}>💾 Save This Bundle</button>
          </div>
        )}
        {/* Filters */}
        <input
          value={bundleSearch}
          onChange={(e) => setBundleSearch(e.target.value)}
          placeholder="🔍 Search by name, notes, color, style..."
          style={searchStyle}
        />
        <p style={smallHeadingStyle}>Filter by color</p>
        <div style={{ display: "flex", gap: 6, overflowX: "auto", marginBottom: 12 }}>
          <button onClick={() => setBundleColorFilter(null)} style={pillStyle(!bundleColorFilter, PALETTE.teal)}>All</button>
          {COLOR_TAGS.map((c) => (
            <button key={c} onClick={() => setBundleColorFilter(bundleColorFilter === c ? null : c)} style={pillStyle(bundleColorFilter === c, PALETTE.teal)}>{c}</button>
          ))}
        </div>
        <p style={smallHeadingStyle}>Filter by style</p>
        <div style={{ display: "flex", gap: 6, overflowX: "auto", marginBottom: 12 }}>
          <button onClick={() => setBundleFilter(null)} style={pillStyle(!bundleFilter, PALETTE.rose)}>All</button>
          {STYLE_TAGS.map((s) => (
            <button key={s} onClick={() => setBundleFilter(bundleFilter === s ? null : s)} style={pillStyle(bundleFilter === s, PALETTE.rose)}>{s}</button>
          ))}
        </div>
        <p style={smallHeadingStyle}>Filter by collection</p>
        <div style={{ display: "flex", gap: 6, overflowX: "auto", marginBottom: 16 }}>
          <button onClick={() => setBundleCollectionFilter(null)} style={pillStyle(!bundleCollectionFilter, PALETTE.honey)}>All</button>
          {COLLECTIONS.map((c) => (
            <button key={c} onClick={() => setBundleCollectionFilter(bundleCollectionFilter === c ? null : c)} style={pillStyle(bundleCollectionFilter === c, PALETTE.honey)}>{c}</button>
          ))}
        </div>
        {bundleFiltered.map((item) => (
          <div key={item.id} style={cardStyle}>
            <div style={{ display: "flex", padding: 12 }}>
              <FabricThumb {...item} />
              <div style={{ marginLeft: 12, flex: 1 }}>
                <strong>{item.name}</strong>
                <p style={{ fontSize: 12, color: "#999", margin: "4px 0 8px" }}>{item.color} · {item.yardage} yds</p>
                <button
                  onClick={() => setDesignWall((prev) => prev.find((f) => f.id === item.id) ? prev : [...prev, item])}
                  style={addWallButtonStyle}
                >
                  {designWall.find((f) => f.id === item.id) ? "Added ✓" : "Add to Wall"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    )}
    {/* SAVED BUNDLES */}
    {activeTab === "saved" && (
      <div>
        <h2>Saved Bundles 💾</h2>
        <p style={{ color: "#999", fontFamily: "sans-serif" }}>
          Review the fabric bundles you've saved from your design wall.
        </p>
        {savedBundles.length === 0 && (
          <div style={cardStyle}>
            <p style={{ padding: 16, color: "#999", fontFamily: "sans-serif", margin: 0 }}>
              No saved bundles yet. Build a bundle, then tap "Save This Bundle."
            </p>
          </div>
        )}
        {savedBundles.map((bundle) => (
          <div key={bundle.id} style={cardStyle}>
            <div style={{ padding: 16 }}>
              <h3 style={{ marginTop: 0 }}>{bundle.name}</h3>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
                {bundle.fabrics.map((f) => <FabricThumb key={f.id} {...f} size={64} />)}
              </div>
              <p style={{ color: "#999", fontFamily: "sans-serif", fontSize: 12 }}>
                {bundle.fabrics.length} fabrics · {bundle.fabrics.reduce((s, f) => s + f.yardage, 0).toFixed(1)} yards
              </p>
              <button
                onClick={() => { setDesignWall(bundle.fabrics); setActiveTab("bundles"); showToast("Bundle loaded to design wall"); }}
                style={addWallButtonStyle}
              >
                Open in Design Wall
              </button>
              <button onClick={() => handleDeleteBundle(bundle.id)} style={{ ...removeButton, marginLeft: 8 }}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    )}
    {/* SHOP MATCH */}
    {activeTab === "shop" && (
      <div>
        <h2>Shop Your Perfect Match 🛍️</h2>
        <p style={{ color: "#999", fontFamily: "sans-serif" }}>
          Find fabrics that pair beautifully with what you already have.
        </p>
        <div style={shopBoxStyle}>
          <div style={{ fontSize: 40 }}>🧵</div>
          <h3>Complete Your Quilt</h3>
          <p style={{ fontFamily: "sans-serif", color: "#777" }}>
            You're closer than you think. Shop fabrics that help round out your bundle.
          </p>
          <a
            href="https://craftingdreamsfabric.com"
            target="_blank"
            rel="noopener noreferrer"
            style={shopButtonStyle}
          >
            Shop Matching Fabrics →
          </a>
        </div>
      </div>
    )}
  </main>
  {/* ── FAB ── */}
  <button onClick={() => setAdding(true)} style={floatingButtonStyle}>＋ Add Fabric</button>
  {/* ── Modals ── */}
  {adding      && <AddModal onSave={handleSave}   onClose={() => setAdding(false)}      />}
  {editingItem && <AddModal onSave={handleUpdate} onClose={() => setEditingItem(null)} initialData={editingItem} />}
  {/* ── Toast ── */}
  {toast && <div style={toastStyle}>{toast}</div>}
</div>
```
);
}
// ─── Styles ───────────────────────────────────────────────────────────────────
const APP_WIDTH = 760;
const contentWrap = {
width: "100%”, maxWidth: APP_WIDTH, margin: "0 auto”,
paddingLeft: 16, paddingRight: 16, boxSizing: "border-box”,
};
const contentWrapNoPadding = {
width: "100%”, maxWidth: APP_WIDTH, margin: "0 auto”, display: "flex”,
};
const headerStyle = {
background: `linear-gradient(160deg, ${PALETTE.teal} 0%, #3a6b5e 100%)`,
padding: "48px 0 28px”,
};
const eyebrowStyle = {
color: "rgba(255,255,255,0.6)”, fontSize: 11, fontFamily: "sans-serif”,
letterSpacing: 3, textTransform: "uppercase”, margin: "0 0 4px”,
};
const statBoxStyle = {
background: "rgba(255,255,255,0.12)”, borderRadius: 12,
padding: "10px 14px”, flex: 1, textAlign: "center”,
};
function tabStyle(active) {
return {
flex: 1, padding: "14px 8px”, background: "none”, border: "none”,
fontSize: 12, fontFamily: "sans-serif”, fontWeight: 700, cursor: "pointer”,
color: active ? PALETTE.teal : "#bbb”,
borderBottom: `2px solid ${active ? PALETTE.teal : "transparent"}`,
};
}
const searchStyle = {
width: "100%”, padding: "12px 16px”,
border: `1.5px solid ${PALETTE.blush}`, borderRadius: 50,
fontSize: 14, fontFamily: "sans-serif”, background: "white”,
boxSizing: "border-box”, marginBottom: 12,
};
const cardStyle = {
background: "white”, borderRadius: 16, overflow: "hidden”,
boxShadow: "0 2px 12px rgba(44,44,44,0.07)”, marginBottom: 12,
};
const modalOverlay = {
position: "fixed”, inset: 0, background: "rgba(44,44,44,0.75)”,
zIndex: 90, display: "flex”, alignItems: "flex-end”, justifyContent: "center”,
};
const modalBox = {
background: PALETTE.cream, borderRadius: "24px 24px 0 0”,
padding: "28px 24px 40px”, width: "100%”, maxWidth: APP_WIDTH,
maxHeight: "90vh”, overflowY: "auto”, fontFamily: "Georgia, serif”,
boxSizing: "border-box”,
};
const labelStyle = {
fontSize: 11, fontFamily: "sans-serif”, fontWeight: 700,
textTransform: "uppercase”, letterSpacing: 1, color: "#999”,
display: "block”, marginBottom: 6,
};
const inputStyle = {
width: "100%”, padding: 12, border: `1.5px solid ${PALETTE.blush}`,
borderRadius: 10, fontSize: 15, background: "white”, boxSizing: "border-box”,
fontFamily: "Georgia, serif”, outline: "none”, marginBottom: 16,
};
function pillStyle(active, color) {
return {
padding: "6px 12px”, borderRadius: 99,
border: `1.5px solid ${active ? color : PALETTE.blush}`,
background: active ? color : "white”,
color: active ? "white” : PALETTE.ink,
fontSize: 13, cursor: "pointer”, whiteSpace: "nowrap”, fontFamily: "sans-serif”,
};
}
function tagStyle(bg, color) {
return { background: bg, color, padding: "3px 9px”, borderRadius: 99, fontSize: 11, fontFamily: "sans-serif” };
}
const smallHeadingStyle = {
fontSize: 11, fontFamily: "sans-serif”, fontWeight: 700,
color: "#bbb”, textTransform: "uppercase”, letterSpacing: 1, margin: "0 0 6px”,
};
const editButtonStyle = {
marginTop: 12, marginRight: 8, border: "1px solid #ddd”,
background: "white”, color: PALETTE.ink, borderRadius: 8, padding: "6px 14px”, cursor: "pointer”,
};
const removeButton = {
marginTop: 12, border: "1px solid #f0c8c0”, background: "none”,
color: PALETTE.rose, borderRadius: 8, padding: "6px 14px”, cursor: "pointer”,
};
const shopBoxStyle = {
background: `linear-gradient(135deg, ${PALETTE.blush}, ${PALETTE.cloud})`,
borderRadius: 20, padding: 24, textAlign: "center”,
};
const shopButtonStyle = {
display: "inline-block”, background: PALETTE.teal, color: "white”,
padding: "12px 24px”, borderRadius: 50, textDecoration: "none”,
fontFamily: "sans-serif”, fontWeight: 700,
};
const floatingButtonStyle = {
position: "fixed”, bottom: 28, left: "50%”, transform: "translateX(-50%)”,
background: `linear-gradient(135deg, ${PALETTE.teal}, ${PALETTE.sage})`,
color: "white”, border: "none”, borderRadius: 50, padding: "18px 32px”,
fontSize: 17, boxShadow: "0 6px 28px rgba(74,124,111,0.45)”,
fontFamily: "sans-serif”, fontWeight: 700, zIndex: 50, cursor: "pointer”,
};
const toastStyle = {
position: "fixed”, top: 24, left: "50%”, transform: "translateX(-50%)”,
background: PALETTE.ink, color: "white”, padding: "12px 24px”,
borderRadius: 50, fontSize: 14, fontFamily: "sans-serif”, zIndex: 200,
};
const autoButtonStyle = {
background: PALETTE.teal, color: "white”, border: "none”, borderRadius: 50,
padding: "12px 18px”, fontSize: 14, fontFamily: "sans-serif”, fontWeight: 700,
marginBottom: 16, boxShadow: "0 4px 14px rgba(74,124,111,0.25)”, cursor: "pointer”,
};
const designWallBoxStyle = {
background: "white”, borderRadius: 16, padding: 16,
marginBottom: 16, boxShadow: "0 2px 10px rgba(44,44,44,0.06)”,
};
const designWallGridStyle = {
display: "grid”, gridTemplateColumns: "repeat(auto-fill, minmax(70px, 1fr))”, gap: 8,
};
const wallRemoveButtonStyle = {
position: "absolute”, top: -6, right: -6, background: "white”,
borderRadius: "50%”, border: "1px solid #ddd”, cursor: "pointer”,
width: 20, height: 20, lineHeight: "18px”, textAlign: "center”, padding: 0,
};
const clearWallButtonStyle = {
marginTop: 12, background: "none”, border: "1px solid #ddd”,
borderRadius: 8, padding: "6px 12px”, cursor: "pointer”,
};
const saveBundleButtonStyle = {
marginTop: 10, marginLeft: 8, background: PALETTE.rose, color: "white”,
border: "none”, borderRadius: 8, padding: "8px 12px”, fontSize: 13, cursor: "pointer”,
};
const addWallButtonStyle = {
background: PALETTE.teal, color: "white”, border: "none”,
borderRadius: 8, padding: "6px 12px”, fontSize: 12, cursor: "pointer”,
};
const missingItemStyle = {
background: "#fff4df”, padding: "8px 12px”, borderRadius: 10,
fontSize: 12, fontFamily: "sans-serif”,
display: "flex”, justifyContent: "space-between”, alignItems: "center”, gap: 8,
};
const miniButtonStyle = {
fontSize: 11, padding: "4px 8px”, borderRadius: 6,
border: "1px solid #ddd”, background: "white”, cursor: "pointer”,
};
const miniShopButtonStyle = {
fontSize: 11, padding: "4px 8px”, borderRadius: 6,
background: "#4A7C6F”, color: "white”, textDecoration: "none”,
};
const saveModalButtonStyle = {
width: "100%”, border: "none”, borderRadius: 50, padding: 16, fontSize: 17,
color: "white”, background: `linear-gradient(135deg, ${PALETTE.teal}, ${PALETTE.sage})`,
marginTop: 8, cursor: "pointer”,
};
const cancelModalButtonStyle = {
width: "100%”, border: "1px solid #ddd”, borderRadius: 50, padding: 14,
fontSize: 15, background: "white”, color: PALETTE.ink, marginTop: 10, cursor: "pointer”,
};

