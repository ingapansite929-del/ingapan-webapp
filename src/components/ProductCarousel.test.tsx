import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ProductCarousel from "@/components/ProductCarousel";

const refresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh }),
}));

vi.mock("embla-carousel-react", () => ({
  default: () => [vi.fn(), null],
}));

vi.mock("embla-carousel-autoplay", () => ({
  default: () => ({}),
}));

vi.mock("@/components/ScrollReveal", () => ({
  default: ({ children }: { children: ReactNode }) => children,
}));

describe("ProductCarousel", () => {
  beforeEach(() => refresh.mockClear());

  it("exibe um erro recuperável sem substituir a falha pelo placeholder", () => {
    render(
      <ProductCarousel state={{ status: "error", reason: "products-query" }} />
    );

    expect(
      screen.getByRole("alert", {
        name: /não foi possível carregar os destaques/i,
      })
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Tentar novamente" }));
    expect(refresh).toHaveBeenCalledOnce();
  });
});
