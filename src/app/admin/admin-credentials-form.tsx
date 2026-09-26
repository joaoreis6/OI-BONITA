"use client";

import { useActionState } from "react";
import { updateAdminCredentialsAction, type AdminActionState } from "@/app/admin/actions";

const initialState: AdminActionState = {};

export function AdminCredentialsForm({ currentEmail }: { currentEmail: string }) {
  const [state, action, pending] = useActionState(updateAdminCredentialsAction, initialState);

  return (
    <form className="admin-form" action={action}>
      <p className="admin-muted">E-mail atual: <strong>{currentEmail}</strong></p>
      <label htmlFor="current-password">Senha atual</label>
      <input id="current-password" name="currentPassword" type="password" autoComplete="current-password" minLength={8} maxLength={128} required />
      {state.fieldErrors?.currentPassword && <p className="admin-field-error" role="alert">{state.fieldErrors.currentPassword[0]}</p>}

      <label htmlFor="new-email">Novo e-mail (opcional)</label>
      <input id="new-email" name="newEmail" type="email" autoComplete="email" maxLength={254} placeholder="novo@email.com" />
      {state.fieldErrors?.newEmail && <p className="admin-field-error" role="alert">{state.fieldErrors.newEmail[0]}</p>}

      <label htmlFor="new-password">Nova senha (opcional)</label>
      <input id="new-password" name="newPassword" type="password" autoComplete="new-password" minLength={8} maxLength={128} />
      {state.fieldErrors?.newPassword && <p className="admin-field-error" role="alert">{state.fieldErrors.newPassword[0]}</p>}

      <label htmlFor="confirm-password">Confirmar nova senha</label>
      <input id="confirm-password" name="confirmPassword" type="password" autoComplete="new-password" minLength={8} maxLength={128} />
      {state.fieldErrors?.confirmPassword && <p className="admin-field-error" role="alert">{state.fieldErrors.confirmPassword[0]}</p>}

      {state.fieldErrors?._form && <p className="admin-login-error" role="alert">{state.fieldErrors._form[0]}</p>}
      {state.error && <p className="admin-login-error" role="alert">{state.error}</p>}
      {state.success && <p className="admin-success" role="status">{state.success}</p>}

      <button className="button button-primary" type="submit" disabled={pending}>
        {pending ? "Salvando…" : "Atualizar acesso"}
      </button>
    </form>
  );
}
