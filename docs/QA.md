# QA — Etapa 4.5

Registro objetivo das validações realizadas. Ambiente: Windows 10, Node.js v24.14.1, branch `main`.

## Comandos executados

| Comando | Resultado | Data |
|---------|-----------|------|
| `pnpm install` (via `npx pnpm@10.34.5`) | OK | 2026-09-24 |
| `pnpm exec prisma generate` | OK | 2026-09-24 |
| `pnpm lint` | OK (0 erros) | 2026-09-24 |
| `pnpm typecheck` | OK | 2026-09-24 |
| `pnpm test` | OK — 31 testes passando | 2026-09-24 |
| `pnpm build` | OK — Next.js 16.3.6, proxy reconhecido | 2026-09-24 |

## Correções aplicadas nesta etapa

1. **README** atualizado — catálogo público documentado como PostgreSQL (não estático)
2. **Arquivos legados removidos** — `src/data/products.ts` e `src/data/categories.ts` (não referenciados)
3. **StoreProvider** — re-fetch limitado à mudança de IDs (carrinho/favoritos), evitando loop por alteração de quantidade
4. **Testes de estoque** — 5 casos adicionais em `tests/cart-service.test.mjs`

## Validação automatizada

### Estoque (unitário)

| Caso | Cobertura | Resultado |
|------|-----------|-----------|
| Estoque > 0 | `allows purchase when stock is greater than zero` | Passou |
| Estoque = 0 | `blocks purchase when stock is zero` | Passou |
| Quantidade > estoque | `blocks quantity above stock...` | Passou |
| Estoque reduzido no localStorage | `restoreCart` com clamp | Passou |
| Produto despublicado | `removes unpublished products during restore` | Passou |
| MADE_TO_ORDER | `keeps made-to-order products purchasable only with stock above zero` | Passou |

### Carrinho, favoritos, WhatsApp, filtros, auth, imagens

Cobertos pelos testes existentes em `tests/*.test.mjs` — todos passando (31/31).

## Validação por revisão de código

### Fluxo principal da loja

Implementação verificada em:

- Home → Catálogo → Categoria → Produto → Carrinho → WhatsApp
- Produto → Favorito → Favoritos

`ProductPurchasePanel` revalida estoque antes de adicionar/comprar. `CartContents` chama `refreshCart()` antes do WhatsApp.

### Admin

- Proxy em `src/proxy.ts` com matcher `/admin/:path*`
- `requireAdmin()` em Server Actions (`src/app/admin/actions.ts`)
- Login exige `DATABASE_URL` + `NEXTAUTH_SECRET`

### SEO

- Metadata global (`src/app/layout.tsx`)
- Metadata dinâmica produto/categoria
- `robots.ts`, `sitemap.ts` dinâmico

### Segurança

- `passwordHash` não exposto no mapper público (testado)
- APIs retornam erros genéricos (503/400)
- Upload validado por MIME, assinatura e path seguro

### Responsividade

Revisão de CSS em `src/app/globals.css`:

- Breakpoints: 1000px, 760px, 680px (admin), 400px
- Cobertura aproximada dos alvos: 360–414px (via 400px/760px), 768px (760px), 1280–1440px (layout desktop)

**Não validado manualmente no navegador** neste ambiente (sem sessão interativa de browser automation).

### Acessibilidade

Revisão estática: skip-link, labels em filtros, `aria-label` em botões de ícone, `aria-live` em feedback, `aria-pressed` em favoritos, `prefers-reduced-motion`, foco visível em admin.

**Não validado** com leitor de tela ou auditoria automatizada (axe/lighthouse).

## PostgreSQL

| Item | Status |
|------|--------|
| Disponível neste ambiente | **Não** — porta 5432 fechada, sem `.env` |
| Conexão real testada | **Não validado por dependência externa/ambiente** |
| Consultas/produtos/estoque reais | **Não validado por dependência externa/ambiente** |

## Navegador

Validação parcial via servidor de produção local (`pnpm start`, sem `DATABASE_URL`):

| Rota | HTTP | Observação |
|------|------|------------|
| `/` | 200 | Renderiza (catálogo vazio/erro gracioso sem banco) |
| `/catalogo` | 200 | OK |
| `/favoritos` | 200 | OK |
| `/carrinho` | 200 | OK |
| `/admin/login` | 200 | OK |
| `/admin` | 307 → `/admin/login?configuration=missing` | Proxy ativo; exige env configurado |
| `/robots.txt` | 200 | OK |
| `/sitemap.xml` | 200 | OK |

**Não validado:** interação manual completa (cliques, carrinho com produtos reais, breakpoints visuais, leitor de tela).

Rotas `/sobre` e `/contato` **não existem** no projeto (fora do escopo atual).

## Limitações documentadas

- Imagens editoriais em `public/images/` (~1,8–2,5 MB cada) — servidas via `next/image` com `sizes`; otimização adicional depende de pipeline de deploy ou compressão manual
- Upload de imagens de produto bloqueado em produção até storage externo ser configurado
- Busca no header redireciona para `/catalogo` (comportamento intencional e consistente)

## Build

```
next build — Compiled successfully
Proxy (Middleware) — ativo em src/proxy.ts
Rotas geradas: /, /catalogo, /categoria/[slug], /produto/[slug], /carrinho, /favoritos, /admin/*
```
