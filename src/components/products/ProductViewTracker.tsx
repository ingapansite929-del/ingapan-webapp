"use client";

import { useEffect } from "react";

interface ProductViewTrackerProps {
  productId: number;
}

const TRACK_VIEW_DELAY_MS = 3000;

export default function ProductViewTracker({ productId }: ProductViewTrackerProps) {
  useEffect(() => {
    const controller = new AbortController();

    const timeoutId = window.setTimeout(() => {
      void fetch("/api/track-view", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId }),
        signal: controller.signal,
        keepalive: true,
        cache: "no-store",
      });
    }, TRACK_VIEW_DELAY_MS);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [productId]);

  return null;
}

