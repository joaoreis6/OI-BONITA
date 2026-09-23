"use client";

import Image from "next/image";
import { useActionState, useState } from "react";
import { removeProductImageAction, reorderProductImagesAction, uploadProductImageAction, type AdminActionState } from "@/app/admin/actions";
import { Notice } from "@/app/admin/admin-ui";

type ProductImageItem = { id: string; url: string; altText: string | null; position: number; createdAt: Date };
const emptyState: AdminActionState = {};

export function ProductImageManager({ productId, images }: { productId: string; images: ProductImageItem[] }) {
  const [orderedImages, setOrderedImages] = useState(images);
  const [state, action, pending] = useActionState(reorderProductImagesAction, emptyState);

  function moveImage(index: number, destination: number) {
    setOrderedImages((current) => {
      if (destination < 0 || destination >= current.length) return current;
      const next = [...current];
      const [image] = next.splice(index, 1);
      next.splice(destination, 0, image);
      return next;
    });
  }

  return <section className="admin-panel admin-image-manager" aria-labelledby="product-images-heading">
    <div className="admin-panel-heading admin-image-manager-heading"><div><p className="eyebrow">Fotos</p><h2 id="product-images-heading">Imagens do produto</h2><p>A primeira imagem é a principal. A ordem será preservada na galeria.</p></div><span>{images.length}/{12}</span></div>
    {orderedImages.length === 0 ? <p className="admin-image-empty">Nenhuma imagem cadastrada ainda.</p> : <>
      <div className="admin-image-gallery">{orderedImages.map((image, index) => <article className="admin-image-card" key={image.id}>
        <div className="admin-image-preview"><Image src={image.url} alt={image.altText || "Imagem do produto"} fill sizes="(max-width: 680px) 42vw, (max-width: 1000px) 28vw, 200px" unoptimized /></div>
        <div className="admin-image-details"><strong>{index === 0 ? "Imagem principal" : `Imagem ${index + 1}`}</strong><span title={image.url}>{image.altText || image.url.split("/").at(-1)}</span></div>
        <div className="admin-image-card-actions">
          {index > 0 && <button type="button" className="admin-text-button" onClick={() => moveImage(index, 0)}>Definir como principal</button>}
          <button type="button" className="admin-text-button" disabled={index === 0} onClick={() => moveImage(index, index - 1)}>Subir</button>
          <button type="button" className="admin-text-button" disabled={index === orderedImages.length - 1} onClick={() => moveImage(index, index + 1)}>Descer</button>
          <RemoveImageButton productId={productId} imageId={image.id} />
        </div>
      </article>)}</div>
      <form action={action} className="admin-image-order-form">
        <input type="hidden" name="productId" value={productId} />
        {orderedImages.map((image) => <input key={image.id} type="hidden" name="imageId" value={image.id} />)}
        {state.error && <Notice tone="error">{state.error}</Notice>}
        {orderedImages.some((image, index) => image.id !== images[index]?.id) && <button className="button button-outline" disabled={pending}>{pending ? "Salvando ordem…" : "Salvar ordem e imagem principal"}</button>}
      </form>
    </>}
    {images.length < 12 && <UploadImageForm productId={productId} />}
  </section>;
}

function UploadImageForm({ productId }: { productId: string }) {
  const [state, action, pending] = useActionState(uploadProductImageAction, emptyState);
  return <form action={action} className="admin-image-upload">
    <input type="hidden" name="productId" value={productId} />
    <div className="admin-image-upload-fields">
      <label>Escolha uma imagem<input name="image" type="file" accept="image/jpeg,image/png,image/webp" required disabled={pending} /><small>JPEG, PNG ou WebP · até 5 MB por imagem.</small></label>
      <label>Texto alternativo (opcional)<input name="altText" type="text" maxLength={180} placeholder="Descreva a foto do produto" disabled={pending} /></label>
    </div>
    {state.error && <Notice tone="error">{state.error}</Notice>}
    <button className="button button-primary" disabled={pending}>{pending ? "Enviando imagem…" : "Enviar imagem"}</button>
    {pending && <p className="admin-upload-progress" role="status">A imagem está sendo enviada e salva. Aguarde a confirmação.</p>}
  </form>;
}

function RemoveImageButton({ productId, imageId }: { productId: string; imageId: string }) {
  const [state, action, pending] = useActionState(removeProductImageAction, emptyState);
  return <form action={action} onSubmit={(event) => { if (!window.confirm("Remover esta imagem da galeria?")) event.preventDefault(); }}>
    <input type="hidden" name="productId" value={productId} /><input type="hidden" name="imageId" value={imageId} />
    <button type="submit" className="admin-text-button admin-danger-button" disabled={pending}>{pending ? "Removendo…" : "Remover"}</button>
    {state.error && <span className="admin-image-error" role="alert">{state.error}</span>}
  </form>;
}
