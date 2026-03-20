import type { Metadata } from "next";
import { Inter, Montserrat } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/CartContext";
import CartSidebar from "@/components/CartSidebar";
import { ToastProvider } from "@/components/Toast";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
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
        className={`${inter.variable} ${montserrat.variable} antialiased`}
      >
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
