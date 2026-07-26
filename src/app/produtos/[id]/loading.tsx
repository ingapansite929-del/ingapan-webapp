import Header from "@/components/Header";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProductDetailLoading() {
  return (
    <>
      <Header />
      <main
        className="min-h-screen bg-gradient-to-b from-brand-light/30 via-white to-white pt-24 md:pt-28"
        aria-label="Carregando produto"
      >
        <section className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
          <Skeleton className="mb-6 h-5 w-64" />
          <article className="overflow-hidden rounded-3xl border bg-card shadow-xl shadow-black/5">
            <div className="grid lg:grid-cols-2">
              <Skeleton className="min-h-[320px] rounded-none sm:min-h-[420px]" />
              <div className="space-y-6 p-6 sm:p-8 lg:p-10">
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-28 rounded-full" />
                  <Skeleton className="h-6 w-24 rounded-full" />
                </div>
                <Skeleton className="h-10 w-5/6" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-4/5" />
                <div className="grid gap-3 sm:grid-cols-3">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <Skeleton key={index} className="h-24 rounded-xl" />
                  ))}
                </div>
                <Skeleton className="h-10 w-52" />
              </div>
            </div>
          </article>
        </section>
        <span className="sr-only">Carregando detalhes do produto...</span>
      </main>
    </>
  );
}
