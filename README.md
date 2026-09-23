# Oi, Bonita!

Site da Oi, Bonita!, construído com Next.js App Router, React, TypeScript e Tailwind CSS.

## Requisitos

- Node.js 20.9 ou superior
- pnpm

## Desenvolvimento local

```bash
pnpm install
pnpm dev
```

## Banco e acesso administrativo

Esta etapa prepara PostgreSQL com Prisma ORM 7. Antes de executar comandos de banco, copie `.env.example` para `.env` e configure `DATABASE_URL` com a URL do PostgreSQL. Ajuste `NEXTAUTH_URL` para a URL canônica do site (HTTPS em produção). O `.env` está ignorado pelo Git.

Configure também `NEXTAUTH_SECRET` com ao menos 32 caracteres aleatórios. É possível gerar um valor localmente com `node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"`; guarde o resultado apenas no `.env` ou no gerenciador de segredos do ambiente.

```bash
pnpm db:validate
pnpm db:generate
pnpm db:migrate
pnpm admin:create
```

`pnpm admin:create` cria somente o primeiro administrador, pede e-mail e senha em um terminal interativo e oculta a senha digitada. O hash scrypt é salvo no PostgreSQL; não há cadastro público. Para implantar migrações existentes em produção, use `pnpm db:deploy`.

### Imagens de produtos

O upload local funciona somente em desenvolvimento. Os arquivos JPEG, PNG e WebP são validados por extensão, MIME, assinatura e tamanho (máximo de 5 MB cada), recebem nomes aleatórios e ficam em `data/<PRODUCT_IMAGE_STORAGE_DIR>`; o padrão é `data/product-images`. O endpoint `/api/product-images/[filename]` serve somente arquivos com nomes gerados pelo sistema; a URL é registrada em `ProductImage`. O diretório deve permanecer estável para que remoções encontrem os arquivos. Cada produto aceita até 12 imagens, com a primeira posição como imagem principal. Arquivos que já existiam em outro local são apenas desassociados do produto quando removidos.

O upload local é bloqueado quando `NODE_ENV=production`: um deploy com armazenamento efêmero ou em múltiplas instâncias não preservaria as imagens. Antes de habilitar uploads em produção, implemente e configure um storage persistente (por exemplo, armazenamento de objetos) no serviço de armazenamento. Não existe credencial de storage no projeto nem foi inventada uma.

As rotas `/admin` e futuras rotas sob `/admin/*` exigem sessão de administrador. A sessão JWT do NextAuth é assinada com `NEXTAUTH_SECRET`, dura oito horas e usa os atributos de cookie seguros padrão da biblioteca. Tentativas inválidas são limitadas temporariamente após cinco falhas consecutivas.

## Validação

```bash
pnpm lint
pnpm typecheck
pnpm build
```

## Estrutura

- `src/app`: páginas, layouts e metadados do App Router
- `src/components`: componentes compartilhados
- `src/config`: configuração central da marca, ambiente e imagens
- `src/data`: categorias oficiais e catálogo atual
- `src/features`: módulos de domínio reservados para evolução
- `src/hooks`: hooks de interface
- `src/lib`: utilitários compartilhados
- `src/repositories`: acesso a dados futuro
- `src/schemas`: modelos e validação com Zod
- `src/services`: regras de aplicação e integrações futuras
- `public/images`: logo e retratos fornecidos

O catálogo público ainda usa os dados estáticos existentes e permanece sem produtos porque não foram fornecidos produtos ou preços reais. O schema Prisma prepara os modelos para a próxima integração sem trocar o catálogo ou afetar o carrinho, os favoritos e o fluxo de WhatsApp.

`.env.example` documenta nomes de configuração e contém somente um formato ilustrativo para a URL do banco. Nunca adicione senhas, tokens ou credenciais reais ao código ou ao Git.
