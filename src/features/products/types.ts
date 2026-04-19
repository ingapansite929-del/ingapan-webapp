export interface ProductCategoryRelation {
  id: number;
  category: string;
}

export interface ProductRecord {
  id: number;
  nome: string;
  id_categoria: number;
  descricao: string;
  image_url: string;
  product_categoria?: ProductCategoryRelation[] | ProductCategoryRelation | null;
}

export function getProductCategory(
  product: ProductRecord
): ProductCategoryRelation | null {
  if (!product.product_categoria) return null;
  return Array.isArray(product.product_categoria)
    ? (product.product_categoria[0] ?? null)
    : product.product_categoria;
}
