import { env } from "@/config/env";

export type CatalogFailure = "not_configured" | "unavailable";

export function getCatalogFailure(): CatalogFailure | null {
  if (!env.DATABASE_URL) return "not_configured";
  return null;
}

export function catalogErrorMessage(failure: CatalogFailure) {
  if (failure === "not_configured") {
    return "O catálogo ainda não está conectado ao banco de dados. A equipe responsável precisa concluir a configuração de produção.";
  }
  return "Não foi possível carregar o catálogo agora. Tente novamente em instantes.";
}

export function resolveCatalogFailure(error: unknown): CatalogFailure {
  const configured = getCatalogFailure();
  if (configured) return configured;
  if (error instanceof Error && error.message.includes("DATABASE_URL is not configured")) return "not_configured";
  return "unavailable";
}
