import type { ReactNode } from "react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { StoreProvider } from "@/features/store/store-provider";
import { listPublicCategories } from "@/services/public-catalog-service";
import type { Category } from "@/schemas/catalog";

export const dynamic = "force-dynamic";

export default async function StoreLayout({ children }: Readonly<{ children: ReactNode }>) {
  let categories: Category[] = [];
  try { categories = await listPublicCategories(); } catch { /* Public pages render their own database error state. */ }
  return (
    <StoreProvider>
      <a className="skip-link" href="#main-content">Pular para o conteúdo</a>
      <SiteHeader />
      {children}
      <SiteFooter categories={categories} />
    </StoreProvider>
  );
}
