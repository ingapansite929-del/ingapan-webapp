import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function createAdminUser() {
  const email = "ingapansite929@gmail.com";
  const password = "cd9XEtd8@@KMd7j";
  const nome = "Admin Ingapan";
  const cnpj = "00.000.000/0001-00";

  console.log("Creating admin user...");

  // Create user in Supabase Auth
  const { data: authData, error: authError } =
    await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        nome,
        cnpj,
      },
    });

  if (authError) {
    console.error("Error creating auth user:", authError);
    return;
  }

  console.log("Auth user created:", authData.user?.id);

  // Update the role in clientes table to admin
  if (authData.user) {
    const { error: updateError } = await supabase
      .from("clientes")
      .update({ role: "admin_ingapan" })
      .eq("id", authData.user.id);

    if (updateError) {
      console.error("Error updating role:", updateError);
      return;
    }

    console.log("Admin role assigned successfully!");
  }
}

createAdminUser();
