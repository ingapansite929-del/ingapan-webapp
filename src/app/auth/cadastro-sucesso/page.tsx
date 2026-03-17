import Link from "next/link";
import Image from "next/image";

export default function CadastroSucessoPage() {
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
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-brand-dark font-heading mb-4">
            Cadastro realizado!
          </h1>

          <p className="text-brand-dark/60 mb-6">
            Enviamos um email de confirmação para o endereço cadastrado. Por
            favor, verifique sua caixa de entrada e clique no link para ativar
            sua conta.
          </p>

          <div className="bg-brand-yellow/10 border border-brand-yellow/30 rounded-lg p-4 mb-6">
            <p className="text-sm text-brand-dark/80">
              Não recebeu o email? Verifique sua pasta de spam ou aguarde alguns
              minutos.
            </p>
          </div>

          <Link
            href="/auth/login"
            className="inline-block w-full bg-brand-red text-white font-semibold py-3 px-4 rounded-lg hover:bg-brand-red/90 transition-all duration-200 hover:shadow-lg"
          >
            Ir para o Login
          </Link>
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
