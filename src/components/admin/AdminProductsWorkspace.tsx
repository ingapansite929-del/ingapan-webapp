"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Edit3,
  Eye,
  MoreHorizontal,
  PackagePlus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useState, useTransition } from "react";
import {
  createProductAction,
  deleteProductAction,
  updateProductAction,
} from "@/app/admin/products/actions";
import ProductImage from "@/components/products/ProductImage";
import { useToast } from "@/components/Toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { getPaginationItems } from "@/features/products/catalog";
import {
  getProductCategory,
  getProductSubcategory,
  type ProductCategoryRelation,
  type ProductRecord,
  type ProductSubcategoryRelation,
} from "@/features/products/types";

interface AdminProductsWorkspaceProps {
  products: ProductRecord[];
  categories: ProductCategoryRelation[];
  subcategories: ProductSubcategoryRelation[];
  total: number;
  currentPage: number;
  pageCount: number;
  pageSize: number;
  currentNome: string;
  currentCategoria: string;
  currentSubcategoria: string;
}

type FieldErrors = Record<string, string[] | undefined>;

function buildAdminProductsUrl({
  page = 1,
  nome = "",
  categoria = "",
  subcategoria = "",
}: {
  page?: number;
  nome?: string;
  categoria?: string;
  subcategoria?: string;
}) {
  const params = new URLSearchParams();
  if (nome) params.set("nome", nome);
  if (categoria) params.set("categoria_id", categoria);
  if (subcategoria) params.set("subcategoria_id", subcategoria);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `/admin/products?${query}` : "/admin/products";
}

function FieldError({
  name,
  errors,
}: {
  name: string;
  errors: FieldErrors;
}) {
  const message = errors[name]?.[0];
  return message ? (
    <p className="text-xs font-medium text-destructive">{message}</p>
  ) : null;
}

function ProductForm({
  product,
  categories,
  subcategories,
  onSuccess,
}: {
  product: ProductRecord | null;
  categories: ProductCategoryRelation[];
  subcategories: ProductSubcategoryRelation[];
  onSuccess: () => void;
}) {
  const router = useRouter();
  const { addToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [imagePreview, setImagePreview] = useState(product?.image_url ?? "");

  const submit = (formData: FormData) => {
    startTransition(async () => {
      const result = product
        ? await updateProductAction(formData)
        : await createProductAction(formData);

      if (!result.success) {
        setFieldErrors("fieldErrors" in result ? result.fieldErrors ?? {} : {});
        addToast(result.message, "error");
        return;
      }

      setFieldErrors({});
      addToast(result.message, "success");
      router.refresh();
      onSuccess();
    });
  };

  return (
    <form action={submit} className="space-y-5 px-4 pb-6">
      {product ? <input type="hidden" name="id" value={product.id} /> : null}

      <div className="space-y-2">
        <label htmlFor="product-name" className="text-sm font-medium">
          Nome do produto
        </label>
        <Input
          id="product-name"
          name="nome"
          defaultValue={product?.nome ?? ""}
          minLength={2}
          maxLength={120}
          required
          aria-invalid={Boolean(fieldErrors.nome)}
          placeholder="Ex.: Pão de queijo tradicional"
        />
        <FieldError name="nome" errors={fieldErrors} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="product-category" className="text-sm font-medium">
            Categoria
          </label>
          <select
            id="product-category"
            name="id_categoria"
            defaultValue={product?.id_categoria ?? ""}
            required
            aria-invalid={Boolean(fieldErrors.id_categoria)}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            <option value="" disabled>
              Selecione
            </option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.category}
              </option>
            ))}
          </select>
          <FieldError name="id_categoria" errors={fieldErrors} />
        </div>

        <div className="space-y-2">
          <label htmlFor="product-subcategory" className="text-sm font-medium">
            Subcategoria
          </label>
          <select
            id="product-subcategory"
            name="id_subcategoria"
            defaultValue={product?.id_subcategoria ?? ""}
            required
            aria-invalid={Boolean(fieldErrors.id_subcategoria)}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            <option value="" disabled>
              Selecione
            </option>
            {subcategories.map((subcategory) => (
              <option key={subcategory.id} value={subcategory.id}>
                {subcategory.subcategoria}
              </option>
            ))}
          </select>
          <FieldError name="id_subcategoria" errors={fieldErrors} />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="product-image" className="text-sm font-medium">
          URL da imagem <span className="text-muted-foreground">(opcional)</span>
        </label>
        <Input
          id="product-image"
          name="image_url"
          defaultValue={product?.image_url ?? ""}
          onChange={(event) => setImagePreview(event.target.value)}
          aria-invalid={Boolean(fieldErrors.image_url)}
          placeholder="/images/produto.jpg ou https://..."
        />
        <FieldError name="image_url" errors={fieldErrors} />
        <div className="relative aspect-[16/7] overflow-hidden rounded-xl border bg-muted">
          <ProductImage
            src={imagePreview}
            alt="Pré-visualização do produto"
            fill
            className="object-contain"
            sizes="640px"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="product-description" className="text-sm font-medium">
          Descrição <span className="text-muted-foreground">(opcional)</span>
        </label>
        <Textarea
          id="product-description"
          name="descricao"
          defaultValue={product?.descricao ?? ""}
          maxLength={2000}
          rows={5}
          aria-invalid={Boolean(fieldErrors.descricao)}
          placeholder="Informações úteis para o cliente."
        />
        <FieldError name="descricao" errors={fieldErrors} />
      </div>

      <Button type="submit" className="min-w-40" disabled={isPending}>
        {isPending ? <Spinner /> : null}
        {isPending
          ? "Salvando..."
          : product
            ? "Salvar alterações"
            : "Criar produto"}
      </Button>
    </form>
  );
}

