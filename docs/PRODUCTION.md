# Preparação para produção — Etapa 4.6

Este documento descreve o que está pronto no repositório e o que depende de configuração externa.

## URL de produção (Netlify)

**https://oibonita-oficial.netlify.app**

## Status

**PARCIALMENTE CONFIGURADO** — site publicado no Netlify; variáveis de ambiente críticas ainda precisam ser configuradas no painel.

O código está preparado para build e deploy. A operação completa (catálogo, admin, SEO correto) exige PostgreSQL e secrets no Netlify.

## Checklist técnico (repositório)

- [x] `pnpm build` funcional
- [x] Variáveis documentadas em `.env.example`
- [x] Migrations Prisma versionadas
- [x] Script `pnpm admin:create` para primeiro administrador
- [x] Rotas admin protegidas (proxy + requireAdmin)
- [x] SEO: metadata, robots, sitemap dinâmico
- [x] Secrets não versionados (`.env` no `.gitignore`)
- [x] Upload local bloqueado em produção (seguro para ambientes efêmeros)

## Pendências externas (obrigatórias para operação)

### 1. PostgreSQL

```bash
# No ambiente de produção:
export DATABASE_URL="postgresql://..."   # fornecido pelo operador
pnpm db:deploy
pnpm admin:create                        # interativo — e-mail e senha escolhidos pelo operador
```

### 2. Autenticação

```bash
export NEXTAUTH_SECRET="..."             # mínimo 32 caracteres, gerado pelo operador
export NEXTAUTH_URL="https://..."        # URL canônica HTTPS do site
```

### 3. URL pública

```bash
export NEXT_PUBLIC_SITE_URL="https://..."  # domínio ou URL de produção
```

Usado em: metadataBase, canonical, sitemap, Open Graph.

Produção atual: `https://oibonita-oficial.netlify.app` (via `NEXT_PUBLIC_SITE_URL` no Netlify).

### 4. Storage de imagens de produto

O upload local funciona **somente em desenvolvimento**.

Em produção (`NODE_ENV=production`), `storeValidatedProductImage()` lança erro.

**Storage persistente externo ainda precisa ser configurado para produção.**

Não há integração S3/R2/Blob implementada. Opções:

1. Implementar adapter de storage externo no serviço `product-image-storage.ts`
2. Ou operar uploads apenas em ambiente de staging com disco persistente (não recomendado para múltiplas instâncias)

### 5. Netlify

Arquivo `netlify.toml` na raiz:

| Configuração | Valor |
|--------------|-------|
| Build command | `pnpm build` |
| Publish directory | `.next` |
| Node version | 20 |
| Runtime Next.js | OpenNext adapter (automático pelo Netlify) |

**Variáveis obrigatórias no painel Netlify** (Site settings → Environment variables):

| Variável | Valor |
|----------|-------|
| `NEXT_PUBLIC_SITE_URL` | `https://oibonita-oficial.netlify.app` |
| `NEXTAUTH_URL` | `https://oibonita-oficial.netlify.app` |
| `DATABASE_URL` | URL PostgreSQL real (Neon, Supabase, etc.) |
| `NEXTAUTH_SECRET` | Secret gerado (mín. 32 caracteres) |

Sem `NEXT_PUBLIC_SITE_URL`, o `robots.txt` e o `sitemap.xml` geram URLs com `localhost` — **corrija no painel antes do próximo deploy**.

**Migrations e dados iniciais após configurar `DATABASE_URL`:**

Execute uma vez (localmente com `DATABASE_URL` de produção exportada no terminal):

```bash
pnpm db:deploy
pnpm db:seed-categories    # sincroniza as 6 categorias oficiais (idempotente)
pnpm admin:create          # cria a primeira administradora (interativo)
```

**Diagnóstico atual (produção):** sem `DATABASE_URL` no Netlify, Home/Catálogo/Categorias falham ao consultar o PostgreSQL e `/api/catalog/products` retorna 503. Isso **não** é resolvido no frontend — configure as variáveis e redeploy.

**PostgreSQL recomendado para Netlify:** Neon ou Supabase com URL **pooled** (compatível com serverless). Use `?sslmode=require` quando exigido pelo provedor.

**Deploy:** conectar repositório GitHub `joaoreis6/OI-BONITA` ao site Netlify; push em `main` dispara build.

## Processo recomendado de deploy

1. Configurar variáveis no painel Netlify (tabela acima)
2. Push para `main` (build automático)
3. `pnpm db:deploy` (com `DATABASE_URL` de produção)
4. `pnpm admin:create` (primeiro administrador, interativo)
5. Validar: `/`, `/catalogo`, `/robots.txt`, `/sitemap.xml`, `/admin/login`
6. Cadastrar categorias e produtos pelo admin

## Segurança em produção

- Nunca commitar `.env`
- Rotacionar `NEXTAUTH_SECRET` se comprometido
- Usar HTTPS (cookies seguros do NextAuth)
- Revisar permissões do banco (usuário com privilégios mínimos)
- Monitorar tentativas de login admin

## Rotas públicas

| Rota | Existe |
|------|--------|
| `/` | Sim |
| `/catalogo` | Sim |
| `/categoria/[slug]` | Sim |
| `/produto/[slug]` | Sim |
| `/favoritos` | Sim |
| `/carrinho` | Sim |
| `/admin/login` | Sim |
| `/admin` | Sim (protegida) |
| `/sobre` | **Não** |
| `/contato` | **Não** |

Contato disponível via WhatsApp e Instagram no footer e header.

## Scripts de produção

```bash
pnpm db:deploy    # aplicar migrations
pnpm build        # build Next.js
pnpm start        # servir na porta 3000
```

## Observações

- Catálogo vazio até produtos serem cadastrados no admin
- Carrinho/favoritos funcionam no cliente; estoque é reconciliado com o banco
- Não há pagamento online nem checkout — pedidos via WhatsApp
