import { NextResponse } from "next/server";
import { z } from "zod";
import { listPublicProductsByIds } from "@/services/public-catalog-service";

const idsSchema = z.array(z.string().min(1).max(64)).max(100);

export async function GET(request: Request) {
  const raw = new URL(request.url).searchParams.getAll("id");
  const parsed = idsSchema.safeParse(raw);
  if (!parsed.success) return NextResponse.json({ error: "Consulta inválida." }, { status: 400 });
  try {
    const products = await listPublicProductsByIds([...new Set(parsed.data)]);
    return NextResponse.json({ products }, { headers: { "Cache-Control": "private, no-store" } });
  } catch {
    return NextResponse.json({ error: "Não foi possível carregar os produtos." }, { status: 503 });
  }
}
