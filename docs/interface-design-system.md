# Sistema de interface

## Direção visual

A identidade “marca refinada” combina o amarelo, vermelho e grafite da IngaPan
com superfícies claras, hierarquia limpa e baixa densidade visual no catálogo.
O tema inicial é exclusivamente claro.

## Tokens

Todos os valores de marca e tokens semânticos vivem em
`src/app/globals.css`. Componentes consomem `background`, `foreground`, `card`,
`primary`, `secondary`, `muted`, `accent`, `destructive`, `border`, `input` e
`ring`.

- grafite: ação primária, estrutura e texto;
- amarelo: destaque e CTA comercial;
- vermelho: destrutivo e acento institucional;
- superfícies: branco e tons quentes quase neutros;
- verde do WhatsApp: token de integração, não cor de estado genérico.

Uma mudança de identidade começa nos tokens, não em buscas e substituições nos
componentes.

## Tipografia, espaço e forma

- Outfit é a fonte de leitura e interface;
- Montserrat é a fonte de títulos;
- raio base: `0.75rem`, expandido semanticamente pelo Tailwind;
- sombras `--shadow-soft` e `--shadow-raised`;
- durações `--motion-fast`, `--motion-normal` e `--motion-slow`;
- grids usam espaçamento de 16–24 px e áreas administrativas são mais compactas.

## Componentes

shadcn/ui é a base de Button, Avatar, Badge, Card, Field, Input, Textarea,
Select, Combobox, Dialog, AlertDialog, Sheet, DropdownMenu, Table, Tabs,
Pagination, Skeleton, Empty, Alert, Tooltip e Sonner. Os arquivos permanecem em
`src/components/ui` e podem ser ajustados pelo projeto.

Botões oferecem `default`, `secondary`, `outline`, `ghost`, `destructive` e
`link`, com tamanhos `sm`, `default`, `lg` e `icon`. Botões assíncronos usam
Spinner, ficam desabilitados e recebem largura mínima.

Avatares usam 36 px em headers e fallback com até duas iniciais. Imagens de
produto usam `ProductImage`, proporção estável e placeholder local.

## Motion

`AppProviders` configura `MotionConfig reducedMotion="user"`. Motion é aplicado
ao carrinho, revelações e mudanças de layout do catálogo. Ao adicionar um
produto, uma miniatura ampliada percorre uma trajetória visível da origem da
ação até o ícone do carrinho, sem toast, abertura do Sheet ou pulso no contador.
Sheets e dialogs
mantêm transições funcionais curtas. Hovers são CSS. A regra global de
`prefers-reduced-motion` reduz animações e remove rolagem suave.
