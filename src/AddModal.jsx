import React, { useState } from "react";
import { COLOR_TAGS, COLLECTIONS, FABRIC_TYPES, STYLE_TAGS } from "../lib/constants";
import { calculateYardageFromPieces, compressImage } from "../lib/bundleLogic";
import {
  cancelModalButtonStyle,
  inputStyle,
  labelStyle,
  modalBox,
  modalOverlay,
  saveModalButtonStyle
} from "../lib/styles";
import { FabricThumb } from "./FabricThumb";

const PIECE_FIELD_TYPES = [
  "Fat Quarter",
  "Fat Quarter Bundle",
  '10" Squares',
  "Charm Pack",
  "Jelly Roll",
  "Layer Cake"
];

export function AddModal({ onSave, onClose, initialData }) {
  const [form, setForm] = useState({
    id: initialData ? initialData.id : undefined,
    date: initialData ? initialData.date : undefined,
    name: initialData ? initialData.name : "",
    color: initialData ? initialData.color : "Rose",
    style: initialData ? initialData.style : "Floral",
    fabricType: initialData ? initialData.fabricType : "Yardage",
    pieceCount: initialData ? initialData.pieceCount : "",
    pieceSize: initialData ? initialData.pieceSize : "",
    yardage: initialData ? String(initialData.yardage) : "",
    collection: initialData ? initialData.collection : "My Stash",
    notes: initialData ? initialData.notes : "",
    photo: initialData ? initialData.photo : null,
    photoFile: null, // raw File, only set when the person picks a NEW photo this session
    photoRemoved: false // true if they explicitly removed an existing cloud photo
  });

  const [saving, setSaving] = useState(false);

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handlePhoto = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const previewDataUrl = await compressImage(file);
      setForm((prev) => ({ ...prev, photo: previewDataUrl, photoFile: file, photoRemoved: false }));
    } catch (error) {
      console.error("Photo compression failed:", error);
      alert("That photo could not be added. Try a smaller image.");
    }
  };

  const removePhoto = () => {
    setForm((prev) => ({ ...prev, photo: null, photoFile: null, photoRemoved: true }));
  };

  const canSave = form.name.trim() !== "" && String(form.yardage).trim() !== "" && !saving;

  const showPieceFields = PIECE_FIELD_TYPES.includes(form.fabricType);

  const handleFabricTypeChange = (e) => {
    const fabricType = e.target.value;
    const calculated = calculateYardageFromPieces(fabricType, form.pieceCount, form.pieceSize);

    setForm((prev) => ({
      ...prev,
      fabricType,
      yardage: calculated !== "" ? String(calculated) : prev.yardage
    }));
  };

  const handlePieceCountChange = (e) => {
    const pieceCount = e.target.value;
    const calculated = calculateYardageFromPieces(form.fabricType, pieceCount, form.pieceSize);

    setForm((prev) => ({
      ...prev,
      pieceCount,
      yardage: calculated !== "" ? String(calculated) : prev.yardage
    }));
  };

  const handlePieceSizeChange = (e) => {
    const pieceSize = e.target.value;
    const calculated = calculateYardageFromPieces(form.fabricType, form.pieceCount, pieceSize);

    setForm((prev) => ({
      ...prev,
      pieceSize,
      yardage: calculated !== "" ? String(calculated) : prev.yardage
    }));
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await onSave({
        ...form,
        id: form.id || Date.now(),
        date: form.date || new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        yardage: parseFloat(form.yardage) || 0
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={modalOverlay}>
      <div style={modalBox}>
        <h2>{initialData ? "Edit Fabric" : "Add Fabric"}</h2>

        <label style={labelStyle}>Fabric Photo</label>
        <input type="file" accept="image/*" onChange={handlePhoto} style={{ marginBottom: 16 }} />

        {form.photo && (
          <>
            <div style={{ borderRadius: 14, overflow: "hidden", width: 96, height: 96, marginBottom: 8 }}>
              <FabricThumb photo={form.photo} size={96} />
            </div>

            <button type="button" onClick={removePhoto} style={{ ...cancelModalButtonStyle, marginBottom: 16 }}>
              Remove Photo
            </button>
          </>
        )}

        <label style={labelStyle}>Fabric Name</label>
        <input
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
          placeholder="Example: Sage Floral"
          style={inputStyle}
        />

        <label style={labelStyle}>Fabric Type</label>
        <select value={form.fabricType} onChange={handleFabricTypeChange} style={inputStyle}>
          {FABRIC_TYPES.map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>

        {showPieceFields && (
          <>
            <label style={labelStyle}>Piece Count</label>
            <input
              value={form.pieceCount}
              onChange={handlePieceCountChange}
              placeholder="Example: 21"
              inputMode="numeric"
              style={inputStyle}
            />

            <label style={labelStyle}>Piece Size</label>
            <input
              value={form.pieceSize}
              onChange={handlePieceSizeChange}
              placeholder='Example: Fat Quarter, 10" square, 5" charm'
              style={inputStyle}
            />
          </>
        )}

        <label style={labelStyle}>Yardage</label>
        <input
          value={form.yardage}
          onChange={(e) => update("yardage", e.target.value)}
          placeholder="Example: 2.5"
          inputMode="decimal"
          style={inputStyle}
        />

        <label style={labelStyle}>Color</label>
        <input
          value={form.color}
          onChange={(e) => update("color", e.target.value)}
          placeholder="Example: Dusty Rose, Sage Green, Cream, Navy"
          list="color-options"
          style={inputStyle}
        />
        <datalist id="color-options">
          {COLOR_TAGS.map((color) => (
            <option key={color} value={color} />
          ))}
        </datalist>

        <label style={labelStyle}>Style</label>
        <select value={form.style} onChange={(e) => update("style", e.target.value)} style={inputStyle}>
          {STYLE_TAGS.map((style) => (
            <option key={style} value={style}>{style}</option>
          ))}
        </select>

        <label style={labelStyle}>Collection</label>
        <select value={form.collection} onChange={(e) => update("collection", e.target.value)} style={inputStyle}>
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
          onClick={handleSubmit}
          style={{ ...saveModalButtonStyle, opacity: canSave ? 1 : 0.5 }}
        >
          {saving ? "Saving..." : initialData ? "Save Changes" : "Save Fabric"}
        </button>

        <button onClick={onClose} style={cancelModalButtonStyle} disabled={saving}>
          Cancel
        </button>
      </div>
    </div>
  );
}
