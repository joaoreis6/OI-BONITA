import Link from "next/link";

export default function StoreNotFound() {
  return (
    <main id="main-content" className="error-panel">
      <p className="eyebrow">Página não encontrada</p>
      <h1>Não encontramos o que você procura.</h1>
      <p>Volte para a página inicial ou explore o catálogo da Oi, Bonita!.</p>
      <div className="hero-buttons">
        <Link className="button button-primary" href="/">Ir para o início</Link>
        <Link className="button button-outline" href="/catalogo">Ver catálogo</Link>
      </div>
    </main>
  );
}
