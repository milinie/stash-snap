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

function AddModal({ onSave, onClose }) {
  const [form, setForm] = useState({
    name: "",
    color: "Rose",
    style: "Floral",
    yardage: "",
    collection: "My Stash",
    notes: "",
    photo: null,
  });

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handlePhoto = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => update("photo", e.target.result);
    reader.readAsDataURL(file);
  };

  const canSave = form.name.trim() && form.yardage;

  return (
    <div style={modalOverlay}>
      <div style={modalBox}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
          <h2 style={{ margin: 0, color: PALETTE.ink }}>Add Fabric</h2>
          <button onClick={onClose} style={closeButton}>×</button>
        </div>

        <label style={labelStyle}>Fabric Photo</label>
        <input type="file" accept="image/*" onChange={handlePhoto} style={{ marginBottom: 16 }} />

        {form.photo && (
          <div style={{ borderRadius: 14, overflow: "hidden", width: 96, height: 96, marginBottom: 16 }}>
            <FabricThumb photo={form.photo} size={96} />
          </div>
        )}

        <label style={labelStyle}>Fabric Name</label>
        <input value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Example: Sage Floral" style={inputStyle} />

        <label style={labelStyle}>Yardage</label>
        <input value={form.yardage} onChange={(e) => update("yardage", e.target.value)} placeholder="Example: 2.5" inputMode="decimal" style={inputStyle} />

        <label style={labelStyle}>Color</label>
        <div style={pillWrapStyle}>
          {COLOR_TAGS.map((color) => (
            <button key={color} onClick={() => update("color", color)} style={pillStyle(form.color === color, PALETTE.teal)}>
              {color}
            </button>
          ))}
        </div>

        <label style={labelStyle}>Pattern Style</label>
        <div style={pillWrapStyle}>
          {STYLE_TAGS.map((style) => (
            <button key={style} onClick={() => update("style", style)} style={pillStyle(form.style === style, PALETTE.rose)}>
              {style}
            </button>
          ))}
        </div>

        <label style={labelStyle}>Collection</label>
        <select value={form.collection} onChange={(e) => update("collection", e.target.value)} style={inputStyle}>
          {COLLECTIONS.map((collection) => (
            <option key={collection}>{collection}</option>
          ))}
        </select>

        <label style={labelStyle}>Notes</label>
        <textarea value={form.notes} onChange={(e) => update("notes", e.target.value)} placeholder="Example: Perfect for sashing or quilt border" rows={3} style={{ ...inputStyle, resize: "none" }} />

        <button
          disabled={!canSave}
          onClick={() => onSave({ ...form, yardage: parseFloat(form.yardage) || 0 })}
          style={{
            width: "100%",
            border: "none",
            borderRadius: 50,
            padding: 16,
            fontSize: 17,
            color: "white",
            background: `linear-gradient(135deg, ${PALETTE.teal}, ${PALETTE.sage})`,
            opacity: canSave ? 1 : 0.5,
          }}
        >
          Save to Stash 🧵
        </button>
      </div>
    </div>
  );
}

