"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminAccess } from "@/lib/auth/admin";

const ADMIN_PRODUCTS_PATH = "/admin/products";

type ProductInput = {
  id?: number;
  nome: string;
  categoria: string;
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

function parseProductInput(formData: FormData, includeId = false): {
  data: ProductInput | null;
  error: string | null;
} {
  const nome = normalizeText(formData.get("nome"));
  const categoria = normalizeText(formData.get("categoria"));
  const descricao = normalizeText(formData.get("descricao"));
  const imageUrl = normalizeText(formData.get("image_url"));

  const nomeError = validateLength("Nome", nome, 2, 120);
  if (nomeError) return { data: null, error: nomeError };

  const categoriaError = validateLength("Categoria", categoria, 2, 80);
  if (categoriaError) return { data: null, error: categoriaError };

  const descricaoError = validateLength("Descrição", descricao, 5, 2000);
  if (descricaoError) return { data: null, error: descricaoError };

  const imageUrlError = validateImageUrl(imageUrl);
  if (imageUrlError) return { data: null, error: imageUrlError };

  if (!includeId) {
    return {
      data: {
        nome,
        categoria,
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
      categoria,
      descricao,
      imageUrl,
    },
    error: null,
  };
}

function redirectWithError(errorMessage: string): never {
  redirect(
    `${ADMIN_PRODUCTS_PATH}?error=${encodeURIComponent(errorMessage)}`
  );
}

function redirectWithStatus(status: string): never {
  redirect(`${ADMIN_PRODUCTS_PATH}?status=${encodeURIComponent(status)}`);
}

export async function createProductAction(formData: FormData) {
  const { supabase } = await requireAdminAccess({
    forbiddenRedirectPath:
      "/admin/products?error=" +
      encodeURIComponent("Acesso negado ao painel admin."),
  });

  const { data, error } = parseProductInput(formData);
  if (!data || error) {
    redirectWithError(error ?? "Dados do produto inválidos.");
  }

  const { error: insertError } = await supabase.from("products").insert({
    nome: data.nome,
    categoria: data.categoria,
    descricao: data.descricao,
    image_url: data.imageUrl,
  });

  if (insertError) {
    redirectWithError("Nao foi possivel criar o produto.");
  }

  revalidatePath(ADMIN_PRODUCTS_PATH);
  redirectWithStatus("created");
}

export async function updateProductAction(formData: FormData) {
  const { supabase } = await requireAdminAccess({
    forbiddenRedirectPath:
      "/admin/products?error=" +
      encodeURIComponent("Acesso negado ao painel admin."),
  });

  const { data, error } = parseProductInput(formData, true);
  if (!data || error || !data.id) {
    redirectWithError(error ?? "Dados para atualização inválidos.");
  }

  const { error: updateError } = await supabase
    .from("products")
    .update({
      nome: data.nome,
      categoria: data.categoria,
      descricao: data.descricao,
      image_url: data.imageUrl,
    })
    .eq("id", data.id);

  if (updateError) {
    redirectWithError("Nao foi possivel atualizar o produto.");
  }

  revalidatePath(ADMIN_PRODUCTS_PATH);
  redirectWithStatus("updated");
}

export async function deleteProductAction(formData: FormData) {
  const { supabase } = await requireAdminAccess({
    forbiddenRedirectPath:
      "/admin/products?error=" +
      encodeURIComponent("Acesso negado ao painel admin."),
  });

  const id = parseId(formData.get("id"));
  if (!id) {
    redirectWithError("ID inválido para remoção.");
  }

  const { error: deleteError } = await supabase
    .from("products")
    .delete()
    .eq("id", id);

  if (deleteError) {
    redirectWithError("Nao foi possivel excluir o produto.");
  }

  revalidatePath(ADMIN_PRODUCTS_PATH);
  redirectWithStatus("deleted");
}
