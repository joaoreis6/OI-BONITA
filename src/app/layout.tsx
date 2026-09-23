import type { Metadata } from "next";
import type { ReactNode } from "react";
import { env } from "@/config/env";
import { siteConfig } from "@/config/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_SITE_URL),
  title: { default: "Oi, Bonita! | Cosméticos, Joias e Acessórios", template: "%s | Oi, Bonita!" },
  description: "Conheça a Oi, Bonita! Cosméticos, joias, semijoias e acessórios. Confira nosso catálogo e fale conosco pelo WhatsApp.",
  applicationName: siteConfig.name,
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: siteConfig.name,
    title: "Oi, Bonita! | Cosméticos, Joias e Acessórios",
    description: "Conheça a Oi, Bonita! e explore nosso catálogo.",
    images: [{ url: "/images/editorial/portrait-jewelry.png", width: 1091, height: 1442, alt: "Retrato editorial da Oi, Bonita!" }],
  },
  icons: { icon: "/images/brand/logo-oi-bonita.png" },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
