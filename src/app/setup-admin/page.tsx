"use client";

import { useState } from "react";

export default function SetupAdminPage() {
  const [secret, setSecret] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSetup = async () => {
    setStatus("loading");
    try {
      const response = await fetch("/api/setup-admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ secret }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus("success");
        setMessage("Admin criado com sucesso! Agora você pode fazer login.");
      } else {
        setStatus("error");
        setMessage(data.error || "Erro ao criar admin");
      }
    } catch {
      setStatus("error");
      setMessage("Erro de conexão");
    }
  };

  return (
    <div className="min-h-screen bg-brand-dark flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-xl">
        <h1 className="text-2xl font-bold text-brand-dark mb-6">Setup Admin Ingapan</h1>
        
        {status === "success" ? (
          <div className="text-center">
            <div className="text-green-600 font-semibold mb-4">{message}</div>
            <a
              href="/auth/login"
              className="inline-block bg-brand-red text-white px-6 py-3 rounded-full font-semibold hover:bg-brand-red/90 transition-colors"
            >
              Ir para Login
            </a>
          </div>
        ) : (
          <>
            <p className="text-gray-600 mb-6">
              Digite o ADMIN_SETUP_SECRET para criar o usuário administrador.
            </p>
            
            <input
              type="password"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="Admin Setup Secret"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl mb-4 focus:outline-none focus:ring-2 focus:ring-brand-yellow"
            />
            
            {status === "error" && (
              <div className="text-red-600 text-sm mb-4">{message}</div>
            )}
            
            <button
              onClick={handleSetup}
              disabled={status === "loading" || !secret}
              className="w-full bg-brand-red text-white py-3 rounded-full font-semibold hover:bg-brand-red/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === "loading" ? "Criando..." : "Criar Admin"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
