# Oi, Bonita!

Site da Oi, Bonita!, construído com Next.js App Router, React, TypeScript, Tailwind CSS, PostgreSQL e Prisma ORM 7.

## Requisitos

- Node.js 20.9 ou superior
- pnpm
- PostgreSQL 14+ (desenvolvimento e produção)

## Desenvolvimento local

```bash
pnpm install
cp .env.example .env
# Configure DATABASE_URL, NEXTAUTH_SECRET e NEXTAUTH_URL no .env
pnpm db:validate
pnpm db:migrate
pnpm admin:create
pnpm dev
```

A aplicação inicia em `http://localhost:3000`.

## Arquitetura

### Catálogo público

O catálogo público consulta **PostgreSQL** via Prisma (`src/services/public-catalog-service.ts`).

Somente produtos com `status: PUBLISHED` e categoria ativa aparecem nas páginas:

- `/` — home com categorias e destaques
- `/catalogo` — busca, filtros e ordenação
- `/categoria/[slug]` — produtos por categoria
- `/produto/[slug]` — detalhe do produto

### Carrinho e favoritos

- Persistência no **localStorage** do navegador (`oi-bonita-cart`, `oi-bonita-favorites`)
- Reconciliação de estoque e publicação via `/api/catalog/products` (sem confiar cegamente no cliente)
- Sincronização entre abas pelo evento `storage`

### WhatsApp

Pedidos são finalizados pelo WhatsApp. O número oficial está em `src/config/site.ts`. Não há checkout nem pagamento online.

### Painel administrativo

Rotas em `/admin/*`, protegidas por:

- `src/proxy.ts` (Next.js 16 — proteção otimista de rotas)
- `requireAdmin()` em Server Actions e páginas sensíveis

Funcionalidades: dashboard, CRUD de produtos e categorias, estoque, publicação, arquivamento e imagens.

### Autenticação

- NextAuth com credenciais (somente administradores)
- Sessão JWT de 8 horas
- Hash scrypt no PostgreSQL
- Bloqueio temporário após 5 tentativas inválidas
- Sem cadastro público de clientes

### Imagens de produtos

**Desenvolvimento:** upload local para `data/<PRODUCT_IMAGE_STORAGE_DIR>` (padrão: `data/product-images`), servido por `/api/product-images/[filename]`.

**Produção:** upload local está **bloqueado** (`NODE_ENV=production`). É necessário configurar um **storage persistente externo** antes de operar uploads em produção. Não há integração de storage externo implementada neste repositório.

Validações: JPEG/PNG/WebP, assinatura de arquivo, máximo 5 MB, até 12 imagens por produto.

## Variáveis de ambiente

Copie `.env.example` para `.env`. Nunca versione segredos.

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `DATABASE_URL` | Sim (admin e catálogo) | URL PostgreSQL |
| `NEXTAUTH_SECRET` | Sim (admin) | Mínimo 32 caracteres aleatórios |
| `NEXTAUTH_URL` | Sim (admin) | URL canônica do site |
| `NEXT_PUBLIC_SITE_URL` | Sim | URL pública (metadata, sitemap, canonical) |
| `PRODUCT_IMAGE_STORAGE_DIR` | Não | Subdiretório em `data/` para imagens locais |

Gerar secret localmente:

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"
```

## Comandos

```bash
pnpm dev              # servidor de desenvolvimento
pnpm build            # build de produção
pnpm start            # servir build
pnpm lint             # ESLint
pnpm typecheck        # TypeScript
pnpm test             # testes unitários
pnpm db:validate      # validar schema Prisma
pnpm db:generate      # gerar cliente Prisma
pnpm db:migrate       # migrações (desenvolvimento)
pnpm db:deploy        # migrações (produção)
pnpm admin:create     # criar primeiro administrador (interativo)
```

## Validação

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Registros de QA: [`docs/QA.md`](docs/QA.md).

## Produção

Guia de implantação: [`docs/PRODUCTION.md`](docs/PRODUCTION.md).

**Limitações conhecidas em produção:**

- Storage de imagens externo ainda precisa ser configurado para uploads administrativos
- Domínio final deve ser definido via `NEXT_PUBLIC_SITE_URL` e `NEXTAUTH_URL`
- PostgreSQL real, secrets e provedor de deploy são responsabilidade do ambiente

## Estrutura

- `src/app` — páginas, layouts, APIs e Server Actions
- `src/components` — componentes compartilhados da loja
- `src/config` — marca, site e variáveis de ambiente
- `src/features/store` — contexto de carrinho e favoritos
- `src/hooks` — hooks de interface
- `src/lib` — Prisma, autenticação
- `src/repositories` — acesso a dados (auth admin)
- `src/schemas` — validação Zod
- `src/services` — regras de negócio
- `prisma` — schema e migrations
- `public/images` — logo e imagens editoriais
- `tests` — testes unitários de serviços

## Disponibilidade de produtos

| Condição | Comportamento |
|----------|---------------|
| `AVAILABLE` + estoque > 0 | Compra permitida |
| `OUT_OF_STOCK` ou estoque = 0 | Indisponível (inclui `MADE_TO_ORDER` com estoque zero) |
| `MADE_TO_ORDER` + estoque > 0 | Compra permitida; exibido como "Feito sob encomenda" |
| Produto despublicado/arquivado | Removido do catálogo público; carrinho/favoritos reconciliam |
