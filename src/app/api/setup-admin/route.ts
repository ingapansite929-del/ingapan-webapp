import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  // Verificar secret key para segurança
  const { secret } = await request.json();
  
  if (secret !== process.env.ADMIN_SETUP_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const email = "ingapansite929@gmail.com";
  const password = "cd9XEtd8@@KMd7j";

  try {
    // Criar usuário admin
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        nome: "Administrador Ingapan",
        cnpj: "00000000000000",
      },
    });

    if (authError) {
      // Se usuário já existe, tentar atualizar
      if (authError.message.includes("already exists")) {
        const { data: users } = await supabaseAdmin.auth.admin.listUsers();
        const existingUser = users?.users?.find((u) => u.email === email);
        
        if (existingUser) {
          // Atualizar role para admin
          await supabaseAdmin
            .from("clientes")
            .update({ role: "admin_ingapan" })
            .eq("id", existingUser.id);
          
          return NextResponse.json({ 
            success: true, 
            message: "Usuário existente atualizado para admin" 
          });
        }
      }
      throw authError;
    }

    if (authData.user) {
      // Atualizar role para admin_ingapan
      await supabaseAdmin
        .from("clientes")
        .update({ role: "admin_ingapan" })
        .eq("id", authData.user.id);
    }

    return NextResponse.json({ 
      success: true, 
      message: "Admin criado com sucesso",
      userId: authData.user?.id 
    });
  } catch (error) {
    console.error("Erro ao criar admin:", error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Erro desconhecido" 
    }, { status: 500 });
  }
}
