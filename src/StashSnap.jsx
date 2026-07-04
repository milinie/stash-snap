import React, { useEffect, useMemo, useState } from "react";
import { PALETTE, COLLECTIONS, COLOR_TAGS, STYLE_TAGS } from "./lib/constants";
import { analyzeBundle, autoBuildBundle, mapMissingToFilter } from "./lib/bundleLogic";
import {
  addWallButtonStyle,
  autoButtonStyle,
  clearWallButtonStyle,
  contentWrap,
  contentWrapNoPadding,
  designWallBoxStyle,
  designWallGridStyle,
  eyebrowStyle,
  floatingButtonStyle,
  headerStyle,
  missingItemStyle,
  miniButtonStyle,
  pillStyle,
  removeButton,
  saveBundleButtonStyle,
  searchStyle,
  shopBoxStyle,
  shopButtonStyle,
  smallHeadingStyle,
  statBoxStyle,
  tabStyle,
  wallRemoveButtonStyle,
  cardStyle,
  addWallButtonStyle as addWallStyleAlias
} from "./lib/styles";
import { FabricThumb } from "./components/FabricThumb";
import { FabricCard } from "./components/FabricCard";
import { AddModal } from "./components/AddModal";
import { Toast } from "./components/Toast";
import { LoadingSpinner } from "./components/LoadingSpinner";
import { EmptyState } from "./components/EmptyState";
import { PaywallBanner } from "./components/PaywallBanner";
import { AppFooter } from "./components/AppFooter";
import { useAuth } from "./hooks/useAuth";
import { useFabricStash } from "./hooks/useFabricStash";
import { useBundles } from "./hooks/useBundles";

