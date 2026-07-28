"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  LayoutDashboard,
  Menu,
  Package,
  Users,
} from "lucide-react";
import type { ReactNode } from "react";
import LogoutButton from "@/components/LogoutButton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAdminSidebar } from "@/components/admin/AdminSidebarContext";

const navigation = [
  { href: "/dashboard", label: "Visão geral", icon: LayoutDashboard },
  { href: "/admin/products", label: "Produtos", icon: Package },
  { href: "/admin/pedidos", label: "Pedidos", icon: ClipboardList },
  { href: "/admin/clientes", label: "Clientes", icon: Users },
];

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function NavigationLinks({
  pathname,
  mobile = false,
  collapsed = false,
}: {
  pathname: string;
  mobile?: boolean;
  collapsed?: boolean;
}) {
  return (
    <nav className="space-y-1" aria-label="Navegação administrativa">
      {navigation.map((item) => {
        const active =
          item.href === "/dashboard"
            ? pathname === item.href
            : pathname.startsWith(item.href);
        const content = (
          <>
            <item.icon className="size-4" aria-hidden="true" />
            <span className={cn(collapsed && !mobile && "sr-only")}>
              {item.label}
            </span>
          </>
        );

        return mobile ? (
          <SheetClose asChild key={item.href}>
            <Link
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-secondary text-secondary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {content}
            </Link>
          </SheetClose>
        ) : (
          <Tooltip key={item.href}>
            <TooltipTrigger asChild>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                aria-label={collapsed ? item.label : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  collapsed && "justify-center px-2",
                  active
                    ? "bg-secondary text-secondary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {content}
              </Link>
            </TooltipTrigger>
            {collapsed ? (
              <TooltipContent side="right" sideOffset={8}>
                {item.label}
              </TooltipContent>
            ) : null}
          </Tooltip>
        );
      })}
    </nav>
  );
}

export default function AdminShell({
  adminName,
  children,
}: {
  adminName: string | null;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const { collapsed, toggleCollapsed } = useAdminSidebar();
  const displayName = adminName || "Administrador";

  return (
    <div
      className={cn(
        "min-h-screen bg-muted/35 lg:grid lg:transition-[grid-template-columns] lg:duration-[var(--motion-normal)]",
        collapsed
          ? "lg:grid-cols-[80px_minmax(0,1fr)]"
          : "lg:grid-cols-[248px_minmax(0,1fr)]"
      )}
    >
      <aside
        className={cn(
          "sticky top-0 hidden h-screen border-r bg-card p-4 lg:flex lg:flex-col",
          collapsed && "px-3"
        )}
      >
        <Link
          href="/"
          className={cn(
            "flex h-14 items-center px-2",
            collapsed && "justify-center px-0"
          )}
          aria-label="IngaPan"
        >
          <Image
            src="/images/LOGO.png"
            alt="IngaPan"
            width={128}
            height={87}
            className={cn("h-10 w-auto", collapsed && "h-8 max-w-12")}
            priority
          />
        </Link>
        <div className="mt-5 flex-1">
          <NavigationLinks pathname={pathname} collapsed={collapsed} />
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size={collapsed ? "icon" : "default"}
              className={cn(!collapsed && "justify-start")}
              onClick={toggleCollapsed}
              aria-label={collapsed ? "Expandir sidebar" : "Recolher sidebar"}
            >
              {collapsed ? <ChevronRight /> : <ChevronLeft />}
              {collapsed ? null : "Recolher sidebar"}
            </Button>
          </TooltipTrigger>
          {collapsed ? (
            <TooltipContent side="right" sideOffset={8}>
              Expandir sidebar
            </TooltipContent>
          ) : null}
        </Tooltip>
        <Separator className="my-4" />
        <Button
          asChild
          variant="ghost"
          size={collapsed ? "icon" : "default"}
          className={cn(!collapsed && "justify-start")}
        >
          <Link href="/">
            <ArrowLeft />
            <span className={cn(collapsed && "sr-only")}>Voltar ao site</span>
          </Link>
        </Button>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur sm:px-6 lg:px-8">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="lg:hidden"
                aria-label="Abrir navegação administrativa"
              >
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72">
              <SheetHeader>
                <SheetTitle className="text-left">Painel IngaPan</SheetTitle>
              </SheetHeader>
              <div className="px-4">
                <NavigationLinks pathname={pathname} mobile />
                <Separator className="my-4" />
                <SheetClose asChild>
                  <Button asChild variant="ghost" className="w-full justify-start">
                    <Link href="/">
                      <ArrowLeft />
                      Voltar ao site
                    </Link>
                  </Button>
                </SheetClose>
              </div>
            </SheetContent>
          </Sheet>

          <div className="min-w-0 flex-1" />
          <div className="hidden text-right sm:block">
            <p className="max-w-44 truncate text-sm font-medium">{displayName}</p>
            <p className="text-xs text-muted-foreground">Administrador</p>
          </div>
          <Avatar className="size-9">
            <AvatarFallback>{getInitials(displayName) || "AD"}</AvatarFallback>
          </Avatar>
          <LogoutButton />
        </header>
        <main className="min-w-0 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
