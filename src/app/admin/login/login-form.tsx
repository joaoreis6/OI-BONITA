"use client";

import { useState, type FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export function AdminLoginForm() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    try {
      const result = await signIn("credentials", { email, password, redirect: false });
      if (!result?.error && result?.ok) {
        router.replace("/admin");
        return;
      }
      setError("Não foi possível entrar. Confira suas credenciais ou tente mais tarde.");
    } catch {
      setError("Não foi possível entrar. Confira suas credenciais ou tente mais tarde.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="admin-login-form" onSubmit={submit}>
      <label htmlFor="admin-email">E-mail</label>
      <input id="admin-email" name="email" type="email" autoComplete="username" maxLength={254} required />
      <label htmlFor="admin-password">Senha</label>
      <input id="admin-password" name="password" type="password" autoComplete="current-password" minLength={12} maxLength={128} required />
      {error && <p className="admin-login-error" role="alert">{error}</p>}
      <button className="button button-primary" type="submit" disabled={pending}>
        {pending ? "Verificando…" : "Entrar"}
      </button>
    </form>
  );
}
