"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User as UserIcon, LogOut, LayoutDashboard } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface UserMenuProps {
  isScrolled: boolean;
}

interface AuthUser {
  email?: string | null;
}

export default function UserMenu({ isScrolled }: UserMenuProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function getUser() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setUser(user);
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    }

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setIsOpen(false);
    setUser(null);
    router.refresh();
    router.push("/");
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const buttonClasses = `rounded-full p-2 transition-all duration-200 active:scale-[0.97] md:p-2.5 ${
    isScrolled
      ? "bg-brand-dark/10 text-brand-dark hover:bg-brand-dark/20"
      : "bg-white/20 text-white hover:bg-white/30"
  }`;

  if (loading) {
    return (
      <div className={buttonClasses}>
        <div className="h-5 w-5 md:h-6 md:w-6 animate-pulse bg-current opacity-50 rounded-full" />
      </div>
    );
  }

  if (!user) {
    return (
      <Link
        href="/auth/login"
        className={buttonClasses}
        aria-label="Fazer Login"
      >
        <UserIcon className="h-5 w-5 md:h-6 md:w-6" />
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
      >
        <UserIcon className="h-5 w-5 md:h-6 md:w-6" />
      </button>

      {isOpen && (
        <div className="animate-in fade-in zoom-in-95 absolute right-0 mt-2 w-52 origin-top-right rounded-xl bg-white py-1 shadow-[0_22px_38px_-30px_rgba(34,34,34,0.75)] ring-1 ring-black/5 duration-200 focus:outline-none">
          <div className="px-4 py-2 border-b border-gray-100">
            <p className="text-xs text-gray-500 truncate">Logado como</p>
            <p className="text-sm font-medium text-gray-900 truncate">
              {user.email}
            </p>
          </div>

          <Link
            href="/dashboard"
            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Dashboard
          </Link>

          <button
            onClick={handleSignOut}
            className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </button>
        </div>
      )}
    </div>
  );
}
