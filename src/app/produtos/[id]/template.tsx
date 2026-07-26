"use client";

import { useLayoutEffect, type ReactNode } from "react";

export default function ProductDetailTemplate({
  children,
}: {
  children: ReactNode;
}) {
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, []);

  return children;
}