function FabricCard({ item, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const pairings = (BUNDLE_SUGGESTIONS[item.color] || ["Cream", "Sage", "Cloud", "Honey"]).slice(0, 4);

  return (
    <div style={cardStyle}>
      <div onClick={() => setExpanded((value) => !value)} style={{ display: "flex", cursor: "pointer" }}>
        <div style={{ flexShrink: 0 }}>
          <FabricThumb color={item.color} style={item.style} photo={item.photo} />
        </div>

        <div style={{ padding: "12px 14px", flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <h3 style={{ fontSize: 16, color: PALETTE.ink, margin: "0 0 4px" }}>{item.name}</h3>
            <span style={{ fontSize: 11, color: "#bbb", fontFamily: "sans-serif" }}>{item.date}</span>
          </div>

          <div style={{ display: "flex", gap: 6, alignItems: "center", fontFamily: "sans-serif" }}>
            <strong style={{ fontSize: 12, color: PALETTE.teal }}>{item.yardage} yds</strong>
            <span style={{ color: "#ddd" }}>·</span>
            <span style={{ fontSize: 12, color: "#999" }}>{item.collection}</span>
          </div>

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

          <p style={smallHeadingStyle}>You already have</p>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
            <span style={tagStyle(PALETTE.blush, PALETTE.rose)}>✔ {item.color}</span>
            <span style={tagStyle(PALETTE.mist, PALETTE.teal)}>✔ {item.style}</span>
            <span style={tagStyle("#fff4df", PALETTE.honey)}>✔ {item.yardage} yds</span>
          </div>

          <p style={smallHeadingStyle}>Add these to complete the look</p>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {pairings.map((color) => (
              <span key={color} style={{ background: PALETTE.mist, padding: "3px 10px", borderRadius: 99, fontSize: 12, fontFamily: "sans-serif" }}>
                ➕ {color}
              </span>
            ))}
          </div>

          <button onClick={() => onDelete(item.id)} style={removeButton}>
            Remove from stash
          </button>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [stash, setStash] = useState(() => {
    const saved = localStorage.getItem("stash-snap-data");
    return saved ? JSON.parse(saved) : SAMPLE_STASH;
  });

  const [activeTab, setActiveTab] = useState("stash");
  const [adding, setAdding] = useState(false);
  const [filterStyle, setFilterStyle] = useState(null);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState(null);

  useEffect(() => {
    document.body.style.margin = "0";
    document.body.style.background = PALETTE.cream;
  }, []);

  useEffect(() => {
    localStorage.setItem("stash-snap-data", JSON.stringify(stash));
  }, [stash]);

  const totalYards = useMemo(() => stash.reduce((sum, item) => sum + item.yardage, 0), [stash]);
  const collections = useMemo(() => [...new Set(stash.map((item) => item.collection))], [stash]);

  const filtered = stash.filter((item) => {
    const searchText = search.toLowerCase();

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
      id: Date.now(),
      ...form,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    };

    setStash((prev) => [newItem, ...prev]);
    setAdding(false);
    showToast("✅ Added to your stash!");
  };

  const handleDelete = (id) => {
    setStash((prev) => prev.filter((item) => item.id !== id));
    showToast("Removed from stash");
  };

  return (
    <div style={{ minHeight: "100vh", background: PALETTE.cream, fontFamily: "Georgia, serif", width: "100%" }}>
      <header style={headerStyle}>
        <div style={contentWrap}>
          <p style={eyebrowStyle}>Crafting Dreams Fabric</p>
          <h1 style={{ color: "white", fontSize: 34, margin: "0 0 4px" }}>Stash Snap ✂️</h1>
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
                <FabricCard key={item.id} item={item} onDelete={handleDelete} />
              ))}
            </div>
          </>
        )}

        {activeTab === "bundles" && (
          <div>
            <h2>Build Your Bundle 🎨</h2>
            <p style={{ color: "#999", fontFamily: "sans-serif" }}>
              You already have a great start. Here’s what you have — and what to add to create a balanced, beautiful bundle.
            </p>

            {stash.map((item) => {
              const addColors = (BUNDLE_SUGGESTIONS[item.color] || ["Cream", "Sage", "Cloud", "Honey"]).slice(0, 4);

              return (
                <div key={item.id} style={cardStyle}>
                  <div style={{ padding: 16 }}>
                    <strong>{item.name}</strong>
                    <p style={{ fontFamily: "sans-serif", color: "#999" }}>
                      You have: {item.color} · {item.style} · {item.yardage} yds
                    </p>

                    <p style={smallHeadingStyle}>Add these to complete the look</p>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {addColors.map((color) => (
                        <span key={color} style={tagStyle(PALETTE.mist, PALETTE.teal)}>
                          ➕ {color}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
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

      {toast && <div style={toastStyle}>{toast}</div>}
    </div>
  );
}

const APP_WIDTH = 760;

const contentWrap = {
  width: "100%",
  maxWidth: APP_WIDTH,
  margin: "0 auto",
  paddingLeft: 16,
  paddingRight: 16,
  boxSizing: "border-box",
};

const contentWrapNoPadding = {
  width: "100%",
  maxWidth: APP_WIDTH,
  margin: "0 auto",
  display: "flex",
};

const headerStyle = {
  background: `linear-gradient(160deg, ${PALETTE.teal} 0%, #3a6b5e 100%)`,
  padding: "48px 0 28px",
};

const eyebrowStyle = {
  color: "rgba(255,255,255,0.6)",
  fontSize: 11,
  fontFamily: "sans-serif",
  letterSpacing: 3,
  textTransform: "uppercase",
  margin: "0 0 4px",
};

const statBoxStyle = {
  background: "rgba(255,255,255,0.12)",
  borderRadius: 12,
  padding: "10px 14px",
  flex: 1,
  textAlign: "center",
};

function tabStyle(active) {
  return {
    flex: 1,
    padding: "14px 8px",
    background: "none",
    border: "none",
    fontSize: 13,
    fontFamily: "sans-serif",
    fontWeight: 700,
    color: active ? PALETTE.teal : "#bbb",
    borderBottom: `2px solid ${active ? PALETTE.teal : "transparent"}`,
  };
}

const searchStyle = {
  width: "100%",
  padding: "12px 16px",
  border: `1.5px solid ${PALETTE.blush}`,
  borderRadius: 50,
  fontSize: 14,
  fontFamily: "sans-serif",
  background: "white",
  boxSizing: "border-box",
  marginBottom: 12,
};

const cardStyle = {
  background: "white",
  borderRadius: 16,
  overflow: "hidden",
  boxShadow: "0 2px 12px rgba(44,44,44,0.07)",
  marginBottom: 12,
};

const modalOverlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(44,44,44,0.75)",
  zIndex: 90,
  display: "flex",
  alignItems: "flex-end",
  justifyContent: "center",
};

const modalBox = {
  background: PALETTE.cream,
  borderRadius: "24px 24px 0 0",
  padding: "28px 24px 40px",
  width: "100%",
  maxWidth: APP_WIDTH,
  maxHeight: "90vh",
  overflowY: "auto",
  fontFamily: "Georgia, serif",
  boxSizing: "border-box",
};

const closeButton = {
  border: "none",
  background: PALETTE.mist,
  borderRadius: "50%",
  width: 32,
  height: 32,
  fontSize: 18,
};

const labelStyle = {
  fontSize: 11,
  fontFamily: "sans-serif",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: 1,
  color: "#999",
  display: "block",
  marginBottom: 6,
};

const inputStyle = {
  width: "100%",
  padding: 12,
  border: `1.5px solid ${PALETTE.blush}`,
  borderRadius: 10,
  fontSize: 15,
  background: "white",
  boxSizing: "border-box",
  fontFamily: "Georgia, serif",
  outline: "none",
  marginBottom: 16,
};

const pillWrapStyle = {
  display: "flex",
  gap: 6,
  flexWrap: "wrap",
  marginBottom: 16,
};

function pillStyle(active, color) {
  return {
    padding: "6px 12px",
    borderRadius: 99,
    border: `1.5px solid ${active ? color : PALETTE.blush}`,
    background: active ? color : "white",
    color: active ? "white" : PALETTE.ink,
    fontSize: 13,
    cursor: "pointer",
    whiteSpace: "nowrap",
    fontFamily: "sans-serif",
  };
}

function tagStyle(background, color) {
  return {
    background,
    color,
    padding: "3px 9px",
    borderRadius: 99,
    fontSize: 11,
    fontFamily: "sans-serif",
  };
}

const smallHeadingStyle = {
  fontSize: 11,
  fontFamily: "sans-serif",
  fontWeight: 700,
  color: "#bbb",
  textTransform: "uppercase",
  letterSpacing: 1,
  margin: "0 0 6px",
};

const removeButton = {
  marginTop: 12,
  border: "1px solid #f0c8c0",
  background: "none",
  color: PALETTE.rose,
  borderRadius: 8,
  padding: "6px 14px",
};

const shopBoxStyle = {
  background: `linear-gradient(135deg, ${PALETTE.blush}, ${PALETTE.cloud})`,
  borderRadius: 20,
  padding: 24,
  textAlign: "center",
};

const shopButtonStyle = {
  display: "inline-block",
  background: PALETTE.teal,
  color: "white",
  padding: "12px 24px",
  borderRadius: 50,
  textDecoration: "none",
  fontFamily: "sans-serif",
  fontWeight: 700,
};

const floatingButtonStyle = {
  position: "fixed",
  bottom: 28,
  left: "50%",
  transform: "translateX(-50%)",
  background: `linear-gradient(135deg, ${PALETTE.teal}, ${PALETTE.sage})`,
  color: "white",
  border: "none",
  borderRadius: 50,
  padding: "18px 32px",
  fontSize: 17,
  boxShadow: "0 6px 28px rgba(74,124,111,0.45)",
  fontFamily: "sans-serif",
  fontWeight: 700,
  zIndex: 50,
};

const toastStyle = {
  position: "fixed",
  top: 24,
  left: "50%",
  transform: "translateX(-50%)",
  background: PALETTE.ink,
  color: "white",
  padding: "12px 24px",
  borderRadius: 50,
  fontSize: 14,
  fontFamily: "sans-serif",
  zIndex: 200,
};
