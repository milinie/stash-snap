import { useEffect, useMemo, useState } from "react";
const PALETTE = {
  cream: "#FAF6F0",
  blush: "#F2D5C8",
  rose: "#C97B6E",
  sage: "#8FAF8A",
  teal: "#4A7C6F",
  ink: "#2C2C2C",
  mist: "#E8EEE7",
  honey: "#D4A853",
  cloud: "#E8E4EE",
};
const STYLE_TAGS = ["Floral", "Geometric", "Solid", "Stripe", "Blender", "Vintage"];
const COLOR_TAGS = ["Sage", "Rose", "Cream", "Navy", "Honey", "Lavender", "Teal", "Blush", "Cloud"];
const COLLECTIONS = ["My Stash", "Current Project", "Gifted", "Shop Sample", "Fat Quarters"];
const SAMPLE_STASH = [
  { id: 1, name: "Garden Party Floral", color: "Rose", style: "Floral", yardage: 2.5, collection: "Current Project", notes: "For quilt border", photo: null, date: "Apr 28" },
  { id: 2, name: "Sage Blender", color: "Sage", style: "Blender", yardage: 1, collection: "My Stash", notes: "", photo: null, date: "Apr 20" },
  { id: 3, name: "Honey Geometric", color: "Honey", style: "Geometric", yardage: 3, collection: "Fat Quarters", notes: "Lori Holt style", photo: null, date: "Apr 15" },
  { id: 4, name: "Cloud Stripe", color: "Cloud", style: "Stripe", yardage: 0.5, collection: "My Stash", notes: "Sashing fabric", photo: null, date: "Apr 10" },
];
const BUNDLE_SUGGESTIONS = {
  Rose: ["Sage", "Cream", "Honey", "Cloud"],
  Sage: ["Rose", "Honey", "Cream", "Blush"],
  Honey: ["Teal", "Cream", "Rose", "Sage"],
  Teal: ["Honey", "Cream", "Blush", "Lavender"],
  Lavender: ["Blush", "Cloud", "Cream", "Sage"],
  Navy: ["Cream", "Rose", "Honey", "Cloud"],
  Blush: ["Sage", "Lavender", "Cream", "Cloud"],
  Cloud: ["Rose", "Sage", "Cream", "Honey"],
  Cream: ["Rose", "Sage", "Honey", "Cloud"],
};
function getColorHex(color) {
  const colorMap = {
    Rose: "#C97B6E",
    Sage: "#8FAF8A",
    Cream: "#FAF0D7",
    Navy: "#2E4057",
    Honey: "#D4A853",
    Lavender: "#B8A8C8",
    Teal: "#4A7C6F",
    Blush: "#F2D5C8",
    Cloud: "#E8E4EE",
  };
  return colorMap[color] || "#DDD";
}
function FabricThumb({ color, style, photo, size = 76 }) {
  if (photo) {
    return <img src={photo} alt="Fabric" style={{ width: size, height: size, objectFit: "cover", display: "block" }} />;
  }
  const bg = getColorHex(color);
  return (
    <svg width={size} height={size} viewBox="0 0 48 48">
      <rect width="48" height="48" fill={bg} />
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
          <circle key={i} cx={Math.sin(i * 2.3) * 18 + 24} cy={Math.cos(i * 1.7) * 18 + 24} r="2" fill="white" opacity="0.22" />
        ))}
      {(style === "Solid" || style === "Vintage") && (
        <rect x="8" y="8" width="32" height="32" fill="white" opacity="0.12" rx="2" />
      )}
    </svg>
  );
}

