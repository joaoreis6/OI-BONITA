export default function StoreLoading() {
  return (
    <main id="main-content" className="container catalog-section" aria-live="polite" aria-busy="true">
      <p className="eyebrow">Oi, Bonita!</p>
      <h1 className="section-title">Carregando catálogo</h1>
      <div className="loading-grid" aria-hidden="true">
        {Array.from({ length: 4 }, (_, index) => <div className="skeleton" key={index} />)}
      </div>
    </main>
  );
}
