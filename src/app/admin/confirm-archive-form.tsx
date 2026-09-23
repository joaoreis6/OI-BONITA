"use client";

import { useState } from "react";
import { archiveProductAction } from "@/app/admin/actions";

export function ConfirmArchiveForm({ id }: { id: string }) {
  const [pending, setPending] = useState(false);
  return <form action={archiveProductAction} onSubmit={(event) => {
    if (!window.confirm("Arquivar este produto? Ele deixará de aparecer na lista ativa e os dados serão preservados.")) event.preventDefault();
    else setPending(true);
  }}><input type="hidden" name="id" value={id} /><button className="admin-text-button" type="submit" disabled={pending}>{pending ? "Arquivando…" : "Arquivar"}</button></form>;
}
