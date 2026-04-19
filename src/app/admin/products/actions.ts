"use server";

import { revalidatePath } from "next/cache";
import { requireAdminAccess } from "@/lib/auth/admin";

const ADMIN_PRODUCTS_PATH = "/admin/products";
const HOME_PATH = "/";
const MAX_FEATURED_PRODUCTS = 10;
const FEATURED_SELECTOR_PAGE_SIZE = 15;

export type FeaturedSelectableProduct = {
  id: number;
  nome: string;
};

type ProductInput = {
  id?: number;
  nome: string;
  id_categoria: number;
  descricao: string;
  imageUrl: string;
};

function normalizeText(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}

function validateLength(
  fieldName: string,
  value: string,
  min: number,
  max: number
): string | null {
  if (value.length < min || value.length > max) {
    return `${fieldName} deve ter entre ${min} e ${max} caracteres.`;
  }

  return null;
}

function validateImageUrl(rawValue: string): string | null {
  if (!rawValue) {
    return "URL da imagem é obrigatória.";
  }

  if (rawValue.startsWith("/")) {
    return null;
  }

  try {
    const parsed = new URL(rawValue);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      return "URL da imagem deve usar HTTP ou HTTPS.";
    }
    return null;
  } catch {
    return "URL da imagem inválida.";
  }
}

function parseId(value: FormDataEntryValue | null): number | null {
  const parsed = Number(typeof value === "string" ? value : "");
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}

function parseDisplayOrder(value: FormDataEntryValue | null): number | null {
  const parsed = Number(typeof value === "string" ? value : "");
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}

function sanitizePositiveIntList(values: number[]): number[] {
  const ids = values
    .map((value) => Number(value))
    .filter((value) => Number.isInteger(value) && value > 0);

  return [...new Set(ids)];
}

function parseFeaturedOrderIds(value: FormDataEntryValue | null): number[] | null {
  if (typeof value !== "string") {
    return null;
  }

  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return null;
    }

    const ids = parsed.map((item) => Number(item));
    const allValid = ids.every((id) => Number.isInteger(id) && id > 0);
    if (!allValid) {
      return null;
    }

    if (new Set(ids).size !== ids.length) {
      return null;
    }

    return ids;
  } catch {
    return null;
  }
}

function parseProductInput(formData: FormData, includeId = false): {
  data: ProductInput | null;
  error: string | null;
} {
  const nome = normalizeText(formData.get("nome"));
  const idCategoria = parseId(formData.get("id_categoria"));
  const descricao = normalizeText(formData.get("descricao"));
  const imageUrl = normalizeText(formData.get("image_url"));

  const nomeError = validateLength("Nome", nome, 2, 120);
  if (nomeError) return { data: null, error: nomeError };

  if (!idCategoria) {
    return { data: null, error: "Categoria inválida." };
  }

  const descricaoError = validateLength("Descrição", descricao, 5, 2000);
  if (descricaoError) return { data: null, error: descricaoError };

  const imageUrlError = validateImageUrl(imageUrl);
  if (imageUrlError) return { data: null, error: imageUrlError };

  if (!includeId) {
    return {
      data: {
        nome,
        id_categoria: idCategoria,
        descricao,
        imageUrl,
      },
      error: null,
    };
  }

  const id = parseId(formData.get("id"));
  if (!id) {
    return {
      data: null,
      error: "ID inválido para atualização.",
    };
  }

  return {
    data: {
      id,
      nome,
      id_categoria: idCategoria,
      descricao,
      imageUrl,
    },
    error: null,
  };
}

export async function createProductAction(formData: FormData) {
  const { supabase } = await requireAdminAccess({
    forbiddenRedirectPath:
      "/admin/products?error=" +
      encodeURIComponent("Acesso negado ao painel admin."),
  });

  const { data, error } = parseProductInput(formData);
  if (!data || error) {
    return { success: false, message: error ?? "Dados do produto inválidos." };
  }

  const { error: insertError } = await supabase.from("products").insert({
    nome: data.nome,
    id_categoria: data.id_categoria,
    descricao: data.descricao,
    image_url: data.imageUrl,
  });

  if (insertError) {
    return { success: false, message: "Nao foi possivel criar o produto." };
  }

  revalidatePath(ADMIN_PRODUCTS_PATH);
  return { success: true, message: "Produto criado com sucesso!" };
}

