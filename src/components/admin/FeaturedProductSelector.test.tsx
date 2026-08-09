import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import FeaturedProductSelector from "@/components/admin/FeaturedProductSelector";
import type { FeaturedSelectableProduct } from "@/features/products/featured-selector";

const mocks = vi.hoisted(() => ({
  addToast: vi.fn(),
  create: vi.fn(),
  list: vi.fn(),
  refresh: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: mocks.refresh }),
}));

vi.mock("@/components/Toast", () => ({
  useToast: () => ({ addToast: mocks.addToast }),
}));

vi.mock("@/app/admin/products/actions", () => ({
  createFeaturedProductAction: mocks.create,
  listFeaturedSelectableProductsAction: mocks.list,
}));

vi.mock("@/components/products/ProductImage", () => ({
  default: ({ alt }: { alt: string }) => (
    <div role="img" aria-label={`Imagem de ${alt}`} />
  ),
}));

const firstProduct: FeaturedSelectableProduct = {
  id: 1,
  nome: "Chocolate em gotas",
  imageUrl: null,
};

const secondProduct: FeaturedSelectableProduct = {
  id: 2,
  nome: "Farinha especial",
  imageUrl: null,
};

function renderSelector(featuredProductIds: number[] = []) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  return render(
    <QueryClientProvider client={client}>
      <FeaturedProductSelector
        featuredProductIds={featuredProductIds}
        categories={[
          { id: 4, category: "Confeitaria" },
          { id: 5, category: "Panificação" },
        ]}
        subcategories={[{ id: 9, subcategoria: "Chocolate" }]}
      />
    </QueryClientProvider>
  );
}

beforeEach(() => {
  mocks.list.mockResolvedValue({
    success: true,
    products: [firstProduct],
    page: 1,
    hasNextPage: false,
  });
  mocks.create.mockResolvedValue({
    success: true,
    message: "Produto adicionado aos destaques!",
  });

  Object.defineProperty(Element.prototype, "hasPointerCapture", {
    configurable: true,
    value: () => false,
  });
  Object.defineProperty(Element.prototype, "setPointerCapture", {
    configurable: true,
    value: () => undefined,
  });
  Object.defineProperty(Element.prototype, "releasePointerCapture", {
    configurable: true,
    value: () => undefined,
  });
  Object.defineProperty(Element.prototype, "scrollIntoView", {
    configurable: true,
    value: () => undefined,
  });
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  vi.unstubAllGlobals();
});

