# Preparação para produção — Etapa 4.6

Este documento descreve o que está pronto no repositório e o que depende de configuração externa.

## Status

**PRONTA PARA PUBLICAÇÃO, PENDENTE DE CONFIGURAÇÃO EXTERNA**

O código está preparado para build e deploy. A publicação real exige infraestrutura configurada pelo operador.

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

**Domínio final não está definido neste repositório.** Configure via variável de ambiente.

### 4. Storage de imagens de produto

O upload local funciona **somente em desenvolvimento**.

Em produção (`NODE_ENV=production`), `storeValidatedProductImage()` lança erro.

**Storage persistente externo ainda precisa ser configurado para produção.**

Não há integração S3/R2/Blob implementada. Opções:

1. Implementar adapter de storage externo no serviço `product-image-storage.ts`
2. Ou operar uploads apenas em ambiente de staging com disco persistente (não recomendado para múltiplas instâncias)

### 5. Provedor de deploy

Não especificado neste repositório. Requisitos mínimos:

- Node.js 20.9+
- PostgreSQL acessível
- Variáveis de ambiente configuradas
- Disco persistente **ou** storage externo para imagens de produto

## Processo recomendado de deploy

1. Clonar repositório e instalar dependências (`pnpm install`)
2. Configurar variáveis de ambiente (ver `.env.example`)
3. `pnpm db:deploy`
4. `pnpm admin:create` (primeiro administrador)
5. `pnpm build`
6. `pnpm start` (ou comando equivalente do provedor)
7. Validar rotas: `/`, `/catalogo`, `/admin/login`
8. Cadastrar categorias e produtos pelo admin

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
