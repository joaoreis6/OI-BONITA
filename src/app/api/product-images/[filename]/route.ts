import { readStoredProductImage } from "@/services/product-image-storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const contentTypes = { jpg: "image/jpeg", png: "image/png", webp: "image/webp" } as const;

export async function GET(_request: Request, { params }: { params: Promise<{ filename: string }> }) {
  const { filename } = await params;
  const extension = filename.split(".").at(-1);
  if (!extension || !Object.hasOwn(contentTypes, extension)) return new Response("Not found", { status: 404 });
  try {
    const bytes = await readStoredProductImage(filename);
    if (!bytes) return new Response("Not found", { status: 404 });
    return new Response(bytes, { headers: {
      "Content-Type": contentTypes[extension as keyof typeof contentTypes],
      "Content-Length": String(bytes.byteLength),
      "Content-Disposition": "inline",
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    } });
  } catch {
    return new Response("Image unavailable", { status: 503 });
  }
}
