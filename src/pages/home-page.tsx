import { useState } from "react";
import { useClientsWithSummary } from "../hooks/useClients";
import { Link } from "react-router";

export default function HomePage() {
  const { data: clients, isPending, isError, error } = useClientsWithSummary();
  const [searchTerm, setSearchTerm] = useState("");

  // Filtrado por buscador
  const filteredClients = clients?.filter((client) =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Deuda total acumulada de TODOS los clientes
  const totalDebtAllClients = clients?.reduce((acc, c) => acc + c.debt, 0) || 0;

  if (isPending) {
    return (
      <main className="w-full max-w-2xl mx-auto min-h-screen px-4 py-8 flex justify-center items-center">
        <p className="text-foreground/60 animate-pulse">Cargando clientes...</p>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="w-full max-w-2xl mx-auto min-h-screen px-4 py-8">
        <p className="text-red-500">Error: {(error as Error).message}</p>
      </main>
    );
  }

  return (
    <main className="w-full max-w-2xl mx-auto min-h-screen px-4 py-8 flex flex-col gap-6 pb-28">
      {/* Encabezado y Botón Agregar */}
      <header className="flex justify-between items-start gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-foreground">
            Contabilidad Clientes
          </h1>

          <p className="text-sm text-foreground/60">
            Deuda total:{" "}
            <span className="font-semibold text-foreground">
              ${totalDebtAllClients.toLocaleString("es-AR")}
            </span>
          </p>
        </div>

        <Link
          to="/clientes"
          className="flex items-center gap-1.5 h-10 px-4 rounded-full bg-foreground text-background font-medium text-sm transition-colors hover:bg-foreground/90 shrink-0"
        >
          Gestionar Clientes
        </Link>
      </header>

      {/* Buscador de Clientes */}
      <div className="relative">
        <input
          type="text"
          placeholder="Buscar cliente..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full border border-black/15 dark:border-white/20 rounded-full px-4 py-2.5 bg-transparent text-foreground placeholder:text-foreground/50 focus:outline-none focus:ring-2 focus:ring-foreground/50 text-sm"
        />
      </div>

      {/* Listado de Clientes */}
      <section className="flex flex-col gap-3">
        {filteredClients?.map((client) => (
          <Link
            to={`/cliente/${client.id}`}
            className="flex-1 flex items-center justify-between min-w-0 p-4 rounded-2xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02] hover:bg-black/5 dark:hover:bg-white/5 transition-all"
          >
            <div className="flex flex-col min-w-0 pr-2">
              <span className="font-semibold text-foreground truncate">
                {client.name}
              </span>
              <span className="text-xs text-foreground/50">
                Últ. mov: {client.lastActivityDate}
              </span>
            </div>

            <div className="text-right shrink-0">
              <span className="text-xs text-foreground/60 block">Deuda</span>
              <span
                className={`text-base font-bold ${
                  client.debt > 0
                    ? "text-red-500 dark:text-red-400"
                    : "text-emerald-600 dark:text-emerald-400"
                }`}
              >
                ${client.debt.toLocaleString("es-AR")}
              </span>
            </div>
          </Link>
        ))}

        {filteredClients?.length === 0 && (
          <p className="text-center text-sm text-foreground/50 py-8">
            No hay clientes para mostrar.
          </p>
        )}
      </section>
    </main>
  );
}
