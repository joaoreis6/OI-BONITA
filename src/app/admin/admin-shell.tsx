"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { AdminSignOutButton } from "@/app/admin/sign-out-button";

const links = [
  ["Dashboard", "/admin"], ["Produtos", "/admin/produtos"], ["Categorias", "/admin/categorias"], ["Configurações", "/admin/configuracoes"],
] as const;

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/admin/login") return children;
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar" aria-label="Navegação administrativa">
        <Link className="admin-brand" href="/admin"><span className="admin-brand-mark" aria-hidden="true">o!</span><span><strong>Oi, Bonita!</strong><small>Painel administrativo</small></span></Link>
        <nav className="admin-nav">
          {links.map(([label, href]) => <Link key={href} href={href} aria-current={pathname === href ? "page" : undefined} className={pathname === href || (href !== "/admin" && pathname.startsWith(`${href}/`)) ? "is-current" : ""}>{label}</Link>)}
        </nav>
        <div className="admin-sidebar-bottom"><AdminSignOutButton /></div>
      </aside>
      <div className="admin-main-wrap"><header className="admin-mobile-top"><Link href="/admin"><strong>Oi, Bonita!</strong></Link><AdminSignOutButton /></header><nav className="admin-mobile-nav" aria-label="Navegação administrativa">{links.map(([label, href]) => <Link key={href} href={href} aria-current={pathname === href ? "page" : undefined}>{label}</Link>)}</nav><main className="admin-main">{children}</main></div>
    </div>
  );
}
