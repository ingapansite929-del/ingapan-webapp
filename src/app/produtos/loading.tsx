import Header from "@/components/Header";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProductsLoading() {
  return (
    <>
      <Header />
      <main className="min-h-screen pb-16 pt-28">
        <div className="mx-auto max-w-[90rem] space-y-8 px-4 sm:px-6 lg:px-10">
          <div className="space-y-3 py-8">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-12 max-w-2xl" />
            <Skeleton className="h-5 max-w-xl" />
          </div>
          <Skeleton className="h-28 rounded-2xl" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="space-y-4 rounded-2xl border bg-card p-4">
                <Skeleton className="aspect-[4/3] w-full rounded-xl" />
                <Skeleton className="h-5 w-4/5" />
                <Skeleton className="h-4 w-2/5" />
                <Skeleton className="h-9 w-full" />
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