export async function listFeaturedSelectableProductsAction(input: {
  page: number;
  search?: string;
  excludedProductIds?: number[];
}) {
  const { supabase } = await requireAdminAccess({
    forbiddenRedirectPath:
      "/admin/products?error=" +
      encodeURIComponent("Acesso negado ao painel admin."),
  });

  const page = Number.isInteger(input.page) && input.page > 0 ? input.page : 1;
  const search = (input.search ?? "").trim();

  if (search.length > 120) {
    return { success: false, message: "Busca deve ter no máximo 120 caracteres." };
  }

  const excludedIds = sanitizePositiveIntList(input.excludedProductIds ?? []);

  let query = supabase
    .from("products")
    .select("id, nome")
    .order("nome", { ascending: true })
    .order("id", { ascending: true });

  if (search) {
    query = query.ilike("nome", `%${search}%`);
  }

  if (excludedIds.length > 0) {
    query = query.not("id", "in", `(${excludedIds.join(",")})`);
  }

  const from = (page - 1) * FEATURED_SELECTOR_PAGE_SIZE;
  const to = from + FEATURED_SELECTOR_PAGE_SIZE;
  const { data, error } = await query.range(from, to);

  if (error) {
    return { success: false, message: "Não foi possível carregar os produtos para destaque." };
  }

  const rows = (data ?? []) as FeaturedSelectableProduct[];
  const hasNextPage = rows.length > FEATURED_SELECTOR_PAGE_SIZE;

  return {
    success: true,
    products: hasNextPage ? rows.slice(0, FEATURED_SELECTOR_PAGE_SIZE) : rows,
    page,
    hasPreviousPage: page > 1,
    hasNextPage,
  };
}

export async function updateProductAction(formData: FormData) {
  const { supabase } = await requireAdminAccess({
    forbiddenRedirectPath:
      "/admin/products?error=" +
      encodeURIComponent("Acesso negado ao painel admin."),
  });

  const { data, error } = parseProductInput(formData, true);
  if (!data || error || !data.id) {
    return { success: false, message: error ?? "Dados para atualização inválidos." };
  }

  const { error: updateError } = await supabase
    .from("products")
    .update({
      nome: data.nome,
      id_categoria: data.id_categoria,
      descricao: data.descricao,
      image_url: data.imageUrl,
    })
    .eq("id", data.id);

  if (updateError) {
    return { success: false, message: "Nao foi possivel atualizar o produto." };
  }

  revalidatePath(ADMIN_PRODUCTS_PATH);
  return { success: true, message: "Produto atualizado com sucesso!" };
}

export async function deleteProductAction(formData: FormData) {
  const { supabase } = await requireAdminAccess({
    forbiddenRedirectPath:
      "/admin/products?error=" +
      encodeURIComponent("Acesso negado ao painel admin."),
  });

  const id = parseId(formData.get("id"));
  if (!id) {
    return { success: false, message: "ID inválido para remoção." };
  }

  const { error: deleteError } = await supabase
    .from("products")
    .delete()
    .eq("id", id);

  if (deleteError) {
    return { success: false, message: "Nao foi possivel excluir o produto." };
  }

  revalidatePath(ADMIN_PRODUCTS_PATH);
  return { success: true, message: "Produto removido com sucesso!" };
}

export async function createProductCategoryAction(formData: FormData) {
  const { supabase } = await requireAdminAccess({
    forbiddenRedirectPath:
      "/admin/products?error=" +
      encodeURIComponent("Acesso negado ao painel admin."),
  });

  const category = normalizeText(formData.get("category"));
  const categoryError = validateLength("Categoria", category, 2, 80);
  if (categoryError) {
    return { success: false, message: categoryError };
  }

  const { error: insertError } = await supabase
    .from("product_categoria")
    .insert({ category });

  if (insertError?.code === "23505") {
    return { success: false, message: "Essa categoria já existe." };
  }

  if (insertError) {
    return { success: false, message: "Nao foi possivel criar a categoria." };
  }

  revalidatePath(ADMIN_PRODUCTS_PATH);
  return { success: true, message: "Categoria criada com sucesso!" };
}

