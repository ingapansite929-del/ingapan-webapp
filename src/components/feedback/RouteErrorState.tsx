"use client";

import Link from "next/link";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RouteErrorStateProps {
  title?: string;
  description?: string;
  reset: () => void;
  backHref?: string;
  backLabel?: string;
}

export default function RouteErrorState({
  title = "Não foi possível carregar esta página",
  description = "Ocorreu uma falha inesperada. Você pode tentar novamente sem perder a navegação.",
  reset,
  backHref = "/",
  backLabel = "Voltar ao início",
}: RouteErrorStateProps) {
  return (
    <main className="flex min-h-[70vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg rounded-3xl border bg-card p-8 text-center shadow-[var(--shadow-raised)]">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertTriangle aria-hidden="true" />
        </div>
        <h1 className="mt-5 text-2xl font-bold">{title}</h1>
        <p className="mt-2 text-muted-foreground">{description}</p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Button onClick={reset}>
            <RotateCcw />
            Tentar novamente
          </Button>
          <Button asChild variant="outline">
            <Link href={backHref}>{backLabel}</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
