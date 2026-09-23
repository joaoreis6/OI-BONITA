"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { createProductAction, updateProductAction, type AdminActionState } from "@/app/admin/actions";
import { Notice } from "@/app/admin/admin-ui";

type ProductValue = { id?: string; name: string; slug: string; description: string; price: string; categoryId: string; stock: number; availability: string; isPublished: boolean };
const emptyState: AdminActionState = {};

export function ProductForm({ categories, product }: { categories: { id: string; name: string }[]; product?: ProductValue }) {
  const [state, action, pending] = useActionState(product ? updateProductAction : createProductAction, emptyState);
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [slugEdited, setSlugEdited] = useState(Boolean(product?.slug));
  const [name, setName] = useState(product?.name ?? "");
  const formAction = action as (formData: FormData) => void;
  return <form action={formAction} className="admin-form admin-product-form">
    {product && <input type="hidden" name="id" value={product.id} />}
    <div className="admin-form-grid">
      <label>Nome do produto<input name="name" required maxLength={120} value={name} onChange={(event) => { setName(event.target.value); if (!slugEdited) setSlug(makeSlug(event.target.value)); }} /></label>
      <label>Slug<input name="slug" required maxLength={140} value={slug} onChange={(event) => { setSlug(event.target.value); setSlugEdited(true); }} /><small>Endereço amigável, sem espaços ou acentos.</small></label>
      <label className="admin-form-wide">Descrição<textarea name="description" maxLength={5000} rows={5} defaultValue={product?.description ?? ""} /><small>Até 5.000 caracteres.</small></label>
      <label>Preço (R$)<input name="price" type="text" inputMode="decimal" required placeholder="129,90" defaultValue={product?.price ?? ""} /><small>Use vírgula ou ponto e até duas casas decimais.</small></label>
      <label>Categoria<select name="categoryId" required defaultValue={product?.categoryId ?? ""}><option value="" disabled>Selecione uma categoria</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
      <label>Estoque atual<input name="stock" type="number" min="0" max="999999999" step="1" required defaultValue={product?.stock ?? 0} /><small>Quantidade inteira; não controla a disponibilidade automaticamente.</small></label>
      <label>Disponibilidade<select name="availability" defaultValue={product?.availability ?? "AVAILABLE"}><option value="AVAILABLE">Disponível</option><option value="OUT_OF_STOCK">Sem estoque</option><option value="MADE_TO_ORDER">Sob encomenda</option></select></label>
    </div>
    <label className="admin-check"><input name="isPublished" type="checkbox" defaultChecked={product?.isPublished ?? false} />Publicado</label>
    {state.error && <Notice tone="error">{state.error}</Notice>}
    {state.fieldErrors && <Notice tone="error">{Object.values(state.fieldErrors).flat()[0]}</Notice>}
    <div className="admin-form-actions"><Link className="button button-outline" href="/admin/produtos">Cancelar</Link><button className="button button-primary" disabled={pending}>{pending ? "Salvando…" : "Salvar produto"}</button></div>
  </form>;

}

function makeSlug(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
