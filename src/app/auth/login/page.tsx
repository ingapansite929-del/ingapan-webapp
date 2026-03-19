"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("Email ou senha incorretos. Tente novamente.");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-brand-red relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-red via-brand-red to-brand-dark/30" />
        <div className="relative z-10 flex flex-col justify-center items-center w-full p-12">
          <Link href="/" className="mb-8">
            <Image
              src="/images/LOGO.png"
              alt="IngaPan"
              width={200}
              height={135}
              className="brightness-0 invert"
              priority
            />
          </Link>
          <h1 className="text-4xl font-bold text-white text-center font-heading mb-4">
            Bem-vindo de volta!
          </h1>
          <p className="text-white/80 text-lg text-center max-w-md">
            Acesse sua conta para gerenciar seus pedidos e acompanhar suas entregas.
          </p>
        </div>
        {/* Decorative elements */}
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-brand-yellow/20 rounded-full blur-3xl" />
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-brand-orange/20 rounded-full blur-3xl" />
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-brand-light">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <Link href="/">
              <Image
                src="/images/LOGO.png"
                alt="IngaPan"
                width={150}
                height={100}
                priority
              />
            </Link>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-brand-dark font-heading mb-2">
              Entrar na sua conta
            </h2>
            <p className="text-brand-dark/60 mb-8">
              Digite suas credenciais para acessar
            </p>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-brand-dark mb-2"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="seu@email.com"
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-brand-red focus:ring-2 focus:ring-brand-red/20 outline-none transition-all text-brand-dark placeholder:text-gray-400"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-brand-dark mb-2"
                >
                  Senha
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-brand-red focus:ring-2 focus:ring-brand-red/20 outline-none transition-all text-brand-dark placeholder:text-gray-400"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-red text-white font-semibold py-3 px-4 rounded-lg hover:bg-brand-red/90 transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Carregando..." : "Entrar"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-brand-dark/60">
                Ainda não tem conta?{" "}
                <Link
                  href="/auth/cadastro"
                  className="text-brand-red font-semibold hover:underline"
                >
                  Cadastre-se
                </Link>
              </p>
            </div>
          </div>

          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-brand-dark/60 hover:text-brand-red transition-colors text-sm"
            >
              Voltar para o site
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
