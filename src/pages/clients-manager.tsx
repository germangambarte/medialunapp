import { useState } from "react";
import {
  useClients,
  useCreateClient,
  useUpdateClient,
  useDeleteClient,
  type Client,
} from "../hooks/useClients";
import { Link } from "react-router";

export function ClientsManager() {
  // Queries & Mutations
  const { data: clients, isLoading, isError, error } = useClients();
  const createClientMutation = useCreateClient();
  const updateClientMutation = useUpdateClient();
  const deleteClientMutation = useDeleteClient();

  // Estados locales para formularios
  const [newClientName, setNewClientName] = useState("");
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  // Handlers
  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim()) return;

    createClientMutation.mutate(newClientName, {
      onSuccess: () => setNewClientName(""),
    });
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient || !editingClient.name.trim()) return;

    updateClientMutation.mutate(
      { id: editingClient.id, name: editingClient.name },
      { onSuccess: () => setEditingClient(null) }
    );
  };

  const handleDelete = (id: string, name: string) => {
    if (
      confirm(
        `¿Seguro que deseas eliminar a "${name}"? Se borrarán todos sus movimientos de cuenta corriente.`
      )
    ) {
      deleteClientMutation.mutate(id);
    }
  };

  if (isLoading) {
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
      {/* Botón Volver y Título */}
      <header className="flex flex-col gap-3">
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs text-foreground/60 hover:text-foreground transition-colors"
          >
            ← Volver al Inicio
          </Link>
        </div>
        <h1 className="text-2xl font-bold text-foreground">
          Gestión de Clientes
        </h1>
      </header>

      {/* Formulario Agregar Cliente */}
      <form onSubmit={handleCreate} className="flex gap-2">
        <input
          type="text"
          placeholder="Nombre del nuevo cliente..."
          value={newClientName}
          onChange={(e) => setNewClientName(e.target.value)}
          className="flex-1 border border-black/15 dark:border-white/20 rounded-full px-4 py-2.5 bg-transparent text-foreground placeholder:text-foreground/50 focus:outline-none focus:ring-2 focus:ring-foreground/50 text-sm"
        />
        <button
          type="submit"
          disabled={createClientMutation.isPending || !newClientName.trim()}
          className="h-10 px-5 rounded-full bg-foreground text-background font-medium text-sm transition-colors hover:bg-foreground/90 disabled:opacity-50 shrink-0"
        >
          {createClientMutation.isPending ? "Guardando..." : "Agregar"}
        </button>
      </form>

      {/* Modal / Card de Edición Inline */}
      {editingClient && (
        <div className="p-4 rounded-2xl border border-black/15 dark:border-white/20 bg-black/5 dark:bg-white/5 flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-foreground">
            Editar nombre de cliente
          </h2>
          <form onSubmit={handleUpdate} className="flex gap-2">
            <input
              type="text"
              value={editingClient.name}
              onChange={(e) =>
                setEditingClient({ ...editingClient, name: e.target.value })
              }
              className="flex-1 border border-black/15 dark:border-white/20 rounded-full px-4 py-2 bg-transparent text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-foreground/50"
            />
            <button
              type="submit"
              disabled={updateClientMutation.isPending}
              className="px-4 py-2 rounded-full bg-foreground text-background font-medium text-xs hover:bg-foreground/90 transition-colors"
            >
              Guardar
            </button>
            <button
              type="button"
              onClick={() => setEditingClient(null)}
              className="px-4 py-2 rounded-full border border-black/15 dark:border-white/20 text-foreground/80 font-medium text-xs hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              Cancelar
            </button>
          </form>
        </div>
      )}

      {/* Lista de Clientes */}
      <section className="flex flex-col gap-3">
        {clients?.map((client) => (
          <div
            key={client.id}
            className="flex items-center justify-between p-4 rounded-2xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02] hover:bg-black/5 dark:hover:bg-white/5 transition-all"
          >
            <span className="font-semibold text-foreground truncate pr-2">
              {client.name}
            </span>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setEditingClient(client)}
                className="px-3 py-1.5 rounded-full border border-black/10 dark:border-white/10 text-xs text-foreground/80 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              >
                Editar
              </button>
              <button
                onClick={() => handleDelete(client.id, client.name)}
                disabled={deleteClientMutation.isPending}
                className="px-3 py-1.5 rounded-full border border-red-500/20 text-xs text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}

        {clients?.length === 0 && (
          <p className="text-center text-sm text-foreground/50 py-8">
            Aún no has registrado ningún cliente.
          </p>
        )}
      </section>
    </main>
  );
}
