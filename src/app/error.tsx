"use client";

import { useEffect } from "react";
import RouteErrorState from "@/components/feedback/RouteErrorState";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Erro de rota", { digest: error.digest, message: error.message });
  }, [error]);

  return <RouteErrorState reset={reset} />;
}
