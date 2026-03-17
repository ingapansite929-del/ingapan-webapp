import Link from "next/link";
import Image from "next/image";

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-light p-8">
      <div className="w-full max-w-md text-center">
        <Link href="/" className="inline-block mb-8">
          <Image
            src="/images/LOGO.png"
            alt="IngaPan"
            width={150}
            height={100}
            priority
          />
        </Link>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-brand-dark font-heading mb-4">
            Erro na autenticação
          </h1>

          <p className="text-brand-dark/60 mb-6">
            Ocorreu um problema durante o processo de autenticação. Por favor,
            tente novamente.
          </p>

          <div className="flex flex-col gap-3">
            <Link
              href="/auth/login"
              className="w-full bg-brand-red text-white font-semibold py-3 px-4 rounded-lg hover:bg-brand-red/90 transition-all duration-200 hover:shadow-lg"
            >
              Tentar fazer login
            </Link>
            <Link
              href="/auth/cadastro"
              className="w-full bg-brand-dark/10 text-brand-dark font-semibold py-3 px-4 rounded-lg hover:bg-brand-dark/20 transition-all duration-200"
            >
              Criar nova conta
            </Link>
          </div>
        </div>

        <div className="mt-6">
          <Link
            href="/"
            className="text-brand-dark/60 hover:text-brand-red transition-colors text-sm"
          >
            Voltar para o site
          </Link>
        </div>
      </div>
    </div>
  );
}
