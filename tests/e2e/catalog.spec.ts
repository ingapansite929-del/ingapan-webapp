import { expect, test } from "@playwright/test";

test("catálogo abre sem overflow e preserva filtros na paginação", async ({
  page,
}) => {
  const consoleErrors: string[] = [];
  const consoleWarnings: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
    if (message.type() === "warning") consoleWarnings.push(message.text());
  });

  await page.goto("/produtos");
  await expect(
    page.getByRole("heading", {
      name: "Encontre o produto certo para seu negócio",
    })
  ).toBeVisible();
  const dimensions = await page
    .locator("body")
    .evaluate((body) => ({ scrollWidth: body.scrollWidth, clientWidth: body.clientWidth }));
  expect(dimensions.scrollWidth).toBe(dimensions.clientWidth);

  const search = page.getByLabel("Buscar produtos por nome");
  if (await search.isVisible()) {
    await search.fill("pão");
    await search.press("Enter");
    await expect(page).toHaveURL(/nome=p%C3%A3o|nome=pão/);
  }

  expect(
    consoleErrors.filter((message) => message.includes('src attribute'))
  ).toEqual([]);
  expect(
    consoleWarnings.filter((message) =>
      message.includes("Largest Contentful Paint")
    )
  ).toEqual([]);
});

test("paginação bloqueia cliques repetidos e mantém o shell estável", async ({
  page,
}) => {
  let page20Requests = 0;
  await page.route("**/produtos?**", async (route) => {
    const url = new URL(route.request().url());
    if (url.searchParams.get("page") === "20") {
      await new Promise((resolve) => setTimeout(resolve, 600));
    }
    await route.continue();
  });
  page.on("request", (request) => {
    if (new URL(request.url()).pathname === "/produtos") {
      const url = new URL(request.url());
      if (url.searchParams.get("page") === "20") page20Requests += 1;
    }
  });

  await page.goto("/produtos?page=19");
  const hero = page.getByRole("heading", {
    name: "Encontre o produto certo para seu negócio",
  });
  const page20 = page.getByRole("link", { name: "Ir para a página 20" });
  await page20.scrollIntoViewIfNeeded();

  await page20.evaluate((element) => {
    for (let index = 0; index < 20; index += 1) {
      element.dispatchEvent(
        new MouseEvent("click", {
          bubbles: true,
          cancelable: true,
          view: window,
        })
      );
    }
  });

  await expect(hero).toBeVisible();
  await expect(page.getByLabel("Carregando produtos")).toBeVisible();
  const catalogStart = page.locator("[data-catalog-start]");
  await expect
    .poll(() =>
      catalogStart.evaluate((element) => element.getBoundingClientRect().top)
    )
    .toBeGreaterThanOrEqual(64);
  const catalogTopWhilePending = await catalogStart.evaluate((element) =>
    element.getBoundingClientRect().top
  );
  expect(catalogTopWhilePending).toBeLessThan(140);

  await expect(page).toHaveURL(/page=20/);
  await expect(
    page.getByRole("link", { name: "Ir para a página 20" })
  ).toHaveAttribute("aria-current", "page");
  await expect(page.getByLabel("Carregando produtos")).toHaveCount(0);
  expect(page20Requests).toBe(1);
});

test("dropdown limita altura e mantém rolagem nas opções", async ({ page }) => {
  await page.goto("/produtos");

  if (await page.getByRole("button", { name: "Abrir filtros" }).isVisible()) {
    await page.getByRole("button", { name: "Abrir filtros" }).click();
  }

  const subcategory = page.getByRole("combobox", { name: "Subcategoria" });
  await subcategory.click();
  const content = page.locator('[data-slot="select-content"]').filter({
    has: page.getByRole("option", { name: "Todas as subcategorias" }),
  });
  await expect(content).toBeVisible();
  const viewport = content.locator('[data-slot="select-viewport"]');
  const dimensions = await viewport.evaluate((element) => ({
    clientHeight: element.clientHeight,
    scrollHeight: element.scrollHeight,
  }));
  expect(dimensions.clientHeight).toBeLessThanOrEqual(320);
  expect(dimensions.scrollHeight).toBeGreaterThan(dimensions.clientHeight);
});

