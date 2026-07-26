# IngaPan Webapp

Aplicação web da IngaPan para dois públicos:

- clientes que pesquisam produtos e montam uma solicitação de orçamento;
- colaboradores que administram catálogo, destaques, pedidos e clientes.

O produto prioriza uma experiência simples, responsiva e previsível. Toda
interação assíncrona deve comunicar seu estado e toda tela de dados deve prever
carregamento, vazio e erro.

## Stack

- Next.js 16 com App Router e React 19;
- TypeScript e Tailwind CSS 4;
- shadcn/ui com Radix, estilo `new-york`;
- Motion para transições funcionais;
- Zod para contratos de entrada e dados externos;
- Supabase SSR para autenticação e acesso aos dados existentes;
- Vitest, Testing Library e Playwright.

## Instalação

Requisitos: Node.js 20+ e npm.

```bash
npm install
cp .env.example .env.local
npm run dev
```

A aplicação fica disponível em [http://localhost:3000](http://localhost:3000).
Preencha as variáveis públicas do Supabase conforme o ambiente fornecido pela
equipe. Nunca registre credenciais ou sessões administrativas no repositório.

## Scripts

```bash
npm run dev        # desenvolvimento
npm run lint       # ESLint
npm run typecheck  # TypeScript
npm run test       # testes unitários/componentes
npm run test:e2e   # Playwright em 390, 768, 1024 e 1440 px
npm run build      # build de produção
npm run check      # validação local completa
```

## Arquitetura

- `src/app`: rotas, layouts, boundaries, metadata e Server Components;
- `src/components/ui`: componentes shadcn mantidos no repositório;
- `src/components/products`: componentes defensivos do domínio de produtos;
- `src/components/admin`: shell e workspaces administrativos;
- `src/features`: contratos, consultas e regras de apresentação por domínio;
- `src/lib`: integrações e utilitários compartilhados;
- `docs`: decisões de interface, arquitetura e padrões de UX.

O banco e suas políticas são contratos externos. Alterações de schema, RLS,
migrations ou dados não pertencem ao escopo padrão do frontend.

## Documentação

- [Sistema de interface](docs/interface-design-system.md)
- [Arquitetura frontend](docs/frontend-architecture.md)
- [Padrões de UX](docs/ux-patterns.md)
- [Contrato para agentes](AGENTS.md)
