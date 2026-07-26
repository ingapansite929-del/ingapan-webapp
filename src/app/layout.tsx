import type { Metadata } from "next";
import { Montserrat, Outfit } from "next/font/google";
import "./globals.css";
import AppProviders from "@/components/AppProviders";
import { getSiteUrlObject } from "@/lib/seo";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: getSiteUrlObject(),
  title: {
    default: "Ingapan | Distribuidora de Produtos Alimentícios",
    template: "%s | Ingapan",
  },
  description:
    "Distribuidora de produtos alimentícios para empresas. Qualidade, variedade e confiança para abastecer seu negócio com a Ingapan.",
  keywords: [
    "distribuidora de alimentos",
    "fornecedor de alimentos",
    "atacado alimentício",
    "catálogo de produtos alimentícios",
    "Ingapan",
  ],
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Ingapan | Distribuidora de Produtos Alimentícios",
    description:
      "Qualidade, variedade e confiança na distribuição de alimentos para o seu negócio.",
    type: "website",
    url: "/",
    siteName: "Ingapan",
    locale: "pt_BR",
    images: [
      {
        url: "/images/LOGO.png",
        alt: "Logo da Ingapan",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ingapan | Distribuidora de Produtos Alimentícios",
    description:
      "Qualidade, variedade e confiança na distribuição de alimentos para o seu negócio.",
    images: ["/images/LOGO.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${outfit.variable} ${montserrat.variable}`}
    >
      <body className="antialiased">
        <a
          href="#conteudo-principal"
          className="sr-only z-[70] rounded-md bg-brand-yellow px-4 py-2 font-semibold text-brand-dark focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Ir para o conteúdo principal
        </a>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
