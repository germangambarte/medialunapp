import "./App.css"
import { useState } from "react";
import Link from "next/link";
import { ClientModal } from "@/app/src/components/client-modal";

export interface Client {
  id: string;
  name: string;
  debt: number;
  lastActivityDate: string;
}

const INITIAL_CLIENTS: Client[] = [
  { id: "pelu", name: "Peluquería Pelu", debt: 100000, lastActivityDate: "27/07/2026" },
  { id: "confiteria-centro", name: "Confitería Centro", debt: 45000, lastActivityDate: "25/07/2026" },
  { id: "cafe-martinez", name: "Café Martínez (Sucursal 2)", debt: 0, lastActivityDate: "20/07/2026" },
];

export default  function ClientsHomePage() {
  const [clients, setClients] = useState<Client[]>(INITIAL_CLIENTS);
  const [searchTerm, setSearchTerm] = useState("");


  // Estados de Modales
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [clientToEdit, setClientToEdit] = useState<Client | null>(null);

  // Filtrado por buscador
  const filteredClients = clients.filter((client) =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalDebtAllClients = clients.reduce((acc, c) => acc + c.debt, 0);

  // 1. Agregar Cliente
  const handleAddClient = (name: string) => {
    const newClient: Client = {
      id: name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-0-]/g, ""),
      name,
      debt: 0,
      lastActivityDate: "Sin movimientos",
    };
    setClients((prev) => [newClient, ...prev]);
  };

  // 2. Editar Nombre de Cliente
  const handleEditClient = (newName: string) => {
    if (!clientToEdit) return;
    setClients((prev) =>
      prev.map((c) => (c.id === clientToEdit.id ? { ...c, name: newName } : c))
    );
    setClientToEdit(null);
  };

  // 3. Eliminar Cliente
  const handleDeleteClient = (id: string, name: string) => {
    const confirmDelete = window.confirm(
      `¿Estás seguro de que deseas eliminar a "${name}"? Se borrará su historial de deuda.`
    );
    if (confirmDelete) {
      setClients((prev) => prev.filter((c) => c.id !== id));
    }
  };

  return (
    <main className="w-full max-w-2xl mx-auto min-h-screen px-4 py-8 flex flex-col gap-6 pb-28">
      {/* Encabezado y Botón Agregar */}
      <header className="flex justify-between items-start gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-foreground">Contabilidad Clientes</h1>
          <p className="text-sm text-foreground/60">
            Deuda total:{" "}
            <span className="font-semibold text-foreground">
              ${totalDebtAllClients.toLocaleString("es-AR")}
            </span>
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 h-10 px-4 rounded-full bg-foreground text-background font-medium text-sm transition-colors hover:bg-foreground/90 shrink-0"
        >
          + Agregar
        </button>
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

      {/* Listado de Clientes con Edición y Eliminación */}
      <section className="flex flex-col gap-3">
        {filteredClients.map((client) => (
          <div
            key={client.id}
            className="group relative flex items-center justify-between p-4 rounded-2xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02] hover:bg-black/5 dark:hover:bg-white/5 transition-all"
          >
            {/* Clic en la tarjeta lleva al Dashboard */}
            <Link
              href={`/cliente/${client.id}`}
              className="flex-1 flex items-center justify-between min-w-0 pr-3"
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
                      ? "text-red-600 dark:text-red-400"
                      : "text-foreground/60"
                  }`}
                >
                  ${client.debt.toLocaleString("es-AR")}
                </span>
              </div>
            </Link>

            {/* Acciones de Editar y Eliminar */}
            <div className="flex items-center gap-1 border-l border-black/10 dark:border-white/10 pl-2">
              <button
                type="button"
                title="Editar cliente"
                onClick={() => setClientToEdit(client)}
                className="p-1.5 rounded-lg text-foreground/60 hover:text-foreground hover:bg-black/5 dark:hover:bg-white/10 text-xs font-medium"
              >
                ✏️
              </button>
              <button
                type="button"
                title="Eliminar cliente"
                onClick={() => handleDeleteClient(client.id, client.name)}
                className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10 text-xs font-medium"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}

        {filteredClients.length === 0 && (
          <p className="text-center text-sm text-foreground/50 py-8">
            No hay clientes para mostrar.
          </p>
        )}
      </section>

      {/* Modal para Crear Cliente */}
      <ClientModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddClient}
        title="Nuevo Cliente"
      />

      {/* Modal para Editar Nombre */}
      <ClientModal
        isOpen={Boolean(clientToEdit)}
        onClose={() => setClientToEdit(null)}
        onSubmit={handleEditClient}
        initialName={clientToEdit?.name || ""}
        title="Editar Nombre"
      />
    </main>
  );
}

