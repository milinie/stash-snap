export const PALETTE = {
  cream: "#FAF6F0",
  blush: "#F2D5C8",
  rose: "#C97B6E",
  sage: "#8FAF8A",
  teal: "#4A7C6F",
  ink: "#2C2C2C",
  mist: "#E8EEE7",
  honey: "#D4A853",
  cloud: "#E8E4EE"
};

export const STYLE_TAGS = ["Floral", "Geometric", "Solid", "Stripe", "Blender", "Vintage"];

export const COLOR_TAGS = [
  "White", "Ivory", "Cream", "Beige", "Tan", "Brown",
  "Black", "Gray", "Charcoal",
  "Red", "Coral", "Rose", "Pink", "Blush", "Peach",
  "Orange", "Gold", "Honey", "Yellow",
  "Green", "Sage", "Mint", "Olive", "Teal",
  "Blue", "Navy", "Aqua", "Turquoise",
  "Purple", "Lavender", "Lilac",
  "Cloud", "Multi", "Low Volume"
];

export const COLLECTIONS = ["My Stash", "Current Project", "Gifted", "Shop Sample", "Fat Quarters"];

export const FABRIC_TYPES = [
  "Single Fabric",
  "Yardage",
  "Fat Quarter",
  "Fat Quarter Bundle",
  '10" Squares',
  "Charm Pack",
  "Jelly Roll",
  "Layer Cake",
  "Wide Back",
  "Scrap",
  "Other"
];

export const SAMPLE_STASH = [
  { id: 1, name: "Garden Party Floral", color: "Rose", style: "Floral", fabricType: "Yardage", yardage: 2.5, collection: "Current Project", notes: "For quilt border", photo: null, date: "Apr 28" },
  { id: 2, name: "Sage Blender", color: "Sage", style: "Blender", fabricType: "Yardage", yardage: 1, collection: "My Stash", notes: "", photo: null, date: "Apr 20" },
  { id: 3, name: "Honey Geometric", color: "Honey", style: "Geometric", fabricType: "Yardage", yardage: 3, collection: "Fat Quarters", notes: "Lori Holt style", photo: null, date: "Apr 15" },
  { id: 4, name: "Cloud Stripe", color: "Cloud", style: "Stripe", fabricType: "Yardage", yardage: 0.5, collection: "My Stash", notes: "Sashing fabric", photo: null, date: "Apr 10" },
  {
    id: 5,
    name: "Lori Holt Berry & Sage Fat Quarter Bundle",
    color: "Sage",
    style: "Floral",
    fabricType: "Fat Quarter Bundle",
    pieceCount: 21,
    pieceSize: "Fat Quarter",
    yardage: 5.25,
    collection: "My Stash",
    notes: "21 coordinating prints from Berry & Sage collection",
    photo: null,
    date: "May 5"
  }
];

export const BUNDLE_SUGGESTIONS = {
  Rose: ["Sage", "Cream", "Honey", "Cloud"],
  Sage: ["Rose", "Honey", "Cream", "Blush"],
  Honey: ["Teal", "Cream", "Rose", "Sage"],
  Teal: ["Honey", "Cream", "Blush", "Lavender"],
  Lavender: ["Blush", "Cloud", "Cream", "Sage"],
  Navy: ["Cream", "Rose", "Honey", "Cloud"],
  Blush: ["Sage", "Lavender", "Cream", "Cloud"],
  Cloud: ["Rose", "Sage", "Cream", "Honey"],
  Cream: ["Rose", "Sage", "Honey", "Cloud"]
};

export const APP_WIDTH = 760;
export const FREE_TIER_FABRIC_LIMIT = 30;
export const APP_VERSION = "1.0.0-beta";
