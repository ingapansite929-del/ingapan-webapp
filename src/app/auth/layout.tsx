import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Área do cliente",
    template: "%s | Área do cliente | Ingapan",
  },
  description: "Acesso e cadastro de clientes da Ingapan.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
