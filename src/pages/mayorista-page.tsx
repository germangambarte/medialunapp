import { useState } from "react";
import { useClientsWithSummary } from "../hooks/useClients";
import { Link } from "react-router";

type Filter = "todos" | "deuda" | "al_dia";

const AVATAR_COLORS = [
  "bg-red-500/15 text-red-600 dark:text-red-400",
  "bg-orange-500/15 text-orange-600 dark:text-orange-400",
  "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  "bg-sky-500/15 text-sky-600 dark:text-sky-400",
  "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400",
  "bg-violet-500/15 text-violet-600 dark:text-violet-400",
  "bg-pink-500/15 text-pink-600 dark:text-pink-400",
];

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function avatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) % 997;
  }
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

export default function MayoristaPage() {
  const { data: clients, isPending, isError, error } = useClientsWithSummary();
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<Filter>("todos");

  const totalDebtAllClients = clients?.reduce((acc, c) => acc + c.debt, 0) || 0;
  const clientsWithDebt = clients?.filter((c) => c.debt > 0).length || 0;
  const clientsAlDia = clients?.filter((c) => c.debt === 0).length || 0;

  const filteredClients = clients?.filter((client) => {
    const matchesSearch = client.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesFilter =
      filter === "todos" ||
      (filter === "deuda" && client.debt > 0) ||
      (filter === "al_dia" && client.debt === 0);
    return matchesSearch && matchesFilter;
  });

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
      {/* Encabezado */}
      <header className="flex justify-between items-start gap-4">
        <div className="flex flex-col gap-1">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs text-foreground/60 hover:text-foreground transition-colors"
          >
            ← Inicio
          </Link>
          <div className="flex items-center gap-3 mt-1">
            <img
              src="/croissant-colored.png"
              alt="icono de medialuna coloreada"
              className="w-9"
            />
            <h1 className="text-2xl font-bold text-foreground">
              Medialunas por Mayor
            </h1>
          </div>
        </div>
        <Link
          to="/clientes"
          className="flex items-center gap-1.5 h-10 px-4 rounded-full bg-foreground text-background font-medium text-sm transition-colors hover:bg-foreground/90 shrink-0 mt-5"
        >
          Gestionar
        </Link>
      </header>

      {/* Cards de resumen */}
      <section className="grid grid-cols-2 gap-3">
        <div className="p-4 rounded-2xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02]">
          <span className="text-xs text-foreground/60 block">Clientes</span>
          <span className="text-xl font-extrabold text-foreground">
            {clients?.length ?? 0}
          </span>
        </div>
        <div className="p-4 rounded-2xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02]">
          <span className="text-xs text-foreground/60 block">Deuda total</span>
          <span className="text-xl font-extrabold text-foreground">
            ${totalDebtAllClients.toLocaleString("es-AR")}
          </span>
        </div>
        <div className="p-4 rounded-2xl border border-red-500/15 bg-red-500/5">
          <span className="text-xs text-red-500/70 block">Con deuda</span>
          <span className="text-xl font-extrabold text-red-500 dark:text-red-400">
            {clientsWithDebt}
          </span>
        </div>
        <div className="p-4 rounded-2xl border border-emerald-500/15 bg-emerald-500/5">
          <span className="text-xs text-emerald-600/70 block">Al día</span>
          <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {clientsAlDia}
          </span>
        </div>
      </section>

      {/* Buscador y filtros */}
      <div className="flex flex-col gap-2">
        <input
          type="text"
          placeholder="Buscar cliente..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full border border-black/15 dark:border-white/20 rounded-full px-4 py-2.5 bg-transparent text-foreground placeholder:text-foreground/50 focus:outline-none focus:ring-2 focus:ring-foreground/50 text-sm"
        />

        <div className="flex rounded-full border border-black/10 dark:border-white/10 overflow-hidden text-xs font-medium w-fit">
          {(
            [
              { key: "todos", label: "Todos" },
              { key: "deuda", label: "Con deuda" },
              { key: "al_dia", label: "Al día" },
            ] as { key: Filter; label: string }[]
          ).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-3.5 py-1.5 transition-colors ${
                filter === key
                  ? "bg-foreground text-background"
                  : "text-foreground/60 hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Listado de Clientes */}
      <section className="flex flex-col gap-2">
        {filteredClients?.map((client) => (
          <Link
            key={client.id}
            to={`/cliente/${client.id}`}
            className="flex items-center gap-3 min-w-0 p-3 rounded-2xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02] hover:bg-black/5 dark:hover:bg-white/5 hover:border-black/20 dark:hover:border-white/20 transition-all"
          >
            <div
              className={`flex items-center justify-center shrink-0 w-11 h-11 rounded-full font-bold text-sm ${avatarColor(
                client.name,
              )}`}
            >
              {initials(client.name)}
            </div>

            <div className="flex flex-col min-w-0 flex-1 pr-2">
              <span className="font-semibold text-foreground truncate">
                {client.name}
              </span>
              <span className="text-xs text-foreground/50">
                Últ. mov: {client.lastActivityDate}
              </span>
            </div>

            <div className="text-right shrink-0 flex items-center gap-2">
              {client.debt > 0 ? (
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              ) : (
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              )}
              <div>
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
            </div>
          </Link>
        ))}

        {filteredClients?.length === 0 && (
          <p className="text-center text-sm text-foreground/50 py-8">
            {clients?.length === 0
              ? "Aún no hay clientes registrados."
              : "No hay clientes que coincidan con la búsqueda."}
          </p>
        )}
      </section>
    </main>
  );
}
