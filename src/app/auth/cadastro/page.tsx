"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

function formatCNPJ(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 14);
  return digits
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}

function validateCNPJ(cnpj: string): boolean {
  const digits = cnpj.replace(/\D/g, "");
  if (digits.length !== 14) return false;
  if (/^(\d)\1+$/.test(digits)) return false;
  return true;
}

export default function CadastroPage() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCnpj(formatCNPJ(e.target.value));
  };

  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validations
    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      setLoading(false);
      return;
    }

    if (!validateCNPJ(cnpj)) {
      setError("CNPJ inválido. Digite um CNPJ com 14 dígitos.");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo:
          process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
          `${window.location.origin}/dashboard`,
        data: {
          nome,
          cnpj: cnpj.replace(/\D/g, ""),
        },
      },
    });

    if (error) {
      if (error.message.includes("already registered")) {
        setError("Este email já está cadastrado.");
      } else {
        setError("Erro ao criar conta. Tente novamente.");
      }
      setLoading(false);
      return;
    }

    router.push("/auth/cadastro-sucesso");
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
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
              Criar nova conta
            </h2>
            <p className="text-brand-dark/60 mb-6">
              Preencha os dados para se cadastrar como cliente
            </p>

            <form onSubmit={handleCadastro} className="space-y-4">
              <div>
                <label
                  htmlFor="nome"
                  className="block text-sm font-medium text-brand-dark mb-2"
                >
                  Nome da Empresa
                </label>
                <input
                  id="nome"
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                  placeholder="Razão Social"
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-brand-red focus:ring-2 focus:ring-brand-red/20 outline-none transition-all text-brand-dark placeholder:text-gray-400"
                />
              </div>

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
                  placeholder="contato@empresa.com"
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-brand-red focus:ring-2 focus:ring-brand-red/20 outline-none transition-all text-brand-dark placeholder:text-gray-400"
                />
              </div>

              <div>
                <label
                  htmlFor="cnpj"
                  className="block text-sm font-medium text-brand-dark mb-2"
                >
                  CNPJ
                </label>
                <input
                  id="cnpj"
                  type="text"
                  value={cnpj}
                  onChange={handleCnpjChange}
                  required
                  placeholder="00.000.000/0000-00"
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
                  placeholder="Mínimo 6 caracteres"
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-brand-red focus:ring-2 focus:ring-brand-red/20 outline-none transition-all text-brand-dark placeholder:text-gray-400"
                />
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-brand-dark mb-2"
                >
                  Confirmar Senha
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Digite a senha novamente"
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
                {loading ? "Cadastrando..." : "Cadastrar"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-brand-dark/60">
                Já tem conta?{" "}
                <Link
                  href="/auth/login"
                  className="text-brand-red font-semibold hover:underline"
                >
                  Faça login
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

      {/* Right side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-brand-red relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-bl from-brand-red via-brand-red to-brand-dark/30" />
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
            Junte-se a nós!
          </h1>
          <p className="text-white/80 text-lg text-center max-w-md">
            Cadastre sua empresa e tenha acesso aos melhores produtos alimentícios com entrega garantida.
          </p>
          <div className="mt-8 flex flex-col gap-4 text-white/90">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-brand-yellow/20 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-brand-yellow" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span>Catálogo completo de produtos</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-brand-yellow/20 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-brand-yellow" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span>Preços exclusivos para clientes</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-brand-yellow/20 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-brand-yellow" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span>Acompanhamento de pedidos</span>
            </div>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-brand-yellow/20 rounded-full blur-3xl" />
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-brand-orange/20 rounded-full blur-3xl" />
      </div>
    </div>
  );
}
