import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, stat } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import {
  MAX_PRODUCT_IMAGE_BYTES,
  isCompleteProductImageOrder,
  productImagePositions,
  removeStoredProductImage,
  resolveProductImageStorage,
  restoreStoredProductImage,
  storeProductImage,
  validateProductImageFile,
} from "../src/services/product-image-storage.ts";

const jpeg = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00]);
const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const webp = new Uint8Array([0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50]);
const file = (name, type, bytes) => new File([bytes], name, { type });

test("accepts JPEG, PNG and WebP only when extension, MIME and content signature agree", async () => {
  for (const [name, type, bytes] of [["photo.jpg", "image/jpeg", jpeg], ["photo.png", "image/png", png], ["photo.webp", "image/webp", webp]]) {
    assert.equal((await validateProductImageFile(file(name, type, bytes))).ok, true);
  }
  assert.equal((await validateProductImageFile(file("photo.jpg", "image/png", jpeg))).ok, false);
  assert.equal((await validateProductImageFile(file("photo.jpg", "image/jpeg", png))).ok, false);
  assert.equal((await validateProductImageFile(file("photo.gif", "image/gif", jpeg))).ok, false);
});

test("rejects empty, oversized and unsafe filenames before storage", async () => {
  assert.equal((await validateProductImageFile(file("empty.png", "image/png", new Uint8Array()))).ok, false);
  assert.equal((await validateProductImageFile(file("large.jpg", "image/jpeg", new Uint8Array(MAX_PRODUCT_IMAGE_BYTES + 1)))).ok, false);
  assert.equal((await validateProductImageFile(file("../escape.jpg", "image/jpeg", jpeg))).ok, false);
  assert.equal((await validateProductImageFile(file("C:\\folder\\escape.jpg", "image/jpeg", jpeg))).ok, false);
});

test("persists an image under a safe storage path and removes/restores it by generated URL", async () => {
  const cwd = await mkdtemp(path.join(os.tmpdir(), "oi-bonita-image-test-"));
  const relativeDirectory = "uploads/products";
  try {
    await mkdir(path.join(cwd, "data"), { recursive: true });
    const stored = await storeProductImage(file("product photo.png", "image/png", png), cwd, relativeDirectory);
    const location = resolveProductImageStorage(cwd, relativeDirectory);
    const diskPath = path.join(location.directory, stored.filename);
    assert.match(stored.url, /^\/api\/product-images\/[0-9a-f-]+\.png$/);
    assert.deepEqual(new Uint8Array(await readFile(diskPath)), png);

    const removed = await removeStoredProductImage(stored.url, cwd, relativeDirectory);
    assert.equal(removed.managed, true);
    assert.ok(removed.backup);
    await assert.rejects(stat(diskPath));

    await restoreStoredProductImage(stored.url, removed.backup, cwd, relativeDirectory);
    assert.deepEqual(new Uint8Array(await readFile(diskPath)), png);
    const other = await removeStoredProductImage("/images/editorial/portrait.png", cwd, relativeDirectory);
    assert.equal(other.managed, false);
  } finally {
    await rm(cwd, { recursive: true, force: true });
  }
});

test("rejects storage paths that escape or replace the storage root", () => {
  assert.throws(() => resolveProductImageStorage("C:\\workspace", "../outside"));
  assert.throws(() => resolveProductImageStorage("C:\\workspace", "."));
  assert.throws(() => resolveProductImageStorage("C:\\workspace", "uploads/../outside"));
});

test("refuses local disk writes in production mode", async () => {
  const oldNodeEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = "production";
  try {
    await assert.rejects(storeProductImage(file("photo.jpg", "image/jpeg", jpeg)), /disabled in production/);
  } finally {
    if (oldNodeEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = oldNodeEnv;
  }
});

test("image ordering includes every associated image exactly once; the first position is primary", () => {
  assert.equal(isCompleteProductImageOrder(["a", "b", "c"], ["c", "a", "b"]), true);
  assert.deepEqual(productImagePositions(["c", "a", "b"]), [{ id: "c", position: 0 }, { id: "a", position: 1 }, { id: "b", position: 2 }]);
  assert.equal(isCompleteProductImageOrder(["a", "b"], ["a", "a"]), false);
  assert.equal(isCompleteProductImageOrder(["a", "b"], ["a"]), false);
  assert.equal(isCompleteProductImageOrder(["a"], ["a", "foreign"]), false);
});
