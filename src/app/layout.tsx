import type { Metadata } from "next";
import { Montserrat, Outfit } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/CartContext";
import CartSidebar from "@/components/CartSidebar";
import { ToastProvider } from "@/components/Toast";

const outfit = Outfit({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ingapan | Distribuidora de Produtos Alimentícios",
  description:
    "Somos a Ingapan, sua parceira em distribuição de produtos alimentícios. Qualidade, variedade e confiança para abastecer seu negócio.",
  openGraph: {
    title: "Ingapan | Distribuidora de Produtos Alimentícios",
    description:
      "Qualidade, variedade e confiança na distribuição de alimentos.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${outfit.variable} ${montserrat.variable} antialiased`}
      >
        <a
          href="#conteudo-principal"
          className="sr-only z-[70] rounded-md bg-brand-yellow px-4 py-2 font-semibold text-brand-dark focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Ir para o conteúdo principal
        </a>
        <ToastProvider>
          <CartProvider>
            {children}
            <CartSidebar />
          </CartProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
