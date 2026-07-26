import Link from "next/link";
import { redirect } from "next/navigation";
import {
  CreateFeaturedProductForm,
  FeaturedProductsReorderForm,
} from "@/components/admin/ProductForms";
import AdminProductsWorkspace from "@/components/admin/AdminProductsWorkspace";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  type ProductCategoryOption,
  type ProductSubcategoryOption,
} from "@/features/products/catalog";
import { PRODUCT_SELECT } from "@/features/products/data";
import {
  getProductCategory,
  parseProductRecords,
  type ProductRecord,
} from "@/features/products/types";
import { requireAdminAccess } from "@/lib/auth/admin";

type SearchParams = Promise<{
  tab?: string | string[];
  page?: string | string[];
  nome?: string | string[];
  categoria_id?: string | string[];
  subcategoria_id?: string | string[];
}>;

interface AdminProductsPageProps {
  searchParams: SearchParams;
}

interface FeaturedProduct {
  id: number;
  product_id: number;
  display_order: number;
}

type AdminProductsTab = "catalogo" | "destaques";
const PAGE_SIZE = 15;

function getSingleValue(value: string | string[] | undefined): string {
  if (!value) return "";
  return Array.isArray(value) ? value[0] ?? "" : value;
}

function parsePositiveInt(value: string | string[] | undefined): number {
  const parsed = Number(getSingleValue(value));
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
}

function getActiveTab(value: string | string[] | undefined): AdminProductsTab {
  return getSingleValue(value) === "destaques" ? "destaques" : "catalogo";
}

export default async function AdminProductsPage({
  searchParams,
}: AdminProductsPageProps) {
  const params = await searchParams;
  const activeTab = getActiveTab(params.tab);
  const page = parsePositiveInt(params.page);
  const nome = getSingleValue(params.nome).trim();
  const categoriaId = getSingleValue(params.categoria_id).trim();
  const subcategoriaId = getSingleValue(params.subcategoria_id).trim();
  const { supabase } = await requireAdminAccess();

  if (activeTab === "catalogo") {
    const categoriesRequest = supabase
      .from("product_categoria")
      .select("id, category")
      .order("category");
    const subcategoriesRequest = supabase
      .from("product_subcategory")
      .select("id, subcategoria")
      .order("subcategoria");

    let productsRequest = supabase
      .from("products")
      .select(PRODUCT_SELECT, { count: "exact" })
      .order("id", { ascending: false });

    if (nome) productsRequest = productsRequest.ilike("nome", `%${nome}%`);
    const parsedCategoryId = Number(categoriaId);
    if (Number.isInteger(parsedCategoryId) && parsedCategoryId > 0) {
      productsRequest = productsRequest.eq("id_categoria", parsedCategoryId);
    }
    const parsedSubcategoryId = Number(subcategoriaId);
    if (Number.isInteger(parsedSubcategoryId) && parsedSubcategoryId > 0) {
      productsRequest = productsRequest.eq(
        "id_subcategoria",
        parsedSubcategoryId
      );
    }

    const from = (page - 1) * PAGE_SIZE;
    productsRequest = productsRequest.range(from, from + PAGE_SIZE - 1);

    const [categoriesResult, subcategoriesResult, productsResult] =
      await Promise.all([
        categoriesRequest,
        subcategoriesRequest,
        productsRequest,
      ]);

    if (categoriesResult.error) throw new Error(categoriesResult.error.message);
    if (subcategoriesResult.error) {
      throw new Error(subcategoriesResult.error.message);
    }
    if (productsResult.error) throw new Error(productsResult.error.message);

    const total = productsResult.count ?? 0;
    const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
    if (total > 0 && page > pageCount) {
      const query = new URLSearchParams();
      if (nome) query.set("nome", nome);
      if (categoriaId) query.set("categoria_id", categoriaId);
      if (subcategoriaId) query.set("subcategoria_id", subcategoriaId);
      if (pageCount > 1) query.set("page", String(pageCount));
      redirect(`/admin/products${query.size ? `?${query}` : ""}`);
    }

    return (
      <section className="space-y-5">
        <Tabs value="catalogo">
          <TabsList>
            <TabsTrigger value="catalogo" asChild>
              <Link href="/admin/products">Catálogo</Link>
            </TabsTrigger>
            <TabsTrigger value="destaques" asChild>
              <Link href="/admin/products?tab=destaques">Destaques</Link>
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <AdminProductsWorkspace
          products={parseProductRecords(productsResult.data)}
          categories={
            (categoriesResult.data as ProductCategoryOption[] | null) ?? []
          }
          subcategories={
            (subcategoriesResult.data as ProductSubcategoryOption[] | null) ??
            []
          }
          total={total}
          currentPage={page}
          pageCount={pageCount}
          pageSize={PAGE_SIZE}
          currentNome={nome}
          currentCategoria={categoriaId}
          currentSubcategoria={subcategoriaId}
        />
      </section>
    );
  }

  const { data: featuredData, error: featuredError } = await supabase
    .from("products_featured")
    .select("id, product_id, display_order")
    .order("display_order", { ascending: true })
    .order("id", { ascending: true });

  if (featuredError) throw new Error(featuredError.message);
  const featuredProducts = (featuredData ?? []) as FeaturedProduct[];
  const featuredProductIds = featuredProducts.map((item) => item.product_id);
  let featuredCatalog: ProductRecord[] = [];

  if (featuredProductIds.length > 0) {
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .in("id", featuredProductIds);
    if (error) throw new Error(error.message);
    featuredCatalog = parseProductRecords(data);
  }

  const byId = new Map(featuredCatalog.map((product) => [product.id, product]));
  const featuredItems = featuredProducts.map((featured) => {
    const product = byId.get(featured.product_id);
    return {
      featuredId: featured.id,
      productId: featured.product_id,
      productName: product?.nome ?? "Produto removido",
      categoryName: product
        ? getProductCategory(product)?.category ?? "Sem categoria"
        : "Produto indisponível",
      imageUrl: product?.image_url ?? null,
      isMissing: !product,
    };
  });

  return (
    <section className="space-y-6">
      <Tabs value="destaques">
        <TabsList>
          <TabsTrigger value="catalogo" asChild>
            <Link href="/admin/products">Catálogo</Link>
          </TabsTrigger>
          <TabsTrigger value="destaques" asChild>
            <Link href="/admin/products?tab=destaques">Destaques</Link>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div>
        <Badge variant="secondary">Página inicial</Badge>
        <h1 className="mt-3 text-3xl font-bold">Produtos em destaque</h1>
        <p className="mt-1 text-muted-foreground">
          Escolha e ordene até 10 produtos do carrossel da página inicial.
        </p>
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Novo destaque</CardTitle>
          </CardHeader>
          <CardContent>
            <CreateFeaturedProductForm
              featuredProductIds={featuredProductIds}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Ordem de exibição</CardTitle>
          </CardHeader>
          <CardContent>
            {featuredItems.length ? (
              <FeaturedProductsReorderForm
                key={featuredItems.map((item) => item.featuredId).join("-")}
                items={featuredItems}
              />
            ) : (
              <Alert>
                <AlertTitle>Nenhum destaque configurado</AlertTitle>
                <AlertDescription>
                  Adicione um produto para começar a montar o carrossel.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
