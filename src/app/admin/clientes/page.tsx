import { requireAdminAccess } from "@/lib/auth/admin";

export default async function AdminClientsPage() {
  await requireAdminAccess();

  return (
    <section className="rounded-xl bg-white p-8 shadow-sm">
      <span className="inline-flex rounded-lg bg-brand-yellow/30 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-brand-orange">
        Em breve
      </span>
      <h1 className="mt-4 text-2xl font-bold font-heading text-brand-dark">
        Gestão de clientes
      </h1>
      <p className="mt-3 max-w-2xl text-sm text-brand-dark/70">
        Este módulo foi criado como área dedicada para gestão de clientes e
        receberá funcionalidades em uma próxima etapa.
      </p>
    </section>
  );
}
