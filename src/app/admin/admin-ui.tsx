"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useActionState, useState } from "react";
import { createCategoryAction, updateCategoryAction, type AdminActionState } from "@/app/admin/actions";

const emptyState: AdminActionState = {};

export function AdminPageHeading({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: { href: string; label: string } }) {
  return <div className="admin-page-heading"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p>{description}</p></div>{action && <Link className="button button-primary" href={action.href}>{action.label}</Link>}</div>;
}

export function Notice({ children, tone = "success" }: { children: ReactNode; tone?: "success" | "error" }) {
  return <p className={`admin-notice admin-notice-${tone}`} role={tone === "error" ? "alert" : "status"}>{children}</p>;
}

function ActionFeedback({ state }: { state: AdminActionState }) {
  if (state.error) return <Notice tone="error">{state.error}</Notice>;
  const firstError = state.fieldErrors && Object.values(state.fieldErrors).flat()[0];
  return firstError ? <Notice tone="error">{firstError}</Notice> : null;
}

export function CategoryCreateForm() {
  const [state, action, pending] = useActionState(createCategoryAction, emptyState);
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  return <form className="admin-form admin-category-create" action={action}>
    <h2>Adicionar categoria</h2>
    <label>Nome<input name="name" required maxLength={120} placeholder="Ex.: Prata 925" onChange={(event) => { if (!slugEdited) setSlug(makeSlug(event.target.value)); }} /></label>
    <label>Slug<input name="slug" value={slug} maxLength={140} onChange={(event) => { setSlug(event.target.value); setSlugEdited(true); }} placeholder="prata-925" /><small>Gerado a partir do nome; você pode ajustar.</small></label>
    <label className="admin-check"><input name="isActive" type="checkbox" defaultChecked />Categoria ativa</label>
    <ActionFeedback state={state} />
    <button className="button button-primary" disabled={pending}>{pending ? "Salvando…" : "Salvar categoria"}</button>
  </form>;
}

export function CategoryEditForm({ category }: { category: { id: string; name: string; slug: string; isActive: boolean; _count: { products: number } } }) {
  const [state, action, pending] = useActionState(updateCategoryAction, emptyState);
  return <form className="admin-category-row" action={action}>
    <input type="hidden" name="id" value={category.id} />
    <label>Nome<input name="name" required maxLength={120} defaultValue={category.name} /></label>
    <label>Slug<input name="slug" required maxLength={140} defaultValue={category.slug} /></label>
    <label className="admin-check"><input name="isActive" type="checkbox" defaultChecked={category.isActive} />Ativa</label>
    <p className="admin-category-count">{category._count.products} produto{category._count.products === 1 ? "" : "s"}</p>
    <button className="button button-outline" disabled={pending}>{pending ? "Salvando…" : "Salvar alterações"}</button>
    <ActionFeedback state={state} />
  </form>;
}

function makeSlug(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