function compressImage(file, maxWidth = 700, quality = 0.65) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();

      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const canvas = document.createElement("canvas");

        canvas.width = img.width * scale;
        canvas.height = img.height * scale;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        resolve(canvas.toDataURL("image/jpeg", quality));
      };

      img.onerror = reject;
      img.src = event.target.result;
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function AddModal({ onSave, onClose, initialData }) {
  const [form, setForm] = useState({
    id: initialData ? initialData.id : undefined,
    date: initialData ? initialData.date : undefined,
    name: initialData ? initialData.name : "",
    color: initialData ? initialData.color : "Rose",
    style: initialData ? initialData.style : "Floral",
    yardage: initialData ? String(initialData.yardage) : "",
    collection: initialData ? initialData.collection : "My Stash",
    notes: initialData ? initialData.notes : "",
    photo: initialData ? initialData.photo : null,
  });

  const update = (key, value) => {
    setForm({ ...form, [key]: value });
  };

const handlePhoto = async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  try {
    const compressedPhoto = await compressImage(file);
    update("photo", compressedPhoto);
  } catch (error) {
    console.error("Photo compression failed:", error);
    alert("That photo could not be added. Try a smaller image.");
  }
};
  reader.readAsDataURL(file);
};
  const canSave = form.name.trim() !== "" && String(form.yardage).trim() !== "";
  return (
    <div style={modalOverlay}>
      <div style={modalBox}>
        <h2>{initialData ? "Edit Fabric" : "Add Fabric"}</h2>
<label style={labelStyle}>Fabric Photo</label>

<input
  type="file"
  accept="image/*"
  onChange={handlePhoto}
  style={{ marginBottom: 16 }}
/>

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
        <select
          value={form.color}
          onChange={(e) => update("color", e.target.value)}
          style={inputStyle}
        >
          {COLOR_TAGS.map((color) => (
            <option key={color} value={color}>{color}</option>
          ))}
        </select>

        <label style={labelStyle}>Style</label>
        <select
          value={form.style}
          onChange={(e) => update("style", e.target.value)}
          style={inputStyle}
        >
          {STYLE_TAGS.map((style) => (
            <option key={style} value={style}>{style}</option>
          ))}
        </select>

        <label style={labelStyle}>Collection</label>
        <select
          value={form.collection}
          onChange={(e) => update("collection", e.target.value)}
          style={inputStyle}
        >
          {COLLECTIONS.map((collection) => (
            <option key={collection} value={collection}>{collection}</option>
          ))}
        </select>

        <label style={labelStyle}>Notes</label>
        <textarea
          value={form.notes}
          onChange={(e) => update("notes", e.target.value)}
          rows={3}
          style={{ ...inputStyle, resize: "none" }}
        />

        <button
          disabled={!canSave}
          onClick={() =>
            onSave({
              ...form,
              id: form.id || Date.now(),
              date: form.date || new Date().toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              }),
              yardage: parseFloat(form.yardage) || 0,
            })
          }
          style={saveModalButtonStyle}
        >
          {initialData ? "Save Changes" : "Save Fabric"}
        </button>

        <button onClick={onClose} style={cancelModalButtonStyle}>
          Cancel
        </button>
      </div>
    </div>
  );
}
function FabricCard({ item, onDelete, onEdit }) {
  const [expanded, setExpanded] = useState(false);
  const pairings = (BUNDLE_SUGGESTIONS[item.color] || ["Cream", "Sage", "Cloud", "Honey"]).slice(0, 4);
  return (
    <div style={cardStyle}>
      <div onClick={() => setExpanded((value) => !value)} style={{ display: "flex", cursor: "pointer" }}>
        <div style={{ flexShrink: 0 }}>
          <FabricThumb color={item.color} style={item.style} photo={item.photo} />
        </div>
        <div style={{ padding: "12px 14px", flex: 1 }}>
          <h3 style={{ fontSize: 16, color: PALETTE.ink, margin: "0 0 4px" }}>{item.name}</h3>
          <p style={{ fontSize: 12, color: "#999", fontFamily: "sans-serif", margin: 0 }}>
            {item.yardage} yds · {item.collection}
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
              <span key={color} style={{ background: PALETTE.mist, padding: "3px 10px", borderRadius: 99, fontSize: 12, fontFamily: "sans-serif" }}>
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
function autoBuildBundle(stash) {
  const floral = stash.find((item) => item.style === "Floral");
  const blender = stash.find((item) => item.style === "Blender");
  const solid = stash.find((item) => item.style === "Solid");
  const stripe = stash.find((item) => item.style === "Stripe");
  const light = stash.find((item) => ["Cream", "Cloud", "Blush"].includes(item.color));
  const contrast = stash.find((item) => ["Honey", "Teal", "Navy", "Sage", "Rose"].includes(item.color));
  return [floral, blender, solid || stripe, light, contrast]
    .filter(Boolean)
    .filter((item, index, array) => array.findIndex((i) => i.id === item.id) === index)
    .slice(0, 5);
}
function analyzeBundle(designWall) {
  const styles = designWall.map((f) => f.style);
  const colors = designWall.map((f) => f.color);
  const missing = [];
  if (!styles.includes("Floral")) missing.push("Focal Print");
  if (!styles.includes("Blender")) missing.push("Blender");
  if (!styles.includes("Solid") && !styles.includes("Stripe")) missing.push("Solid or Stripe");
  if (!colors.some((c) => ["Cream", "Cloud", "Blush"].includes(c))) missing.push("Light Neutral");
  if (!colors.some((c) => ["Honey", "Teal", "Navy", "Rose", "Sage"].includes(c))) missing.push("Contrast Color");
  return missing;
}
function mapMissingToFilter(m) {
  if (m === "Blender") return "Blender";
  if (m === "Focal Print") return "Floral";
  if (m === "Solid or Stripe") return "Solid";
  return null;
}
export default function App() {
  const [stash, setStash] = useState(() => {
    const saved = localStorage.getItem("stash-snap-data");
    return saved ? JSON.parse(saved) : SAMPLE_STASH;
  });
  const [savedBundles, setSavedBundles] = useState(() => {
    return JSON.parse(localStorage.getItem("saved-bundles") || "[]");
  });
  const [activeTab, setActiveTab] = useState("stash");
  const [adding, setAdding] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [filterStyle, setFilterStyle] = useState(null);
  const [bundleFilter, setBundleFilter] = useState(null);
const [bundleSearch, setBundleSearch] = useState("");
const [bundleColorFilter, setBundleColorFilter] = useState(null);
const [bundleCollectionFilter, setBundleCollectionFilter] = useState(null);
  const [designWall, setDesignWall] = useState([]);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState(null);
  useEffect(() => {
    document.body.style.margin = "0";
    document.body.style.background = PALETTE.cream;
  }, []);

useEffect(() => {
  try {
    localStorage.setItem("stash-snap-data", JSON.stringify(stash));
  } catch (error) {
    console.error("Could not save stash:", error);
    // silently fail for now (no popup)
  }
}, [stash]);

  const totalYards = useMemo(() => stash.reduce((sum, item) => sum + item.yardage, 0), [stash]);
  const collections = useMemo(() => [...new Set(stash.map((item) => item.collection))], [stash]);
  const missing = analyzeBundle(designWall);
const bundleFiltered = stash.filter((item) => {
  const searchText = bundleSearch.toLowerCase();
  const searchableItem = [
    item.name,
    item.color,
    item.style,
    item.collection,
    item.notes,
    String(item.yardage),
  ]
    .join(" ")
    .toLowerCase();
  if (bundleFilter && item.style !== bundleFilter) return false;
  if (bundleColorFilter && item.color !== bundleColorFilter) return false;
  if (bundleCollectionFilter && item.collection !== bundleCollectionFilter) return false;
  if (bundleSearch && !searchableItem.includes(searchText)) return false;
  return true;
});
  const filtered = stash.filter((item) => {
    const searchText = search.toLowerCase();
    const searchableItem = [item.name, item.color, item.style, item.collection, item.notes, String(item.yardage)].join(" ").toLowerCase();
    if (filterStyle && item.style !== filterStyle) return false;
    if (search && !searchableItem.includes(searchText)) return false;
    return true;
  });
  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 2500);
  };
  const handleSave = (form) => {
  const newItem = {
    ...form,
    id: form.id || Date.now(),
    date:
      form.date ||
      new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
    yardage: Number(form.yardage) || 0,
  };

  setStash((prev) => [newItem, ...prev]);
  setAdding(false);
  showToast("✅ Added to your stash!");
};

  const handleUpdate = (updated) => {
    setStash((prev) => prev.map((item) => (item.id === updated.id ? { ...item, ...updated } : item)));
    setDesignWall((prev) => prev.map((item) => (item.id === updated.id ? { ...item, ...updated } : item)));
    setEditingItem(null);
    showToast("✏️ Fabric updated!");
  };
  const handleDelete = (id) => {
    setStash((prev) => prev.filter((item) => item.id !== id));
    setDesignWall((prev) => prev.filter((item) => item.id !== id));
    showToast("Removed from stash");
  };
  const handleSaveBundle = () => {
    if (designWall.length === 0) {
      showToast("Add fabrics to the wall first");
      return;
    }
    const bundleName = `Bundle ${new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })}`;
    const newBundle = {
      id: Date.now(),
      name: bundleName,
      fabrics: designWall,
    };
    const updated = [newBundle, ...savedBundles];
    setSavedBundles(updated);
    localStorage.setItem("saved-bundles", JSON.stringify(updated));
    showToast("✨ Bundle saved!");
  };
  const handleDeleteBundle = (id) => {
    const updated = savedBundles.filter((bundle) => bundle.id !== id);
    setSavedBundles(updated);
    localStorage.setItem("saved-bundles", JSON.stringify(updated));
    showToast("Bundle deleted");
  };
  return (
    <div style={{ minHeight: "100vh", background: PALETTE.cream, fontFamily: "Georgia, serif", width: "100%" }}>
      <header style={headerStyle}>
        <div style={contentWrap}>
          <p style={eyebrowStyle}>Crafting Dreams Fabric</p>
          <h1 style={{ color: "white", fontSize: 34, margin: "0 0 4px" }}> Stash Snap 📸 </h1>
          <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 14, margin: "0 0 24px", fontStyle: "italic" }}>
            Snap · Identify · Organize
          </p>
          <div style={{ display: "flex", gap: 12 }}>
            {[
              { label: `${stash.length} Fabrics`, icon: "🧵" },
              { label: `${totalYards.toFixed(1)} Yards`, icon: "📏" },
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
      <nav style={{ background: "white", borderBottom: `1px solid ${PALETTE.blush}` }}>
        <div style={contentWrapNoPadding}>
          {[
            ["stash", "My Stash"],
            ["bundles", "Build Bundle"],
            ["saved", "Saved Bundles"],
            ["shop", "Shop Match"],
          ].map(([id, label]) => (
            <button key={id} onClick={() => setActiveTab(id)} style={tabStyle(activeTab === id)}>
              {label}
            </button>
          ))}
        </div>
      </nav>
      <main style={{ ...contentWrap, paddingTop: 20, paddingBottom: 120 }}>
        {activeTab === "stash" && (
          <>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="🔍 Search your stash..." style={searchStyle} />
            <div style={{ display: "flex", gap: 6, overflowX: "auto", marginBottom: 16 }}>
              <button onClick={() => setFilterStyle(null)} style={pillStyle(!filterStyle, PALETTE.teal)}>All</button>
              {["Floral", "Geometric", "Blender", "Vintage", "Solid"].map((style) => (
                <button key={style} onClick={() => setFilterStyle(filterStyle === style ? null : style)} style={pillStyle(filterStyle === style, PALETTE.rose)}>
                  {style}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {filtered.map((item) => (
                <FabricCard key={item.id} item={item} onDelete={handleDelete} onEdit={setEditingItem} />
              ))}
            </div>
          </>
        )}
        {activeTab === "bundles" && (
          <div>
            <h2>Build Your Bundle 🎨</h2>
            <p style={{ color: "#999", fontFamily: "sans-serif" }}>
              Tap fabrics to add them to your design wall, or let Stash Snap suggest a balanced bundle from what you already have.
            </p>
            <button onClick={() => setDesignWall(autoBuildBundle(stash))} style={autoButtonStyle}>
              ✨ Auto Build Bundle
            </button>
            {designWall.length > 0 && (
              <div style={designWallBoxStyle}>
                <h3 style={{ marginBottom: 10 }}>Design Wall</h3>
                <p style={{ fontSize: 12, color: "#999", fontFamily: "sans-serif", marginTop: 0 }}>
                  Tip: A balanced bundle usually includes a focal print, a blender, a light fabric, and a contrast color.
                </p>
                <div style={designWallGridStyle}>
                  {designWall.map((item) => (
                    <div key={item.id} style={{ position: "relative" }}>
                      <FabricThumb {...item} size={70} />
                      <button onClick={() => setDesignWall((prev) => prev.filter((f) => f.id !== item.id))} style={wallRemoveButtonStyle}>×</button>
                    </div>
                  ))}
                </div>
                <p style={{ fontSize: 13, fontFamily: "sans-serif", color: "#777", marginTop: 10 }}>
                  ✨ This bundle works best when it mixes a focal print, a soft blender, a light neutral, and a contrast color for balance.
                </p>
                {missing.length > 0 && (
                  <div style={{ marginTop: 10 }}>
                    <p style={smallHeadingStyle}>To improve this bundle</p>
                    <div style={{ display: "flex", gap: 8, flexDirection: "column" }}>
                      {missing.map((m) => (
                        <div key={m} style={missingItemStyle}>
                          <span>➕ {m}</span>
                          <div style={{ display: "flex", gap: 6 }}>
                            <button
                              onClick={() => {
                                const filter = mapMissingToFilter(m);
                                if (filter) setBundleFilter(filter);
                              }}
                              style={miniButtonStyle}
                            >
                              Find in Stash
                            </button>
                            <a href={`https://craftingdreamsfabric.com/search?q=${encodeURIComponent(m)}`} target="_blank" rel="noopener noreferrer" style={miniShopButtonStyle}>
                              Shop →
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <button onClick={() => setDesignWall([])} style={clearWallButtonStyle}>Clear Wall</button>
                <button onClick={handleSaveBundle} style={saveBundleButtonStyle}>💾 Save This Bundle</button>
              </div>
            )}
     <input
  value={bundleSearch}
  onChange={(e) => setBundleSearch(e.target.value)}
  placeholder="🔍 Search by name, notes, color, style..."
  style={searchStyle}
/>
<p style={smallHeadingStyle}>Filter by color</p>
<div style={{ display: "flex", gap: 6, overflowX: "auto", marginBottom: 12 }}>
  <button onClick={() => setBundleColorFilter(null)} style={pillStyle(!bundleColorFilter, PALETTE.teal)}>
    All
  </button>
  {COLOR_TAGS.map((color) => (
    <button
      key={color}
      onClick={() => setBundleColorFilter(bundleColorFilter === color ? null : color)}
      style={pillStyle(bundleColorFilter === color, PALETTE.teal)}
    >
      {color}
    </button>
  ))}
</div>
<p style={smallHeadingStyle}>Filter by style</p>
<div style={{ display: "flex", gap: 6, overflowX: "auto", marginBottom: 12 }}>
  <button onClick={() => setBundleFilter(null)} style={pillStyle(!bundleFilter, PALETTE.rose)}>
    All
  </button>
  {STYLE_TAGS.map((style) => (
    <button
      key={style}
      onClick={() => setBundleFilter(bundleFilter === style ? null : style)}
      style={pillStyle(bundleFilter === style, PALETTE.rose)}
    >
      {style}
    </button>
  ))}
</div>
<p style={smallHeadingStyle}>Filter by collection</p>
<div style={{ display: "flex", gap: 6, overflowX: "auto", marginBottom: 16 }}>
  <button onClick={() => setBundleCollectionFilter(null)} style={pillStyle(!bundleCollectionFilter, PALETTE.honey)}>
    All
  </button>
  {COLLECTIONS.map((collection) => (
    <button
      key={collection}
      onClick={() =>
        setBundleCollectionFilter(bundleCollectionFilter === collection ? null : collection)
      }
      style={pillStyle(bundleCollectionFilter === collection, PALETTE.honey)}
    >
      {collection}
    </button>
  ))}
</div>
{bundleFiltered.map((item) => (
  <div key={item.id} style={cardStyle}>
    <div style={{ display: "flex", padding: 12 }}>
      <FabricThumb {...item} />

      <div style={{ marginLeft: 12, flex: 1 }}>
        <strong>{item.name}</strong>
        <p style={{ fontSize: 12, color: "#999" }}>
          {item.color} · {item.yardage} yds
        </p>

        <button
          onClick={() =>
            setDesignWall((prev) =>
              prev.find((f) => f.id === item.id) ? prev : [...prev, item]
            )
          }
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
        {activeTab === "saved" && (
          <div>
            <h2>Saved Bundles 💾</h2>
            <p style={{ color: "#999", fontFamily: "sans-serif" }}>
              Review the fabric bundles you’ve saved from your design wall.
            </p>
            {savedBundles.length === 0 && (
              <div style={cardStyle}>
                <div style={{ padding: 16 }}>
                  <p style={{ color: "#999", fontFamily: "sans-serif", margin: 0 }}>
                    No saved bundles yet. Build a bundle, then tap “Save This Bundle.”
                  </p>
                </div>
              </div>
            )}
            {savedBundles.map((bundle) => (
              <div key={bundle.id} style={cardStyle}>
                <div style={{ padding: 16 }}>
                  <h3 style={{ marginTop: 0 }}>{bundle.name}</h3>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
                    {bundle.fabrics.map((fabric) => (
                      <FabricThumb key={fabric.id} {...fabric} size={64} />
                    ))}
                  </div>
                  <p style={{ color: "#999", fontFamily: "sans-serif", fontSize: 12 }}>
                    {bundle.fabrics.length} fabrics ·{" "}
                    {bundle.fabrics.reduce((sum, fabric) => sum + fabric.yardage, 0).toFixed(1)} yards
                  </p>
                  <button
                    onClick={() => {
                      setDesignWall(bundle.fabrics);
                      setActiveTab("bundles");
                      showToast("Bundle loaded to design wall");
                    }}
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
        {activeTab === "shop" && (
          <div>
            <h2>Shop Your Perfect Match 🛍️</h2>
            <p style={{ color: "#999", fontFamily: "sans-serif" }}>
              Find the fabrics that pair beautifully with what you already have.
            </p>
            <div style={shopBoxStyle}>
              <div style={{ fontSize: 40 }}>🧵</div>
              <h3>Complete Your Quilt</h3>
              <p style={{ fontFamily: "sans-serif", color: "#777" }}>
                You’re closer than you think. Shop fabrics that can help round out your bundle and bring your quilt together.
              </p>
              <a href="https://craftingdreamsfabric.com" target="_blank" rel="noopener noreferrer" style={shopButtonStyle}>
                Shop Matching Fabrics →
              </a>
            </div>
          </div>
        )}
      </main>
      <button onClick={() => setAdding(true)} style={floatingButtonStyle}>＋ Add Fabric</button>
      {adding && <AddModal onSave={handleSave} onClose={() => setAdding(false)} />}
      {editingItem && (
        <AddModal
          initialData={editingItem}
          onSave={handleUpdate}
          onClose={() => setEditingItem(null)}
        />
      )}
      {toast && <div style={toastStyle}>{toast}</div>}
    </div>
  );
}
const APP_WIDTH = 760;
const contentWrap = { width: "100%", maxWidth: APP_WIDTH, margin: "0 auto", paddingLeft: 16, paddingRight: 16, boxSizing: "border-box" };
const contentWrapNoPadding = { width: "100%", maxWidth: APP_WIDTH, margin: "0 auto", display: "flex" };
const headerStyle = { background: `linear-gradient(160deg, ${PALETTE.teal} 0%, #3a6b5e 100%)`, padding: "48px 0 28px" };
const eyebrowStyle = { color: "rgba(255,255,255,0.6)", fontSize: 11, fontFamily: "sans-serif", letterSpacing: 3, textTransform: "uppercase", margin: "0 0 4px" };
const statBoxStyle = { background: "rgba(255,255,255,0.12)", borderRadius: 12, padding: "10px 14px", flex: 1, textAlign: "center" };
function tabStyle(active) {
  return { flex: 1, padding: "14px 8px", background: "none", border: "none", fontSize: 12, fontFamily: "sans-serif", fontWeight: 700, color: active ? PALETTE.teal : "#bbb", borderBottom: `2px solid ${active ? PALETTE.teal : "transparent"}` };
}
const searchStyle = { width: "100%", padding: "12px 16px", border: `1.5px solid ${PALETTE.blush}`, borderRadius: 50, fontSize: 14, fontFamily: "sans-serif", background: "white", boxSizing: "border-box", marginBottom: 12 };
const cardStyle = { background: "white", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 12px rgba(44,44,44,0.07)", marginBottom: 12 };
const modalOverlay = { position: "fixed", inset: 0, background: "rgba(44,44,44,0.75)", zIndex: 90, display: "flex", alignItems: "flex-end", justifyContent: "center" };
const modalBox = { background: PALETTE.cream, borderRadius: "24px 24px 0 0", padding: "28px 24px 40px", width: "100%", maxWidth: APP_WIDTH, maxHeight: "90vh", overflowY: "auto", fontFamily: "Georgia, serif", boxSizing: "border-box" };
const closeButton = { border: "none", background: PALETTE.mist, borderRadius: "50%", width: 32, height: 32, fontSize: 18 };
const labelStyle = { fontSize: 11, fontFamily: "sans-serif", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "#999", display: "block", marginBottom: 6 };
const inputStyle = { width: "100%", padding: 12, border: `1.5px solid ${PALETTE.blush}`, borderRadius: 10, fontSize: 15, background: "white", boxSizing: "border-box", fontFamily: "Georgia, serif", outline: "none", marginBottom: 16 };
const pillWrapStyle = { display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 };
function pillStyle(active, color) {
  return { padding: "6px 12px", borderRadius: 99, border: `1.5px solid ${active ? color : PALETTE.blush}`, background: active ? color : "white", color: active ? "white" : PALETTE.ink, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap", fontFamily: "sans-serif" };
}
function tagStyle(background, color) {
  return { background, color, padding: "3px 9px", borderRadius: 99, fontSize: 11, fontFamily: "sans-serif" };
}
const smallHeadingStyle = { fontSize: 11, fontFamily: "sans-serif", fontWeight: 700, color: "#bbb", textTransform: "uppercase", letterSpacing: 1, margin: "0 0 6px" };
const editButtonStyle = { marginTop: 12, marginRight: 8, border: "1px solid #ddd", background: "white", color: PALETTE.ink, borderRadius: 8, padding: "6px 14px" };
const removeButton = { marginTop: 12, border: "1px solid #f0c8c0", background: "none", color: PALETTE.rose, borderRadius: 8, padding: "6px 14px" };
const shopBoxStyle = { background: `linear-gradient(135deg, ${PALETTE.blush}, ${PALETTE.cloud})`, borderRadius: 20, padding: 24, textAlign: "center" };
const shopButtonStyle = { display: "inline-block", background: PALETTE.teal, color: "white", padding: "12px 24px", borderRadius: 50, textDecoration: "none", fontFamily: "sans-serif", fontWeight: 700 };
const floatingButtonStyle = { position: "fixed", bottom: 28, left: "50%", transform: "translateX(-50%)", background: `linear-gradient(135deg, ${PALETTE.teal}, ${PALETTE.sage})`, color: "white", border: "none", borderRadius: 50, padding: "18px 32px", fontSize: 17, boxShadow: "0 6px 28px rgba(74,124,111,0.45)", fontFamily: "sans-serif", fontWeight: 700, zIndex: 50 };
const toastStyle = { position: "fixed", top: 24, left: "50%", transform: "translateX(-50%)", background: PALETTE.ink, color: "white", padding: "12px 24px", borderRadius: 50, fontSize: 14, fontFamily: "sans-serif", zIndex: 200 };
const autoButtonStyle = { background: PALETTE.teal, color: "white", border: "none", borderRadius: 50, padding: "12px 18px", fontSize: 14, fontFamily: "sans-serif", fontWeight: 700, marginBottom: 16, boxShadow: "0 4px 14px rgba(74,124,111,0.25)" };
const designWallBoxStyle = { background: "white", borderRadius: 16, padding: 16, marginBottom: 16, boxShadow: "0 2px 10px rgba(44,44,44,0.06)" };
const designWallGridStyle = { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(70px, 1fr))", gap: 8 };
const wallRemoveButtonStyle = { position: "absolute", top: -6, right: -6, background: "white", borderRadius: "50%", border: "1px solid #ddd", cursor: "pointer" };
const clearWallButtonStyle = { marginTop: 12, background: "none", border: "1px solid #ddd", borderRadius: 8, padding: "6px 12px" };
const saveBundleButtonStyle = { marginTop: 10, marginLeft: 8, background: PALETTE.rose, color: "white", border: "none", borderRadius: 8, padding: "8px 12px", fontSize: 13, cursor: "pointer" };
const addWallButtonStyle = { background: PALETTE.teal, color: "white", border: "none", borderRadius: 8, padding: "6px 12px", fontSize: 12, cursor: "pointer" };
const missingItemStyle = { background: "#fff4df", padding: "8px 12px", borderRadius: 10, fontSize: 12, fontFamily: "sans-serif", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 };
const miniButtonStyle = { fontSize: 11, padding: "4px 8px", borderRadius: 6, border: "1px solid #ddd", background: "white", cursor: "pointer" };
const miniShopButtonStyle = { fontSize: 11, padding: "4px 8px", borderRadius: 6, background: "#4A7C6F", color: "white", textDecoration: "none" };
const saveModalButtonStyle = {
  width: "100%",
  border: "none",
  borderRadius: 50,
  padding: 16,
  fontSize: 17,
  color: "white",
  background: `linear-gradient(135deg, ${PALETTE.teal}, ${PALETTE.sage})`,
  marginTop: 8,
};

const cancelModalButtonStyle = {
  width: "100%",
  border: "1px solid #ddd",
  borderRadius: 50,
  padding: 14,
  fontSize: 15,
  background: "white",
  color: PALETTE.ink,
  marginTop: 10,
};
