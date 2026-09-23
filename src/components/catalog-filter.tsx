import Link from "next/link";
import type { Category } from "@/schemas/catalog";

export function CatalogFilter({ categories, query = "", category = "", sort = "recentes" }: { categories: Category[]; query?: string; category?: string; sort?: string }) {
  return (
    <form className="catalog-filter" action="/catalogo" method="get" role="search">
      <div className="field-group">
        <label htmlFor="catalog-query">Buscar produtos</label>
        <input className="field-control" id="catalog-query" name="q" type="search" placeholder="O que você procura?" defaultValue={query} />
      </div>
      <div className="field-group">
        <label htmlFor="catalog-category">Categoria</label>
        <select className="field-control" id="catalog-category" name="categoria" defaultValue={category}>
          <option value="">Todas as categorias</option>
          {categories.map((item) => <option key={item.id} value={item.slug}>{item.name}</option>)}
        </select>
      </div>
      <div className="field-group">
        <label htmlFor="catalog-sort">Ordenar por</label>
        <select className="field-control" id="catalog-sort" name="ordem" defaultValue={sort}>
          <option value="recentes">Mais recentes</option>
          <option value="menor-preco">Menor preço</option>
          <option value="maior-preco">Maior preço</option>
          <option value="nome-az">Nome A–Z</option>
          <option value="nome-za">Nome Z–A</option>
        </select>
      </div>
      <button className="button button-primary" type="submit">Buscar</button>
      {(query || category) && <Link className="text-link" href="/catalogo">Limpar filtros</Link>}
    </form>
  );
}