export async function createCategoryJsonAction(categoryName: string) {
  const { supabase } = await requireAdminAccess({
    forbiddenRedirectPath:
      "/admin/products?error=" +
      encodeURIComponent("Acesso negado ao painel admin."),
  });

  const category = categoryName.trim();
  const categoryError = validateLength("Categoria", category, 2, 80);
  if (categoryError) {
    return { success: false, error: categoryError };
  }

  const { data, error: insertError } = await supabase
    .from("product_categoria")
    .insert({ category })
    .select("id, category")
    .single();

  if (insertError?.code === "23505") {
    return { success: false, error: "Essa categoria já existe." };
  }

  if (insertError || !data) {
    return { success: false, error: "Não foi possível criar a categoria." };
  }

  revalidatePath(ADMIN_PRODUCTS_PATH);
  return { success: true, category: data };
}

export async function createFeaturedProductAction(formData: FormData) {
  const { supabase } = await requireAdminAccess({
    forbiddenRedirectPath:
      "/admin/products?error=" +
      encodeURIComponent("Acesso negado ao painel admin."),
  });

  const productId = parseId(formData.get("product_id"));

  if (!productId) {
    return { success: false, message: "Produto inválido para destaque." };
  }

  const { data: existingProduct, error: productError } = await supabase
    .from("products")
    .select("id")
    .eq("id", productId)
    .maybeSingle();

  if (productError || !existingProduct) {
    return { success: false, message: "Produto não encontrado." };
  }

  const { data: currentFeaturedRows, error: currentFeaturedError } = await supabase
    .from("products_featured")
    .select("id")
    .order("display_order", { ascending: true })
    .order("id", { ascending: true });

  if (currentFeaturedError) {
    return { success: false, message: "Não foi possível carregar os destaques atuais." };
  }

  const currentFeatured = (currentFeaturedRows ?? []) as { id: number }[];
  if (currentFeatured.length >= MAX_FEATURED_PRODUCTS) {
    return {
      success: false,
      message:
        "Limite de 10 produtos em destaque atingido. Remova um item antes de adicionar outro.",
    };
  }

  const { data: insertedFeatured, error: insertError } = await supabase
    .from("products_featured")
    .insert({
      product_id: productId,
      display_order: 1,
    })
    .select("id")
    .single();

  if (insertError?.code === "23505") {
    return { success: false, message: "Esse produto já está em destaque." };
  }

  if (insertError?.code === "23514") {
    return {
      success: false,
      message:
        "Limite de 10 produtos em destaque atingido. Remova um item antes de adicionar outro.",
    };
  }

  if (insertError || !insertedFeatured) {
    return { success: false, message: "Não foi possível destacar o produto." };
  }

  const orderedFeaturedIds = [insertedFeatured.id, ...currentFeatured.map((item) => item.id)];

  for (const [index, featuredId] of orderedFeaturedIds.entries()) {
    const { error: updateError } = await supabase
      .from("products_featured")
      .update({ display_order: index + 1 })
      .eq("id", featuredId);

    if (updateError) {
      return { success: false, message: "Não foi possível ajustar a ordem dos destaques." };
    }
  }

  revalidatePath(ADMIN_PRODUCTS_PATH);
  revalidatePath(HOME_PATH);
  return {
    success: true,
    message: "Produto adicionado aos destaques na primeira posição!",
  };
}

