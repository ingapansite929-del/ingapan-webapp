# Padrões de UX

## Formulários

- rótulos visíveis e mensagens associadas ao campo;
- validação Zod compartilhada com a Server Action;
- valores permanecem preenchidos quando a validação falha;
- ação principal mostra loading e não muda de largura;
- sucesso fecha o Sheet e dispara toast; erro esperado mantém o contexto.

## CRUD administrativo

- criar e editar usam o mesmo formulário em Sheet largo no desktop e integral
  no mobile;
- visualizar abre a rota pública em endereço estável;
- excluir sempre usa AlertDialog com nome, consequência e botão destrutivo;
- tabela compacta no desktop e cards no mobile;
- menus de ação têm nomes acessíveis.

## Filtros

- busca tem rótulo ou nome acessível permanente;
- categoria e subcategoria são independentes e combináveis;
- filtros ativos aparecem como chips removíveis;
- “Limpar filtros” volta ao estado canônico;
- paginação preserva todos os parâmetros na URL;
- no mobile, busca permanece visível e opções avançadas ficam em Sheet.

## Estados

- loading: skeleton proporcional ao conteúdo final, evitando layout shift;
- vazio: explica o motivo e oferece uma próxima ação;
- erro: mensagem clara, “Tentar novamente” e retorno seguro;
- sucesso: toast global, sem depender apenas de cor;
- confirmação: usada antes de ação irreversível.

## Acessibilidade e responsividade

Validar teclado, foco visível, labels, `aria-current`, `aria-live`, dialogs
modais e movimento reduzido. As larguras de referência são 390, 768, 1024 e
1440 px. Nenhuma tela pode depender de hover nem produzir overflow horizontal.