export default function AdminProductsWorkspace({
  products,
  categories,
  subcategories,
  total,
  currentPage,
  pageCount,
  pageSize,
  currentNome,
  currentCategoria,
  currentSubcategoria,
}: AdminProductsWorkspaceProps) {
  const router = useRouter();
  const { addToast } = useToast();
  const [isFiltering, startFiltering] = useTransition();
  const [isDeleting, startDeleting] = useTransition();
  const [editingProduct, setEditingProduct] = useState<ProductRecord | null>(null);
  const [creating, setCreating] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState<ProductRecord | null>(
    null
  );

  const submitFilters = (formData: FormData) => {
    const nome = String(formData.get("nome") ?? "").trim();
    const categoria = String(formData.get("categoria_id") ?? "");
    const subcategoria = String(formData.get("subcategoria_id") ?? "");
    startFiltering(() =>
      router.replace(
        buildAdminProductsUrl({ nome, categoria, subcategoria }),
        { scroll: false }
      )
    );
  };

  const confirmDelete = () => {
    if (!deletingProduct) return;
    const formData = new FormData();
    formData.set("id", String(deletingProduct.id));
    startDeleting(async () => {
      const result = await deleteProductAction(formData);
      addToast(result.message, result.success ? "success" : "error");
      if (result.success) {
        setDeletingProduct(null);
        router.refresh();
      }
    });
  };

  const firstResult = total ? (currentPage - 1) * pageSize + 1 : 0;
  const lastResult = Math.min(currentPage * pageSize, total);
  const pagination = getPaginationItems(currentPage, pageCount);
  const pageUrl = (page: number) =>
    buildAdminProductsUrl({
      page,
      nome: currentNome,
      categoria: currentCategoria,
      subcategoria: currentSubcategoria,
    });

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <Badge variant="secondary">Gestão de catálogo</Badge>
          <h1 className="mt-3 text-3xl font-bold">Produtos</h1>
          <p className="mt-1 text-muted-foreground">
            Cadastre, encontre e mantenha o catálogo da IngaPan.
          </p>
        </div>
        <Button variant="secondary" onClick={() => setCreating(true)}>
          <PackagePlus />
          Novo produto
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Catálogo</CardTitle>
          <CardDescription>
            {total} {total === 1 ? "produto cadastrado" : "produtos cadastrados"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <form
            action={submitFilters}
            className="grid gap-3 md:grid-cols-[minmax(220px,1fr)_minmax(170px,.7fr)_minmax(170px,.7fr)_auto_auto]"
          >
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                name="nome"
                defaultValue={currentNome}
                placeholder="Buscar pelo nome"
                className="pl-9"
                aria-label="Buscar produto pelo nome"
              />
            </div>
            <select
              name="categoria_id"
              defaultValue={currentCategoria}
              aria-label="Filtrar por categoria"
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">Todas as categorias</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.category}
                </option>
              ))}
            </select>
            <select
              name="subcategoria_id"
              defaultValue={currentSubcategoria}
              aria-label="Filtrar por subcategoria"
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">Todas as subcategorias</option>
              {subcategories.map((subcategory) => (
                <option key={subcategory.id} value={subcategory.id}>
                  {subcategory.subcategoria}
                </option>
              ))}
            </select>
            <Button type="submit" disabled={isFiltering}>
              {isFiltering ? <Spinner /> : <Search />}
              Filtrar
            </Button>
            {currentNome || currentCategoria || currentSubcategoria ? (
              <Button asChild variant="ghost" size="icon">
                <Link href="/admin/products" aria-label="Limpar filtros">
                  <X />
                </Link>
              </Button>
            ) : null}
          </form>

          {products.length === 0 ? (
            <Empty className="min-h-72 border">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <PackagePlus />
                </EmptyMedia>
                <EmptyTitle>Nenhum produto encontrado</EmptyTitle>
                <EmptyDescription>
                  Ajuste os filtros ou cadastre um novo produto.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <>
              <div className="hidden overflow-hidden rounded-xl border md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">Imagem</TableHead>
                      <TableHead className="w-20">Código</TableHead>
                      <TableHead>Produto</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Subcategoria</TableHead>
                      <TableHead className="w-14">
                        <span className="sr-only">Ações</span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => {
                      const category = getProductCategory(product);
                      const subcategory = getProductSubcategory(product);
                      return (
                        <TableRow key={product.id}>
                          <TableCell>
                            <div className="relative size-11 overflow-hidden rounded-md bg-muted">
                              <ProductImage
                                src={product.image_url}
                                alt={product.nome}
                                fill
                                className="object-cover"
                                sizes="44px"
                              />
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            #{product.id}
                          </TableCell>
                          <TableCell className="max-w-72 font-medium">
                            <span className="line-clamp-2">{product.nome}</span>
                          </TableCell>
                          <TableCell>{category?.category ?? "—"}</TableCell>
                          <TableCell>
                            {subcategory?.subcategoria ?? "—"}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  aria-label={`Ações de ${product.nome}`}
                                >
                                  <MoreHorizontal />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                <DropdownMenuItem asChild>
                                  <Link href={`/produtos/${product.id}`}>
                                    <Eye />
                                    Visualizar
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onSelect={() => setEditingProduct(product)}
                                >
                                  <Edit3 />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  variant="destructive"
                                  onSelect={() => setDeletingProduct(product)}
                                >
                                  <Trash2 />
                                  Excluir
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              <div className="grid gap-3 md:hidden">
                {products.map((product) => {
                  const category = getProductCategory(product);
                  const subcategory = getProductSubcategory(product);
                  return (
                    <article
                      key={product.id}
                      className="flex gap-3 rounded-xl border p-3"
                    >
                      <div className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-muted">
                        <ProductImage
                          src={product.image_url}
                          alt={product.nome}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-muted-foreground">
                          #{product.id}
                        </p>
                        <h2 className="line-clamp-2 font-semibold">
                          {product.nome}
                        </h2>
                        <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                          {category?.category ?? "Sem categoria"} ·{" "}
                          {subcategory?.subcategoria ?? "Sem subcategoria"}
                        </p>
                        <div className="mt-2 flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingProduct(product)}
                          >
                            <Edit3 />
                            Editar
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setDeletingProduct(product)}
                            aria-label={`Excluir ${product.nome}`}
                          >
                            <Trash2 className="text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </>
          )}

          {total > 0 ? (
            <div className="flex flex-col items-center justify-between gap-4 border-t pt-5 sm:flex-row">
              <p className="text-sm text-muted-foreground">
                {firstResult}–{lastResult} de {total}
              </p>
              <Pagination className="mx-0 w-auto">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href={pageUrl(Math.max(1, currentPage - 1))}
                      className={
                        currentPage === 1
                          ? "pointer-events-none opacity-40"
                          : ""
                      }
                    />
                  </PaginationItem>
                  {pagination.map((item, index) =>
                    item === "ellipsis" ? (
                      <PaginationItem key={`ellipsis-${index}`}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    ) : (
                      <PaginationItem key={item}>
                        <PaginationLink
                          href={pageUrl(item)}
                          isActive={item === currentPage}
                        >
                          {item}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  )}
                  <PaginationItem>
                    <PaginationNext
                      href={pageUrl(Math.min(pageCount, currentPage + 1))}
                      className={
                        currentPage === pageCount
                          ? "pointer-events-none opacity-40"
                          : ""
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Sheet open={creating} onOpenChange={setCreating}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
          <SheetHeader>
            <SheetTitle>Novo produto</SheetTitle>
            <SheetDescription>
              Cadastre as informações essenciais. Imagem e descrição são
              opcionais.
            </SheetDescription>
          </SheetHeader>
          <ProductForm
            product={null}
            categories={categories}
            subcategories={subcategories}
            onSuccess={() => setCreating(false)}
          />
        </SheetContent>
      </Sheet>

      <Sheet
        open={Boolean(editingProduct)}
        onOpenChange={(open) => {
          if (!open) setEditingProduct(null);
        }}
      >
        <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
          <SheetHeader>
            <SheetTitle>Editar produto</SheetTitle>
            <SheetDescription>
              Atualize os dados sem alterar o código do produto.
            </SheetDescription>
          </SheetHeader>
          {editingProduct ? (
            <ProductForm
              key={editingProduct.id}
              product={editingProduct}
              categories={categories}
              subcategories={subcategories}
              onSuccess={() => setEditingProduct(null)}
            />
          ) : null}
        </SheetContent>
      </Sheet>

      <AlertDialog
        open={Boolean(deletingProduct)}
        onOpenChange={(open) => {
          if (!open && !isDeleting) setDeletingProduct(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir produto?</AlertDialogTitle>
            <AlertDialogDescription>
              O produto <strong>{deletingProduct?.nome}</strong> será removido
              do catálogo. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                confirmDelete();
              }}
              disabled={isDeleting}
              className="min-w-32 bg-destructive text-white hover:bg-destructive/90"
            >
              {isDeleting ? <Spinner /> : <Trash2 />}
              {isDeleting ? "Excluindo..." : "Excluir produto"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