export async function reorderFeaturedProductsAction(formData: FormData) {
  const { supabase } = await requireAdminAccess({
    forbiddenRedirectPath:
      "/admin/products?error=" +
      encodeURIComponent("Acesso negado ao painel admin."),
  });

  const orderedIds = parseFeaturedOrderIds(formData.get("ordered_ids"));
  if (!orderedIds) {
    return { success: false, message: "Ordem de destaque inválida." };
  }

  if (orderedIds.length > MAX_FEATURED_PRODUCTS) {
    return { success: false, message: "A lista de destaque não pode ultrapassar 10 itens." };
  }

  const { data: currentFeaturedRows, error: currentFeaturedError } = await supabase
    .from("products_featured")
    .select("id");

  if (currentFeaturedError) {
    return { success: false, message: "Não foi possível validar os destaques." };
  }

  const currentIds = (currentFeaturedRows ?? []).map((item) => Number(item.id));
  if (currentIds.length !== orderedIds.length) {
    return {
      success: false,
      message: "A lista de destaques mudou. Atualize a página e tente novamente.",
    };
  }

  const currentIdSet = new Set(currentIds);
  const hasUnknownId = orderedIds.some((id) => !currentIdSet.has(id));
  if (hasUnknownId) {
    return {
      success: false,
      message: "A lista de destaques mudou. Atualize a página e tente novamente.",
    };
  }

  for (const [index, featuredId] of orderedIds.entries()) {
    const { error: updateError } = await supabase
      .from("products_featured")
      .update({ display_order: index + 1 })
      .eq("id", featuredId);

    if (updateError) {
      return { success: false, message: "Não foi possível salvar a nova ordem." };
    }
  }

  revalidatePath(ADMIN_PRODUCTS_PATH);
  revalidatePath(HOME_PATH);
  return { success: true, message: "Ordem de destaque atualizada!" };
}

export async function updateFeaturedProductOrderAction(formData: FormData) {
  const { supabase } = await requireAdminAccess({
    forbiddenRedirectPath:
      "/admin/products?error=" +
      encodeURIComponent("Acesso negado ao painel admin."),
  });

  const featuredId = parseId(formData.get("id"));
  const displayOrder = parseDisplayOrder(formData.get("display_order"));

  if (!featuredId) {
    return { success: false, message: "Registro de destaque inválido." };
  }

  if (!displayOrder) {
    return { success: false, message: "Ordem de exibição inválida." };
  }

  const { error: updateError } = await supabase
    .from("products_featured")
    .update({ display_order: displayOrder })
    .eq("id", featuredId);

  if (updateError) {
    return { success: false, message: "Não foi possível atualizar a ordem." };
  }

  revalidatePath(ADMIN_PRODUCTS_PATH);
  revalidatePath(HOME_PATH);
  return { success: true, message: "Ordem de destaque atualizada!" };
}

export async function deleteFeaturedProductAction(formData: FormData) {
  const { supabase } = await requireAdminAccess({
    forbiddenRedirectPath:
      "/admin/products?error=" +
      encodeURIComponent("Acesso negado ao painel admin."),
  });

  const featuredId = parseId(formData.get("id"));
  if (!featuredId) {
    return { success: false, message: "Registro de destaque inválido." };
  }

  const { error: deleteError } = await supabase
    .from("products_featured")
    .delete()
    .eq("id", featuredId);

  if (deleteError) {
    return { success: false, message: "Não foi possível remover o destaque." };
  }

  const { data: remainingFeaturedRows, error: remainingFeaturedError } = await supabase
    .from("products_featured")
    .select("id")
    .order("display_order", { ascending: true })
    .order("id", { ascending: true });

  if (remainingFeaturedError) {
    return { success: false, message: "Não foi possível normalizar a ordem dos destaques." };
  }

  const remainingFeatured = (remainingFeaturedRows ?? []) as { id: number }[];
  for (const [index, item] of remainingFeatured.entries()) {
    const { error: updateError } = await supabase
      .from("products_featured")
      .update({ display_order: index + 1 })
      .eq("id", item.id);

    if (updateError) {
      return { success: false, message: "Não foi possível normalizar a ordem dos destaques." };
    }
  }

  revalidatePath(ADMIN_PRODUCTS_PATH);
  revalidatePath(HOME_PATH);
  return { success: true, message: "Produto removido dos destaques." };
}
