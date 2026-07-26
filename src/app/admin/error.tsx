"use client";

import RouteErrorState from "@/components/feedback/RouteErrorState";

export default function AdminError({ reset }: { reset: () => void }) {
  return (
    <RouteErrorState
      reset={reset}
      title="Não foi possível carregar o painel"
      description="A operação administrativa falhou. Nenhuma alteração adicional foi realizada."
      backHref="/dashboard"
      backLabel="Voltar à visão geral"
    />
  );
}
