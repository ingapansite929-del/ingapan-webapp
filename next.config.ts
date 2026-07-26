import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // O catálogo legado possui origens externas heterogêneas. Mantemos essas
    // imagens fora do otimizador até a centralização no Storage, sem liberar
    // padrões remotos amplos no endpoint /_next/image.
    unoptimized: true,
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 7, // 7 dias
  },
};

export default nextConfig;
