# Arquitetura frontend

## App Router

Layouts montam providers e shells; páginas são Server Components por padrão.
`loading.tsx`, `error.tsx`, `global-error.tsx` e `not-found.tsx` definem os
estados estruturais. A sessão é atualizada em `src/proxy.ts`, conforme a
convenção atual do Next.js.

Client Components existem apenas onde há estado interativo: filtros, carrinho,
toasts, Sheets, dialogs e formulários. Leituras iniciais continuam no servidor
para evitar cascatas de fetch e entregar HTML útil.

## Produtos

`src/features/products/types.ts` é o contrato único. A linha bruta aceita
descrição, imagem, categoria e subcategoria nulas. O parser Zod normaliza
relações do Supabase, que podem chegar como objeto ou array.

`ProductRecord` é o view model compartilhado por catálogo, detalhe, relacionados
e carrinho. `ProductImage` valida protocolo, impede `src=""`, trata erro de rede
e conserva dimensões.

Filtros públicos vivem na URL:

```text
/produtos?nome=&categoria=&subcategoria=&ordem=&page=
```

A consulta usa `count: exact`, range no servidor e redireciona páginas fora do
intervalo para a última página válida.

O hero é parte do shell síncrono da rota. A leitura do catálogo fica em um
Server Component assíncrono dentro de `Suspense`, enquanto um controlador
cliente compartilha o estado de navegação entre filtros e paginação. Durante
trocas de página, filtros e hero permanecem montados e somente resultados,
total e paginação apresentam skeleton. Um bloqueio single-flight impede
navegações repetidas para o mesmo destino.


## Supabase e Server Actions

O frontend consome schema e políticas existentes. Nenhuma tela concede
autorização: toda mutação administrativa chama `requireAdminAccess`. Os
formulários usam o mesmo schema Zod em `admin-schema.ts` e retornam erros
esperados por campo.

Não liberar padrões remotos amplos no otimizador do Next. As origens legadas
continuam `unoptimized` e defensivas até uma futura centralização no Storage,
explicitamente fora deste escopo.

## Administração

`AdminShell` unifica `/dashboard` para administradores, `/admin/products`,
`/admin/pedidos` e `/admin/clientes`. O cliente comum mantém seu dashboard
específico. A sidebar pode ser recolhida durante a navegação, mas o estado não é
persistido após recarregar. URLs antigas com `tab` em `/admin/clientes` são
normalizadas para a rota correspondente.

