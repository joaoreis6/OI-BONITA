const BLOB_STORE_NAME = "oi-bonita-product-images";

function toArrayBuffer(bytes: Uint8Array) {
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}

export function isNetlifyBlobStorageEnabled() {
  return process.env.NODE_ENV === "production"
    && (process.env.NETLIFY === "true" || Boolean(process.env.NETLIFY_BLOBS_CONTEXT));
}

async function getBlobStore() {
  const { getStore } = await import("@netlify/blobs");
  return getStore({ name: BLOB_STORE_NAME, consistency: "strong" });
}

export async function storeProductImageBlob(filename: string, bytes: Uint8Array, mimeType: string) {
  const store = await getBlobStore();
  await store.set(filename, toArrayBuffer(bytes), { metadata: { mimeType } });
}

export async function readProductImageBlob(filename: string) {
  const store = await getBlobStore();
  const bytes = await store.get(filename, { type: "arrayBuffer" });
  return bytes ? new Uint8Array(bytes) : null;
}

export async function removeProductImageBlob(filename: string) {
  const store = await getBlobStore();
  const bytes = await store.get(filename, { type: "arrayBuffer" });
  if (!bytes) return null;
  await store.delete(filename);
  return new Uint8Array(bytes);
}

export async function restoreProductImageBlob(filename: string, backup: Uint8Array, mimeType: string) {
  const store = await getBlobStore();
  await store.set(filename, toArrayBuffer(backup), { metadata: { mimeType } });
}