export function StashSnap({ onOpenAccount }) {
  const { user } = useAuth();
  const {
    stash,
    stashLoading,
    cloudMode,
    isAtFreeLimit,
    freeLimit,
    totalYards,
    collections,
    addFabric,
    updateFabric,
    deleteFabric
  } = useFabricStash();
  const { savedBundles, bundlesLoading, saveBundle, deleteBundle } = useBundles({ cloudMode, stash });

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

  const missing = analyzeBundle(designWall);

  const filtered = stash.filter((item) => {
    const searchText = search.toLowerCase();
    const searchableItem = [item.name, item.color, item.style, item.collection, item.notes, String(item.yardage)].join(" ").toLowerCase();

    if (filterStyle && item.style !== filterStyle) return false;
    if (search && !searchableItem.includes(searchText)) return false;

    return true;
  });

  const bundleFiltered = stash.filter((item) => {
    const searchText = bundleSearch.toLowerCase();
    const searchableItem = [item.name, item.color, item.style, item.collection, item.notes, String(item.yardage)].join(" ").toLowerCase();

    if (bundleFilter && item.style !== bundleFilter) return false;
    if (bundleColorFilter && item.color !== bundleColorFilter) return false;
    if (bundleCollectionFilter && item.collection !== bundleCollectionFilter) return false;
    if (bundleSearch && !searchableItem.includes(searchText)) return false;

    return true;
  });

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 2500);
  };

  const handleSave = async (form) => {
    try {
      await addFabric(form);
      setAdding(false);
      showToast("✅ Added to your stash!");
    } catch (error) {
      if (error.message === "FREE_LIMIT_REACHED") {
        setAdding(false);
        onOpenAccount();
      } else {
        console.error(error);
        showToast("Something went wrong saving that fabric.");
      }
    }
  };

  const handleUpdate = async (updated) => {
    try {
      const merged = await updateFabric(updated);
      setDesignWall((prev) => prev.map((item) => (item.id === merged.id ? { ...item, ...merged } : item)));
      setEditingItem(null);
      showToast("✏️ Fabric updated!");
    } catch (error) {
      console.error(error);
      showToast("Something went wrong updating that fabric.");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteFabric(id);
      setDesignWall((prev) => prev.filter((item) => item.id !== id));
      showToast("Removed from stash");
    } catch (error) {
      console.error(error);
      showToast("Could not remove that fabric.");
    }
  };

  const handleSaveBundle = async () => {
    if (designWall.length === 0) {
      showToast("Add fabrics to the wall first");
      return;
    }

    try {
      await saveBundle(designWall);
      showToast("✨ Bundle saved!");
    } catch (error) {
      console.error(error);
      showToast("Could not save that bundle.");
    }
  };

  const handleDeleteBundle = async (id) => {
    try {
      await deleteBundle(id);
      showToast("Bundle deleted");
    } catch (error) {
      console.error(error);
      showToast("Could not delete that bundle.");
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: PALETTE.cream, fontFamily: "Georgia, serif", width: "100%" }}>
      <header style={headerStyle}>
        <div style={contentWrap}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <p style={eyebrowStyle}>Crafting Dreams Fabric</p>
              <h1 style={{ color: "white", fontSize: 34, margin: "0 0 4px" }}>Stash Snap 📸</h1>
              <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 14, margin: "0 0 24px", fontStyle: "italic" }}>
                Snap · Identify · Organize
              </p>
            </div>
            <button
              onClick={onOpenAccount}
              aria-label="Account"
              style={{
                background: "rgba(255,255,255,0.15)",
                border: "none",
                borderRadius: 50,
                width: 40,
                height: 40,
                color: "white",
                fontSize: 16,
                cursor: "pointer",
                fontFamily: "sans-serif"
              }}
            >
              {user ? "👤" : "🔑"}
            </button>
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            {[
              { label: `${stash.length} Fabrics`, icon: "🧵" },
              { label: `${totalYards.toFixed(1)} Yards`, icon: "📏" },
              { label: `${collections.length} Collections`, icon: "📂" }
            ].map((stat) => (
              <div key={stat.label} style={statBoxStyle}>
                <div style={{ fontSize: 18 }}>{stat.icon}</div>
                <div style={{ color: "white", fontSize: 11, fontFamily: "sans-serif", marginTop: 2 }}>{stat.label}</div>
              </div>
            ))}
          </div>

          {cloudMode && (
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 11, fontFamily: "sans-serif", marginTop: 10, marginBottom: 0 }}>
              ☁️ Synced across your devices
            </p>
          )}
        </div>
      </header>

      <nav style={{ background: "white", borderBottom: `1px solid ${PALETTE.blush}` }}>
        <div style={contentWrapNoPadding}>
          {[
            ["stash", "My Stash"],
            ["bundles", "Build Bundle"],
            ["saved", "Saved Bundles"],
            ["shop", "Shop Match"]
          ].map(([id, label]) => (
            <button key={id} onClick={() => setActiveTab(id)} style={tabStyle(activeTab === id)}>
              {label}
            </button>
          ))}
        </div>
      </nav>

      <main style={{ ...contentWrap, paddingTop: 20, paddingBottom: 40 }}>
        {stashLoading ? (
          <LoadingSpinner />
        ) : (
          <>
            {isAtFreeLimit && !cloudMode && (
              <PaywallBanner variant="limit" onUpgrade={onOpenAccount} />
            )}

            {activeTab === "stash" && (
              <>
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="🔍 Search your stash..." style={searchStyle} />

                <div style={{ display: "flex", gap: 6, overflowX: "auto", marginBottom: 16 }}>
                  <button onClick={() => setFilterStyle(null)} style={pillStyle(!filterStyle, PALETTE.teal)}>All</button>
                  {STYLE_TAGS.map((style) => (
                    <button key={style} onClick={() => setFilterStyle(filterStyle === style ? null : style)} style={pillStyle(filterStyle === style, PALETTE.rose)}>
                      {style}
                    </button>
                  ))}
                </div>

                {filtered.length === 0 ? (
                  <EmptyState
                    icon="🧵"
                    title={search || filterStyle ? "No fabrics match" : "Your stash is empty"}
                    subtitle={search || filterStyle ? "Try a different search or filter." : "Add your first fabric to get started."}
                    actionLabel={search || filterStyle ? undefined : "Add Fabric"}
                    onAction={search || filterStyle ? undefined : () => setAdding(true)}
                  />
                ) : (
                  filtered.map((item) => (
                    <FabricCard key={item.id} item={item} onDelete={handleDelete} onEdit={setEditingItem} />
                  ))
                )}
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

                    <div style={designWallGridStyle}>
                      {designWall.map((item) => (
                        <div key={item.id} style={{ position: "relative" }}>
                          <FabricThumb {...item} size={70} />
                          <button onClick={() => setDesignWall((prev) => prev.filter((f) => f.id !== item.id))} style={wallRemoveButtonStyle}>×</button>
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
                              <button
                                onClick={() => {
                                  const filter = mapMissingToFilter(m);
                                  if (filter) setBundleFilter(filter);
                                }}
                                style={miniButtonStyle}
                              >
                                Find in Stash
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <button onClick={() => setDesignWall([])} style={clearWallButtonStyle}>Clear Wall</button>
                    <button onClick={handleSaveBundle} style={saveBundleButtonStyle}>💾 Save This Bundle</button>
                  </div>
                )}

                <input value={bundleSearch} onChange={(e) => setBundleSearch(e.target.value)} placeholder="🔍 Search by name, notes, color, style..." style={searchStyle} />

                <p style={smallHeadingStyle}>Filter by color</p>
                <div style={{ display: "flex", gap: 6, overflowX: "auto", marginBottom: 12 }}>
                  <button onClick={() => setBundleColorFilter(null)} style={pillStyle(!bundleColorFilter, PALETTE.teal)}>All</button>
                  {COLOR_TAGS.map((color) => (
                    <button key={color} onClick={() => setBundleColorFilter(bundleColorFilter === color ? null : color)} style={pillStyle(bundleColorFilter === color, PALETTE.teal)}>
                      {color}
                    </button>
                  ))}
                </div>

                <p style={smallHeadingStyle}>Filter by style</p>
                <div style={{ display: "flex", gap: 6, overflowX: "auto", marginBottom: 12 }}>
                  <button onClick={() => setBundleFilter(null)} style={pillStyle(!bundleFilter, PALETTE.rose)}>All</button>
                  {STYLE_TAGS.map((style) => (
                    <button key={style} onClick={() => setBundleFilter(bundleFilter === style ? null : style)} style={pillStyle(bundleFilter === style, PALETTE.rose)}>
                      {style}
                    </button>
                  ))}
                </div>

                <p style={smallHeadingStyle}>Filter by collection</p>
                <div style={{ display: "flex", gap: 6, overflowX: "auto", marginBottom: 16 }}>
                  <button onClick={() => setBundleCollectionFilter(null)} style={pillStyle(!bundleCollectionFilter, PALETTE.honey)}>All</button>
                  {COLLECTIONS.map((collection) => (
                    <button key={collection} onClick={() => setBundleCollectionFilter(bundleCollectionFilter === collection ? null : collection)} style={pillStyle(bundleCollectionFilter === collection, PALETTE.honey)}>
                      {collection}
                    </button>
                  ))}
                </div>

                {bundleFiltered.length === 0 ? (
                  <EmptyState icon="🎨" title="No fabrics match these filters" subtitle="Try clearing a filter or search term." />
                ) : (
                  bundleFiltered.map((item) => (
                    <div key={item.id} style={cardStyle}>
                      <div style={{ display: "flex", padding: 12 }}>
                        <FabricThumb {...item} />
                        <div style={{ marginLeft: 12, flex: 1 }}>
                          <strong>{item.name}</strong>
                          <p style={{ fontSize: 12, color: "#999" }}>{item.color} · {item.yardage} yds</p>
                          <button
                            onClick={() => setDesignWall((prev) => (prev.find((f) => f.id === item.id) ? prev : [...prev, item]))}
                            style={addWallButtonStyle}
                          >
                            {designWall.find((f) => f.id === item.id) ? "Added ✓" : "Add to Wall"}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === "saved" && (
              <div>
                <h2>Saved Bundles 💾</h2>
                {bundlesLoading ? (
                  <LoadingSpinner label="Loading saved bundles..." />
                ) : savedBundles.length === 0 ? (
                  <EmptyState icon="💾" title="No saved bundles yet" subtitle="Build a bundle on the Build Bundle tab, then save it here." />
                ) : (
                  savedBundles.map((bundle) => (
                    <div key={bundle.id} style={cardStyle}>
                      <div style={{ padding: 16 }}>
                        <h3 style={{ marginTop: 0 }}>{bundle.name}</h3>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
                          {bundle.fabrics.map((fabric) => <FabricThumb key={fabric.id} {...fabric} size={64} />)}
                        </div>
                        <button onClick={() => { setDesignWall(bundle.fabrics); setActiveTab("bundles"); }} style={addWallStyleAlias}>
                          Open in Design Wall
                        </button>
                        <button onClick={() => handleDeleteBundle(bundle.id)} style={{ ...removeButton, marginLeft: 8 }}>
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === "shop" && (
              <div>
                <h2>Shop Your Perfect Match 🛍️</h2>
                <div style={shopBoxStyle}>
                  <div style={{ fontSize: 40 }}>🧵</div>
                  <h3>Complete Your Quilt</h3>
                  <p style={{ fontFamily: "sans-serif", color: "#777" }}>
                    Shop fabrics that can help round out your bundle and bring your quilt together.
                  </p>
                  <a href="https://craftingdreamsfabric.com" target="_blank" rel="noopener noreferrer" style={shopButtonStyle}>
                    Shop Matching Fabrics →
                  </a>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      <AppFooter />

      <button onClick={() => setAdding(true)} style={floatingButtonStyle}>＋ Add Fabric</button>

      {adding && <AddModal onSave={handleSave} onClose={() => setAdding(false)} />}
      {editingItem && <AddModal initialData={editingItem} onSave={handleUpdate} onClose={() => setEditingItem(null)} />}
      <Toast message={toast} />
    </div>
  );
}
