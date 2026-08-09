import { describe, expect, it } from "vitest";
import {
  buildCartQuoteMessage,
  buildSingleProductQuoteMessage,
  formatProductReference,
} from "@/features/products/quote";

describe("referência pública e orçamento de produtos", () => {
  it("formata o código interno sem usar o ID técnico", () => {
    expect(formatProductReference({ codigo: "1480" })).toBe("Cód. 1480");
    expect(formatProductReference({ codigo: null })).toBeNull();
  });

  it("inclui o código no orçamento direto quando disponível", () => {
    expect(
      buildSingleProductQuoteMessage({
        codigo: "1480",
        nome: "Assadeira",
      })
    ).toBe(
      'Olá! Tenho interesse no produto "Assadeira" (Cód. 1480). Gostaria de receber mais informações e orçamento.'
    );
  });

  it("omite a referência de produtos sem código", () => {
    expect(
      buildSingleProductQuoteMessage({
        codigo: null,
        nome: "Produto legado",
      })
    ).toBe(
      'Olá! Tenho interesse no produto "Produto legado". Gostaria de receber mais informações e orçamento.'
    );
  });

  it("monta o orçamento do carrinho com códigos apenas quando existentes", () => {
    expect(
      buildCartQuoteMessage([
        {
          product: { codigo: "1480", nome: "Assadeira" },
          quantity: 2,
        },
        {
          product: { codigo: null, nome: "Produto legado" },
          quantity: 1,
        },
      ])
    ).toContain("- 2x Assadeira (Cód. 1480)\n- 1x Produto legado");
  });
});
