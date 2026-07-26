# Contrato de desenvolvimento para agentes

Estas regras são obrigatórias para qualquer IA ou automação que altere este
repositório.

## Escopo e limites

- O escopo padrão é a aplicação Next.js e sua experiência frontend.
- Não alterar tabelas, dados, migrations, funções, triggers, Storage, RLS ou
  políticas do Supabase sem solicitação explícita do responsável pelo projeto.
- Preservar `requireAdminAccess` em toda mutação administrativa. Não criar
  endpoints públicos como atalho para Server Actions protegidas.
- Não registrar tokens, cookies, credenciais, payloads de clientes ou sessões.

## Interface

- Usar tokens semânticos de `src/app/globals.css`; não espalhar cores hexadecimais.
- Reutilizar `src/components/ui` e componentes de domínio antes de criar novas
  variantes locais.
- Projetar mobile-first e validar em 390, 768, 1024 e 1440 px.
- Toda ação assíncrona deve desabilitar o controle, preservar sua largura e
  exibir spinner/texto de progresso.
- Toda tela de dados deve prever loading, vazio e erro recuperável.
- Usar `ProductImage` para produtos. Nunca enviar string vazia para `src`.
- Manter foco visível, rótulos, nomes acessíveis, navegação por teclado,
  `aria-live` para feedback e alvos de toque adequados.

## Dados e componentes

- Dados vindos do Supabase ou APIs são desconhecidos até serem validados.
- Centralizar parsing e normalização com Zod em `src/features`.
- Server Components fazem leitura e composição; Client Components ficam
  restritos a estado, eventos e APIs do navegador.
- Formulários de criar/editar devem compartilhar schema e apresentação.
- Erros esperados de Server Actions retornam `{ success, message, fieldErrors? }`;
  exceções ficam reservadas para falhas inesperadas.

## Movimento

- Importar Motion por `motion/react`.
- Usar Motion somente quando a transição explica mudança funcional: Sheet,
  Dialog, carrinho, filtros, entrada/saída ou mudança de layout.
- Hovers simples permanecem em CSS.
- O provider global deve manter `reducedMotion="user"`; nunca contornar
  `prefers-reduced-motion`.

## Checklist antes da entrega

1. Conferir escopo e diff, preservando alterações alheias.
2. Executar `npm run lint`.
3. Executar `npm run typecheck`.
4. Executar `npm run test`.
5. Executar `npm run build`.
6. Validar responsividade, teclado, foco e ausência de overflow.
7. Atualizar README ou `docs/` quando um contrato de interface mudar.
8. Informar limitações reais de validação, especialmente rotas autenticadas.
