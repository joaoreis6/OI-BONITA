"use client";

import { signOut } from "next-auth/react";

export function AdminSignOutButton() {
  return <button className="button button-outline" type="button" onClick={() => signOut({ callbackUrl: "/admin/login" })}>Sair</button>;
}
