import { fireEvent, render, screen } from "@testing-library/react";
import type { ImgHTMLAttributes, ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import AdminShell from "@/components/admin/AdminShell";
import { AdminSidebarProvider } from "@/components/admin/AdminSidebarContext";
import { TooltipProvider } from "@/components/ui/tooltip";

vi.mock("next/navigation", () => ({
  usePathname: () => "/admin/products",
}));

vi.mock("next/link", () => ({
  default: ({
    children,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    children: ReactNode;
  }) => <a {...props}>{children}</a>,
}));

vi.mock("next/image", () => ({
  default: ({
    alt,
    priority: _priority,
    ...props
  }: ImgHTMLAttributes<HTMLImageElement> & { priority?: boolean }) => {
    void _priority;
    // eslint-disable-next-line @next/next/no-img-element
    return <img alt={alt ?? ""} {...props} />;
  },
}));

vi.mock("@/components/LogoutButton", () => ({
  default: () => <button type="button">Sair</button>,
}));

function Shell({ content }: { content: string }) {
  return (
    <AdminSidebarProvider>
      <TooltipProvider>
        <AdminShell adminName="Guilherme Rosa">
          <p>{content}</p>
        </AdminShell>
      </TooltipProvider>
    </AdminSidebarProvider>
  );
}

describe("AdminShell", () => {
  it("remove títulos redundantes e mantém o estado recolhido na navegação", () => {
    const { rerender } = render(<Shell content="Produtos" />);

    expect(screen.queryByText("Painel administrativo")).not.toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("button", { name: "Recolher sidebar" })
    );
    expect(
      screen.getByRole("button", { name: "Expandir sidebar" })
    ).toBeInTheDocument();

    rerender(<Shell content="Clientes" />);
    expect(
      screen.getByRole("button", { name: "Expandir sidebar" })
    ).toBeInTheDocument();
  });
});