describe("FeaturedProductSelector", () => {
  it("carrega uma única página adicional somente após rolagem real da lista", async () => {
    let finishNextPage:
      | ((value: {
          success: true;
          products: FeaturedSelectableProduct[];
          page: number;
          hasNextPage: false;
        }) => void)
      | null = null;
    mocks.list.mockImplementation(({ page }: { page: number }) => {
      if (page === 1) {
        return Promise.resolve({
          success: true,
          products: [firstProduct],
          page,
          hasNextPage: true,
        });
      }

      return new Promise((resolve) => {
        finishNextPage = resolve;
      });
    });

    renderSelector();

    expect(await screen.findByText(firstProduct.nome)).toBeInTheDocument();
    expect(screen.queryByText("Produto")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Anterior" })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Próxima" })
    ).not.toBeInTheDocument();
    expect(mocks.list).toHaveBeenCalledTimes(1);

    const results = screen.getByLabelText(
      "Produtos disponíveis para destaque"
    );
    Object.defineProperties(results, {
      clientHeight: { configurable: true, value: 448 },
      scrollHeight: { configurable: true, value: 900 },
      scrollTop: { configurable: true, value: 400, writable: true },
    });
    fireEvent.scroll(results);
    expect(mocks.list).toHaveBeenCalledTimes(1);

    fireEvent.wheel(results, { deltaY: 300 });
    for (let index = 0; index < 20; index += 1) {
      fireEvent.scroll(results);
    }

    await waitFor(() => expect(mocks.list).toHaveBeenCalledTimes(2));
    expect(mocks.list).toHaveBeenLastCalledWith(
      expect.objectContaining({ page: 2 })
    );

    await act(async () => {
      finishNextPage?.({
        success: true,
        products: [secondProduct],
        page: 2,
        hasNextPage: false,
      });
    });

    expect(await screen.findByText(secondProduct.nome)).toBeInTheDocument();
    expect(screen.getByText("Fim da lista")).toBeInTheDocument();
    expect(mocks.list).toHaveBeenCalledTimes(2);
    expect(within(results).queryByText("Confeitaria")).not.toBeInTheDocument();
    expect(within(results).queryByText("Chocolate")).not.toBeInTheDocument();
  });

  it("só aplica categoria e subcategoria após a confirmação e permite limpar", async () => {
    renderSelector();
    expect(await screen.findByText(firstProduct.nome)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Filtrar produtos" }));
    const categoryTrigger = screen.getByRole("combobox", {
      name: "Categoria",
    });
    fireEvent.pointerDown(categoryTrigger, {
      button: 0,
      ctrlKey: false,
      pointerType: "mouse",
    });
    fireEvent.click(await screen.findByRole("option", { name: "Confeitaria" }));

    const subcategoryTrigger = screen.getByRole("combobox", {
      name: "Subcategoria",
    });
    fireEvent.pointerDown(subcategoryTrigger, {
      button: 0,
      ctrlKey: false,
      pointerType: "mouse",
    });
    fireEvent.click(await screen.findByRole("option", { name: "Chocolate" }));

    expect(
      mocks.list.mock.calls.some(
        ([input]) => input.categoryId === 4 || input.subcategoryId === 9
      )
    ).toBe(false);

    fireEvent.click(screen.getByRole("button", { name: "Aplicar" }));
    await waitFor(() =>
      expect(mocks.list).toHaveBeenCalledWith(
        expect.objectContaining({ categoryId: 4, subcategoryId: 9, page: 1 })
      )
    );
    expect(
      screen.getByText("Filtros: Confeitaria · Chocolate")
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Limpar filtros" }));
    await waitFor(() =>
      expect(mocks.list).toHaveBeenCalledWith(
        expect.objectContaining({ categoryId: null, subcategoryId: null })
      )
    );
  });

  it("aguarda 300 ms antes de consultar uma nova busca", async () => {
    renderSelector();
    expect(await screen.findByText(firstProduct.nome)).toBeInTheDocument();

    fireEvent.change(
      screen.getByRole("textbox", { name: "Buscar produto para destaque" }),
      { target: { value: "farinha" } }
    );

    expect(
      mocks.list.mock.calls.some(([input]) => input.search === "farinha")
    ).toBe(false);

    await act(async () => {
      await new Promise((resolve) => window.setTimeout(resolve, 320));
    });

    await waitFor(() =>
      expect(mocks.list).toHaveBeenCalledWith(
        expect.objectContaining({ page: 1, search: "farinha" })
      )
    );
  });

  it("mostra estados vazios e permite limpar filtros quando aplicados", async () => {
    mocks.list.mockResolvedValue({
      success: true,
      products: [],
      page: 1,
      hasNextPage: false,
    });

    renderSelector();

    expect(await screen.findByText("Nenhum produto encontrado")).toBeInTheDocument();
    expect(
      screen.getByText("Ajuste a busca ou remova os filtros aplicados.")
    ).toBeInTheDocument();
  });

  it("oferece recuperação quando a consulta inicial falha", async () => {
    mocks.list.mockResolvedValue({
      success: false,
      message: "Falha controlada na busca.",
    });

    renderSelector();

    expect(
      await screen.findByText("Não foi possível carregar os produtos")
    ).toBeInTheDocument();
    expect(screen.getByText("Falha controlada na busca.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Tentar novamente" }));
    await waitFor(() => expect(mocks.list).toHaveBeenCalledTimes(2));
  });

  it("adiciona diretamente, mostra spinner apenas no card acionado e o remove do cache", async () => {
    let finishCreate: ((value: { success: true; message: string }) => void) | null =
      null;
    mocks.list.mockResolvedValue({
      success: true,
      products: [firstProduct, secondProduct],
      page: 1,
      hasNextPage: false,
    });
    mocks.create.mockImplementation(
      () =>
        new Promise((resolve) => {
          finishCreate = resolve;
        })
    );

    renderSelector();
    expect(await screen.findByText(firstProduct.nome)).toBeInTheDocument();

    const firstButton = screen.getByRole("button", {
      name: `Adicionar ${firstProduct.nome} aos destaques`,
    });
    const secondButton = screen.getByRole("button", {
      name: `Adicionar ${secondProduct.nome} aos destaques`,
    });
    fireEvent.click(firstButton);

    await waitFor(() => {
      expect(within(firstButton).getByRole("status")).toBeInTheDocument();
      expect(secondButton).toBeDisabled();
    });

    await act(async () => {
      finishCreate?.({
        success: true,
        message: "Produto adicionado aos destaques!",
      });
    });

    await waitFor(() =>
      expect(screen.queryByText(firstProduct.nome)).not.toBeInTheDocument()
    );
    expect(screen.getByText(secondProduct.nome)).toBeInTheDocument();
    expect(mocks.refresh).toHaveBeenCalledTimes(1);
    expect(mocks.addToast).toHaveBeenCalledWith(
      "Produto adicionado aos destaques!",
      "success"
    );
  });

  it("não consulta produtos quando o limite de 10 destaques foi atingido", () => {
    renderSelector(Array.from({ length: 10 }, (_, index) => index + 1));

    expect(screen.getByText("Limite de destaques atingido")).toBeInTheDocument();
    expect(mocks.list).not.toHaveBeenCalled();
  });
});
