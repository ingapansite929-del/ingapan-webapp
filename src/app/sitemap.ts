import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/seo";

interface ProductSitemapRow {
  id: number;
  updated_at: string | null;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/produtos`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("id, updated_at")
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Failed to load product URLs for sitemap generation:", error);
    return staticRoutes;
  }

  const productRoutes: MetadataRoute.Sitemap = (data as ProductSitemapRow[]).map(
    (product) => ({
      url: `${siteUrl}/produtos/${product.id}`,
      lastModified: product.updated_at ? new Date(product.updated_at) : now,
      changeFrequency: "weekly",
      priority: 0.8,
    })
  );

  return [...staticRoutes, ...productRoutes];
}
