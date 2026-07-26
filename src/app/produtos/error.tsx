"use client";

import RouteErrorState from "@/components/feedback/RouteErrorState";

export default function ProductsError({ reset }: { reset: () => void }) {
  return (
    <RouteErrorState
      reset={reset}
      title="Não foi possível carregar o catálogo"
      description="A busca de produtos falhou. Tente novamente em alguns instantes."
      backHref="/"
      backLabel="Voltar ao site"
    />
  );
}