test("carrinho salvo hidrata sem mismatch", async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  await page.addInitScript(() => {
    localStorage.setItem(
      "cart-storage",
      JSON.stringify([
        {
          product: {
            id: 136,
            nome: "Produto salvo",
            id_categoria: 1,
            id_subcategoria: 1,
            descricao: null,
            image_url: null,
            product_categoria: null,
            product_subcategory: null,
          },
          quantity: 2,
        },
      ])
    );
  });

  await page.goto("/produtos");
  await expect(page.locator("[data-cart-trigger]").first()).toContainText("2");
  expect(
    consoleErrors.filter((message) => message.includes("Hydration failed"))
  ).toEqual([]);
});

test("produto incompleto, carrinho e ícones têm fallback estável", async ({
  page,
  request,
}) => {
  const appleIcon = await request.get("/apple-icon.png");
  const icon = await request.get("/icon.png");
  expect(appleIcon.status()).toBe(200);
  expect(icon.status()).toBe(200);

  await page.goto("/produtos/473");
  await expect(page.getByText("Imagem indisponível").first()).toBeVisible();
  await expect(page.locator('img[src=""]')).toHaveCount(0);
  await expect(page.locator("[data-nextjs-dialog]")).toHaveCount(0);

  await page.getByRole("button", { name: "Adicionar ao orçamento" }).click();
  const flight = page.locator("[data-cart-flight]");
  await expect(flight).toBeVisible();
  const startPosition = await flight.boundingBox();
  await page.waitForTimeout(350);
  const middlePosition = await flight.boundingBox();
  expect(startPosition).not.toBeNull();
  expect(middlePosition).not.toBeNull();
  expect(
    Math.abs((middlePosition?.x ?? 0) - (startPosition?.x ?? 0))
  ).toBeGreaterThan(5);
  await expect(flight).toHaveCount(0, {
    timeout: 2_000,
  });
  await expect(
    page.getByText(/Produto adicionado|Quantidade atualizada/i)
  ).toHaveCount(0);
  await expect(page.getByRole("dialog", { name: /Meu Carrinho/i })).toHaveCount(
    0
  );
  const visibleCartTrigger = page
    .locator("[data-cart-trigger]:visible")
    .first();
  await expect(visibleCartTrigger).toContainText("1");

  await visibleCartTrigger.click();
  const cartDialog = page.getByRole("dialog", { name: /Meu Carrinho/i });
  await expect(cartDialog).toBeVisible();
  await cartDialog.getByRole("button", { name: /^Remover / }).click();
  await expect(page.getByText("Produto removido do carrinho")).toHaveCount(0);
});

test("detalhe de produto abre no topo após navegar pelo catálogo", async ({
  page,
}) => {
  await page.goto("/produtos?page=20");
  const productLink = page.getByRole("link", {
    name: "Ver detalhes de GOTA CHIPSHOW 2,5KG HARALD",
  });
  await productLink.scrollIntoViewIfNeeded();
  await productLink.click();

  await expect(page).toHaveURL(/\/produtos\/136$/);
  await expect
    .poll(() => page.evaluate(() => window.scrollY))
    .toBeLessThan(8);
  await expect(
    page.getByRole("heading", {
      name: "GOTA CHIPSHOW 2,5KG HARALD",
      level: 1,
    })
  ).toBeVisible();
});

test("CTA principal da home abre diretamente o catálogo", async ({ page }) => {
  await page.goto("/");
  await page
    .getByRole("link", { name: "Conheça Nossos Produtos" })
    .click();

  await expect(page).toHaveURL(/\/produtos$/);
  await expect(
    page.getByRole("heading", {
      name: "Encontre o produto certo para seu negócio",
    })
  ).toBeVisible();
});
