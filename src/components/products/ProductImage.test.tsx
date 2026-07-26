import { fireEvent, render, screen } from "@testing-library/react";
import { createElement } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ProductImage from "@/components/products/ProductImage";

vi.mock("next/image", () => ({
  default: (
    props: React.ImgHTMLAttributes<HTMLImageElement> & { fill?: boolean }
  ) => {
    const imageProps = { ...props };
    Reflect.deleteProperty(imageProps, "fill");
    return createElement("img", imageProps);
  },
}));

describe("ProductImage", () => {
  beforeEach(() => vi.clearAllMocks());

  it("não renderiza src vazio e apresenta fallback local", () => {
    const { container } = render(
      <ProductImage src="" alt="Produto sem imagem" fill />
    );

    expect(container.querySelector("img")).not.toBeInTheDocument();
    expect(
      screen.getByRole("img", {
        name: "Imagem indisponível para Produto sem imagem",
      })
    ).toBeInTheDocument();
  });

  it("troca a imagem pelo fallback quando o carregamento falha", () => {
    const { container } = render(
      <ProductImage
        src="https://example.com/indisponivel.png"
        alt="Produto externo"
        fill
      />
    );

    const image = container.querySelector("img");
    expect(image).toHaveAttribute(
      "src",
      "https://example.com/indisponivel.png"
    );
    fireEvent.error(image as HTMLImageElement);
    expect(container.querySelector("img")).not.toBeInTheDocument();
    expect(
      screen.getByRole("img", {
        name: "Imagem indisponível para Produto externo",
      })
    ).toBeInTheDocument();
  });
});
