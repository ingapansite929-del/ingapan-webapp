"use client";

import Image, { type ImageProps } from "next/image";
import { ImageOff } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { getSafeImageUrl } from "@/features/products/types";

interface ProductImageProps
  extends Omit<ImageProps, "src" | "alt" | "onError"> {
  src: string | null | undefined;
  alt: string;
  fallbackClassName?: string;
}

export default function ProductImage({
  src,
  alt,
  className,
  fallbackClassName,
  ...props
}: ProductImageProps) {
  const safeSrc = getSafeImageUrl(src);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const failed = safeSrc !== null && failedSrc === safeSrc;

  if (!safeSrc || failed) {
    return (
      <div
        role="img"
        aria-label={`Imagem indisponível para ${alt}`}
        className={cn(
          "flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-muted to-background text-muted-foreground",
          fallbackClassName
        )}
      >
        <ImageOff className="size-7" aria-hidden="true" />
        <span className="px-3 text-center text-xs font-medium">
          Imagem indisponível
        </span>
      </div>
    );
  }

  return (
    <Image
      src={safeSrc}
      alt={alt}
      className={className}
      onError={() => setFailedSrc(safeSrc)}
      {...props}
    />
  );
}
