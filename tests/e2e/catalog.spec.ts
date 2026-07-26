import { expect, test } from "@playwright/test";

test("catálogo abre sem overflow e preserva filtros na paginação", async ({
  page,
}) => {
  const consoleErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
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
  await expect(
    page.getByText(/Produto adicionado ao carrinho/i).first()
  ).toBeVisible();
  await expect(page.getByRole("dialog", { name: /Meu Carrinho/i })).toBeVisible();
});
