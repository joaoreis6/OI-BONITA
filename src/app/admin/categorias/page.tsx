import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/require-admin";
import { listAdminCategories } from "@/services/admin-catalog-service";
import { AdminPageHeading, CategoryCreateForm, CategoryEditForm, Notice } from "@/app/admin/admin-ui";

export const metadata: Metadata = { title: "Categorias", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage({ searchParams }: { searchParams: Promise<{ salvo?: string }> }) {
  await requireAdmin();
  const query = await searchParams;
  let categories: Awaited<ReturnType<typeof listAdminCategories>> | null = null;
  try { categories = await listAdminCategories(); } catch { /* Error state is rendered below. */ }
  if (!categories) return <><AdminPageHeading eyebrow="Catálogo" title="Categorias" description="Organize os produtos por categoria." /><Notice tone="error">Não foi possível carregar as categorias. Verifique a conexão do banco.</Notice><CategoryCreateForm /></>;
  return <><AdminPageHeading eyebrow="Catálogo" title="Categorias" description="Organize os produtos por categoria." />
    {query.salvo && <Notice>Categoria salva com sucesso.</Notice>}
    <div className="admin-category-layout"><CategoryCreateForm />
      <section className="admin-panel admin-categories-panel"><div className="admin-panel-heading"><h2>Categorias cadastradas</h2><span>{categories.length}</span></div>
        {categories.length === 0 ? <div className="admin-empty admin-empty-compact"><h3>Nenhuma categoria cadastrada.</h3><p>Adicione a primeira categoria para começar a organizar os produtos.</p></div> : <div className="admin-category-list">{categories.map((category) => <CategoryEditForm key={category.id} category={category} />)}</div>}
      </section>
    </div>
  </>;
}
