import type { ProductRecord } from "@/features/products/types";

type QuoteProduct = Pick<ProductRecord, "codigo" | "nome">;

export interface QuoteItem {
  product: QuoteProduct;
  quantity: number;
}

export function formatProductReference(
  product: Pick<ProductRecord, "codigo">
): string | null {
  return product.codigo ? `Cód. ${product.codigo}` : null;
}

function formatProductWithReference(product: QuoteProduct): string {
  const reference = formatProductReference(product);
  return `${product.nome}${reference ? ` (${reference})` : ""}`;
}

export function buildSingleProductQuoteMessage(product: QuoteProduct): string {
  const reference = formatProductReference(product);
  return `Olá! Tenho interesse no produto "${product.nome}"${reference ? ` (${reference})` : ""}. Gostaria de receber mais informações e orçamento.`;
}

export function buildCartQuoteMessage(items: QuoteItem[]): string {
  const messageStart =
    "Olá! Gostaria de solicitar um orçamento para os seguintes produtos:\n\n";
  const itemsList = items
    .map(
      (item) =>
        `- ${item.quantity}x ${formatProductWithReference(item.product)}`
    )
    .join("\n");
  const messageEnd = "\n\nAguardo o retorno com os valores.";

  return messageStart + itemsList + messageEnd;
}
