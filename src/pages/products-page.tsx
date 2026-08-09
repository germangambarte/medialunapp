import { useState } from "react";
import { Link } from "react-router";
import {
  useProducts,
  useUpdateProduct,
  useCreateProduct,
} from "../hooks/useProducts";
import { formatMoney } from "../lib/format";

export default function ProductsPage() {
  const { data: products, isPending } = useProducts();
  const updateProduct = useUpdateProduct();
  const createProduct = useCreateProduct();

  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");

  const toggleAvailability = (id: string, available: boolean) => {
    updateProduct.mutate({ id, available: !available });
  };

  const startEdit = (id: string, name: string, price: number) => {
    setEditingId(id);
    setEditName(name);
    setEditPrice(String(price));
  };

  const saveEdit = (id: string) => {
    const price = parseFloat(editPrice);
    if (!editName.trim() || isNaN(price) || price < 0) return;
    updateProduct.mutate({ id, name: editName.trim(), price });
    setEditingId(null);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseFloat(newPrice);
    if (!newName.trim() || isNaN(price) || price < 0) return;
    createProduct.mutate({ name: newName.trim(), price });
    setNewName("");
    setNewPrice("");
  };

  if (isPending) {
    return (
      <main className="w-full max-w-2xl mx-auto min-h-screen px-4 py-8 flex justify-center items-center">
        <p className="text-foreground/60 animate-pulse">Cargando productos...</p>
      </main>
    );
  }

  return (
    <main className="w-full max-w-2xl mx-auto min-h-screen px-4 py-6 pb-28 flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <Link
          to="/comidas"
          className="inline-flex items-center gap-1.5 text-xs text-foreground/60 hover:text-foreground transition-colors"
        >
          ← Volver a la Caja
        </Link>
        <h1 className="text-2xl font-bold text-foreground mt-1">
          Gestión de Productos
        </h1>
        <p className="text-xs text-foreground/50">
          Marcá disponibilidad y ajustá precios del menú
        </p>
      </header>

      {/* Formulario agregar producto */}
      <form onSubmit={handleCreate} className="flex gap-2">
        <input
          type="text"
          placeholder="Nuevo producto..."
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="flex-1 min-w-0 border border-black/15 dark:border-white/20 rounded-full px-4 py-2.5 bg-transparent text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-foreground/50"
        />
        <input
          type="number"
          min="0"
          placeholder="$"
          value={newPrice}
          onChange={(e) => setNewPrice(e.target.value)}
          className="w-20 border border-black/15 dark:border-white/20 rounded-full px-3 py-2.5 bg-transparent text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-foreground/50"
        />
        <button
          type="submit"
          disabled={createProduct.isPending || !newName.trim() || !newPrice}
          className="h-10 px-5 rounded-full bg-foreground text-background font-medium text-sm transition-colors hover:bg-foreground/90 disabled:opacity-50 shrink-0"
        >
          Agregar
        </button>
      </form>

      {/* Lista de productos */}
      <section className="flex flex-col gap-2">
        {products?.map((product) => (
          <div
            key={product.id}
            className={`p-3 rounded-2xl border transition-all ${
              product.available
                ? "border-black/10 dark:border-white/10"
                : "border-dashed border-black/15 dark:border-white/15 opacity-60"
            }`}
          >
            {editingId === product.id ? (
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="flex-1 min-w-0 border border-black/15 dark:border-white/20 rounded-xl px-3 py-2 bg-transparent text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-foreground/50"
                  />
                  <input
                    type="number"
                    min="0"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    className="w-24 border border-black/15 dark:border-white/20 rounded-xl px-3 py-2 bg-transparent text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-foreground/50"
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => saveEdit(product.id)}
                    disabled={updateProduct.isPending}
                    className="px-4 py-2 rounded-full bg-foreground text-background font-medium text-xs hover:bg-foreground/90 disabled:opacity-50"
                  >
                    Guardar
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="px-4 py-2 rounded-full border border-black/15 dark:border-white/20 text-foreground/80 font-medium text-xs"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {product.name}
                  </p>
                  <p className="text-xs text-foreground/50">
                    {formatMoney(Number(product.price))}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => startEdit(product.id, product.name, Number(product.price))}
                    className="px-3 py-1.5 rounded-full border border-black/10 dark:border-white/10 text-xs text-foreground/80 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => toggleAvailability(product.id, product.available)}
                    disabled={updateProduct.isPending}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      product.available
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20"
                        : "bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20"
                    }`}
                  >
                    {product.available ? "Disponible" : "Agotado"}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {products?.length === 0 && (
          <p className="text-center text-sm text-foreground/50 py-8">
            Aún no hay productos. Agregá tu primer producto.
          </p>
        )}
      </section>
    </main>
  );
}
