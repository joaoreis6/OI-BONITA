"use client";

import { useState } from "react";
import { archiveProductAction } from "@/app/admin/actions";

type ConfirmArchiveFormProps = {
  id: string;
  label?: string;
  className?: string;
  pendingLabel?: string;
  confirmMessage?: string;
};

export function ConfirmArchiveForm({
  id,
  label = "Arquivar",
  className = "admin-text-button",
  pendingLabel = "Arquivando…",
  confirmMessage = "Arquivar este produto? Ele deixará de aparecer na lista ativa e os dados serão preservados.",
}: ConfirmArchiveFormProps) {
  const [pending, setPending] = useState(false);
  return (
    <form
      action={archiveProductAction}
      onSubmit={(event) => {
        if (!window.confirm(confirmMessage)) event.preventDefault();
        else setPending(true);
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button className={className} type="submit" disabled={pending}>{pending ? pendingLabel : label}</button>
    </form>
  );
}
