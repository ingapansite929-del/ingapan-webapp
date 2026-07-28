import { Skeleton } from "@/components/ui/skeleton";

export function ProductsFiltersSkeleton() {
  return (
    <div className="mb-7 space-y-4" aria-hidden="true">
      <div className="rounded-2xl border bg-card p-4 shadow-[var(--shadow-soft)]">
        <div className="grid gap-4 lg:grid-cols-[minmax(240px,1.4fr)_minmax(180px,1fr)_minmax(180px,1fr)_minmax(180px,1fr)_auto]">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-9 w-full" />
            </div>
          ))}
          <div className="flex items-end">
            <Skeleton className="h-9 w-28" />
          </div>
        </div>
      </div>
      <Skeleton className="h-5 w-44" />
    </div>
  );
}

export function ProductsResultsSkeleton() {
  return (
    <div
      className="space-y-8"
      role="status"
      aria-label="Carregando produtos"
      aria-live="polite"
    >
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-2xl border bg-card"
            aria-hidden="true"
          >
            <Skeleton className="aspect-[4/3] w-full rounded-none" />
            <div className="space-y-4 p-5">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-6 w-5/6" />
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-9 w-full" />
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border bg-card p-4 sm:flex-row">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-9 w-64 max-w-full" />
      </div>
      <span className="sr-only">Carregando produtos...</span>
    </div>
  );
}

export default function ProductsCatalogSkeleton() {
  return (
    <>
      <ProductsFiltersSkeleton />
      <ProductsResultsSkeleton />
    </>
  );
}
