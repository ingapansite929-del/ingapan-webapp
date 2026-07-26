import Link from "next/link";
import { PackageSearch } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="flex min-h-[75vh] items-center justify-center px-4 pb-16 pt-32">
        <div className="max-w-lg text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground">
            <PackageSearch aria-hidden="true" />
          </div>
          <p className="mt-6 text-sm font-semibold uppercase tracking-[0.18em] text-brand-red">
            Erro 404
          </p>
          <h1 className="mt-2 text-3xl font-bold">Página não encontrada</h1>
          <p className="mt-3 text-muted-foreground">
            O endereço pode ter mudado ou o conteúdo não está mais disponível.
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild>
              <Link href="/">Voltar ao início</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/produtos">Explorar produtos</Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
