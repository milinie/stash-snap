import { supabase } from "./supabaseClient";
import { compressImageToBlob } from "./bundleLogic";

const BUCKET = "fabric-photos";

// Uploads a compressed version of `file` to {userId}/{fabricId}-{timestamp}.jpg
// and returns a signed URL good for 1 year (bucket is private, scoped by RLS).
export async function uploadFabricPhoto(userId, fabricId, file) {
  const blob = await compressImageToBlob(file);
  const path = `${userId}/${fabricId}-${Date.now()}.jpg`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, blob, { contentType: "image/jpeg", upsert: false });

  if (uploadError) throw uploadError;

  const { data: signedData, error: signError } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, 60 * 60 * 24 * 365);

  if (signError) throw signError;

  return { path, url: signedData.signedUrl };
}

export async function deleteFabricPhoto(path) {
  if (!path) return;
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) console.error("Failed to delete fabric photo:", error);
}

// Re-signs a stored path if the cached signed URL has expired.
// Call this defensively when loading fabrics if a photo fails to render.
export async function refreshSignedUrl(path) {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, 60 * 60 * 24 * 365);

  if (error) {
    console.error("Failed to refresh signed URL:", error);
    return null;
  }
  return data.signedUrl;
}
