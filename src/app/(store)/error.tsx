"use client";

export default function StoreError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main id="main-content" className="error-panel" role="alert">
      <p className="eyebrow">Ops!</p>
      <h1>Não foi possível carregar esta página.</h1>
      <p>Tente novamente. Se o problema continuar, fale com a Oi, Bonita! pelo WhatsApp.</p>
      <button className="button button-primary" onClick={() => reset()}>Tentar novamente</button>
    </main>
  );
}
