"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User as UserIcon, LogOut, LayoutDashboard } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface UserMenuProps {
  isScrolled: boolean;
  initialUser: AuthUser | null;
  scrollLevel?: number;
}

interface AuthUser {
  email?: string | null;
}

export default function UserMenu({ isScrolled, initialUser, scrollLevel = 0 }: UserMenuProps) {
  const [user, setUser] = useState<AuthUser | null>(initialUser);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setIsOpen(false);
    setUser(null);
    router.refresh();
    router.push("/");
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // Classes dinâmicas baseadas em scrollLevel
  const buttonClasses = `group cursor-pointer rounded-full p-2.5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_18px_-14px_rgba(34,34,34,0.35)] active:scale-[0.97] ${
    scrollLevel >= 1
      ? "text-brand-dark bg-brand-dark/8 hover:bg-brand-dark/12"
      : "text-brand-dark bg-white/30 hover:bg-brand-yellow hover:text-brand-red hover:shadow-[0_12px_22px_-14px_rgba(249,207,0,0.65)]"
  }`;

  if (!user) {
    return (
      <Link
        href="/auth/login"
        className={buttonClasses}
        aria-label="Fazer Login"
        title="Fazer login"
      >
        <UserIcon className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" strokeWidth={1.5} />
      </Link>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className={buttonClasses}
        aria-label="Menu do Usuário"
        aria-expanded={isOpen}
        title="Menu do usuário"
      >
        <UserIcon className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" strokeWidth={1.5} />
      </button>

      {isOpen && (
        <div className="animate-in fade-in zoom-in-95 absolute right-0 mt-2 w-56 origin-top-right rounded-xl bg-white py-1 shadow-[0_22px_38px_-30px_rgba(34,34,34,0.75)] ring-1 ring-black/5 duration-200 focus:outline-none">
          {/* Email Section */}
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Logado como
            </p>
            <p className="text-sm font-semibold text-gray-900 truncate mt-1">
              {user.email}
            </p>
          </div>

          {/* Dashboard Link */}
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors group"
            onClick={() => setIsOpen(false)}
          >
            <LayoutDashboard className="h-4 w-4 text-gray-500 group-hover:text-brand-dark transition-colors" />
            Dashboard
          </Link>

          {/* Logout Button */}
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors group"
          >
            <LogOut className="h-4 w-4 text-red-500 group-hover:text-red-700 transition-colors" />
            Sair
          </button>
        </div>
      )}
    </div>
  );
}
