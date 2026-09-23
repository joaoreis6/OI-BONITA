import Link from "next/link";
import { FlowerIcon } from "@/components/icons";

export function EmptyProducts({ filtered = false }: { filtered?: boolean }) {
  return (
    <section className="empty-state" aria-live="polite">
      <span className="empty-state-mark"><FlowerIcon width={24} height={24} /></span>
      <h2>{filtered ? "Nenhum produto encontrado" : "Estamos preparando nosso catálogo"}</h2>
      <p>{filtered ? "Não encontramos produtos com esses filtros. Experimente outra busca ou veja todas as categorias." : "Ainda não há produtos cadastrados. Em breve, este espaço vai mostrar as novidades da Oi, Bonita!"}</p>
      <Link className="button button-outline" href={filtered ? "/catalogo" : "/#categorias"}>{filtered ? "Limpar filtros" : "Explorar categorias"}</Link>
    </section>
  );
}
