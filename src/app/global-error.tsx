"use client";

import { useEffect } from "react";
import RouteErrorState from "@/components/feedback/RouteErrorState";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Erro global", { digest: error.digest, message: error.message });
  }, [error]);

  return (
    <html lang="pt-BR">
      <body>
        <RouteErrorState
          reset={reset}
          title="A IngaPan encontrou um problema"
          description="Não conseguimos exibir a aplicação agora. Tente recarregar ou volte ao início."
        />
      </body>
    </html>
  );
}
