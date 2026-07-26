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
- menus de ação têm nomes acessíveis;
- na gestão de produtos, clicar ou pressionar Enter/Espaço na linha abre o
  Sheet de edição; ações internas não propagam o clique.


## Filtros

- busca tem rótulo ou nome acessível permanente;
- categoria e subcategoria são independentes e combináveis;
- filtros ativos aparecem como chips removíveis;
- “Limpar filtros” volta ao estado canônico;
- paginação preserva todos os parâmetros na URL;
- paginação usa navegação cliente single-flight, bloqueia reenvios enquanto
  pendente e rola imediatamente ao início dos filtros e resultados, antes da
  resposta da nova página;

- no mobile, busca permanece visível e opções avançadas ficam em Sheet.

## Estados

- loading: skeleton proporcional ao conteúdo final, evitando layout shift;
- vazio: explica o motivo e oferece uma próxima ação;
- erro: mensagem clara, “Tentar novamente” e retorno seguro;
- sucesso: toast global, sem depender apenas de cor;
- confirmação: usada antes de ação irreversível.

Adicionar ao orçamento é a exceção ao toast de sucesso: uma miniatura percorre
o caminho até o ícone do carrinho, o contador é atualizado e o Sheet permanece
fechado. A remoção de um item também atualiza o carrinho silenciosamente. Com
movimento reduzido, o deslocamento é omitido.

## Acessibilidade e responsividade

Validar teclado, foco visível, labels, `aria-current`, `aria-live`, dialogs
modais e movimento reduzido. As larguras de referência são 390, 768, 1024 e
1440 px. Nenhuma tela pode depender de hover nem produzir overflow horizontal.
