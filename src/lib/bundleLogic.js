import { BUNDLE_SUGGESTIONS } from "./constants";

export function getColorHex(color) {
  const colorMap = {
    Rose: "#C97B6E",
    Sage: "#8FAF8A",
    Cream: "#FAF0D7",
    Navy: "#2E4057",
    Honey: "#D4A853",
    Lavender: "#B8A8C8",
    Teal: "#4A7C6F",
    Blush: "#F2D5C8",
    Cloud: "#E8E4EE"
  };
  return colorMap[color] || "#DDD";
}

export function compressImage(file, maxWidth = 350, quality = 0.35) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();

      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const canvas = document.createElement("canvas");

        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);

        const ctx = canvas.getContext("2d");

        if (!ctx) {
          reject(new Error("Canvas not supported"));
          return;
        }

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

// Same compression, but resolves to a Blob instead of a data URL â used when
// uploading to Supabase Storage rather than storing inline in localStorage.
export function compressImageToBlob(file, maxWidth = 1200, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();

      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const canvas = document.createElement("canvas");

        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);

        const ctx = canvas.getContext("2d");

        if (!ctx) {
          reject(new Error("Canvas not supported"));
          return;
        }

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          (blob) => (blob ? resolve(blob) : reject(new Error("Blob conversion failed"))),
          "image/jpeg",
          quality
        );
      };

      img.onerror = reject;
      img.src = event.target.result;
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function calculateYardageFromPieces(fabricType, pieceCount, pieceSize) {
  const count = Number(pieceCount) || 0;
  const type = String(fabricType || "").toLowerCase();
  const size = String(pieceSize || "").toLowerCase();

  if (count <= 0) return "";

  if (type.includes("fat quarter") || size.includes("fat quarter")) {
    return count * 0.25;
  }

  if (type.includes("charm") || size.includes('5"')) {
    return ((count * 5 * 5) / 1296).toFixed(2);
  }

  if (type.includes('10"') || type.includes("layer cake") || size.includes('10"')) {
    return ((count * 10 * 10) / 1296).toFixed(2);
  }

  return "";
}

export function autoBuildBundle(stash) {
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

export function analyzeBundle(designWall) {
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

export function mapMissingToFilter(m) {
  if (m === "Blender") return "Blender";
  if (m === "Focal Print") return "Floral";
  if (m === "Solid or Stripe") return "Solid";
  return null;
}

export function pairingsForColor(color) {
  return (BUNDLE_SUGGESTIONS[color] || ["Cream", "Sage", "Cloud", "Honey"]).slice(0, 4);
}
