import { useState } from "react";
import { useCreateMovement } from "../hooks/useCreateMovement";

interface NewOrderFormProps {
  clientId: string;
  onSuccess?: () => void;
}

export function NewOrderForm({ clientId, onSuccess }: NewOrderFormProps) {
  const createMovement = useCreateMovement();

  // Estados locales
  const [productType, setProductType] = useState<"pedido_medialunas" | "pedido_facturas">("pedido_medialunas");
  const [dozens, setDozens] = useState<number>(0);
  const [units, setUnits] = useState<number>(0);
  const [pricePerDozen, setPricePerDozen] = useState<number>(3600);
  const [date, setDate] = useState<string>(new Date().toISOString().split("T")[0]);

  // Cálculo del total financiero
  const unitPrice = pricePerDozen > 0 ? pricePerDozen / 12 : 0;
  const totalAmount = Math.round((dozens * pricePerDozen) + (units * unitPrice));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (totalAmount <= 0) {
      alert("El total del pedido debe ser mayor a 0");
      return;
    }

    createMovement.mutate(
      {
        client_id: clientId,
        type: productType,
        dozens,
        units,
        unit_price_per_dozen: pricePerDozen,
        amount: totalAmount,
        date,
      },
      {
        onSuccess: () => {
          if (onSuccess) onSuccess();
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-2">
        <h3 className="text-sm font-semibold text-foreground">
          Registrar Nuevo Pedido
        </h3>
        <span className="text-xs text-foreground/50">Cálculo automático</span>
      </div>

      {/* Selector Tipo de Producto */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setProductType("pedido_medialunas")}
          className={`py-2 px-3 rounded-xl text-xs font-medium border transition-all ${
            productType === "pedido_medialunas"
              ? "bg-foreground text-background border-foreground font-semibold"
              : "border-black/15 dark:border-white/20 text-foreground/70 hover:bg-black/5 dark:hover:bg-white/5"
          }`}
        >
          🥐 Medialunas
        </button>
        <button
          type="button"
          onClick={() => setProductType("pedido_facturas")}
          className={`py-2 px-3 rounded-xl text-xs font-medium border transition-all ${
            productType === "pedido_facturas"
              ? "bg-foreground text-background border-foreground font-semibold"
              : "border-black/15 dark:border-white/20 text-foreground/70 hover:bg-black/5 dark:hover:bg-white/5"
          }`}
        >
          🥐 Facturas
        </button>
      </div>

      {/* Inputs de Cantidades */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-foreground/60">Docenas</label>
          <input
            type="number"
            min="0"
            value={dozens}
            onChange={(e) => setDozens(Math.max(0, parseInt(e.target.value)))}
            className="w-full border border-black/15 dark:border-white/20 rounded-xl px-3 py-2 bg-transparent text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-foreground/50"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-foreground/60">Unidades sueltas</label>
          <input
            type="number"
            min="0"
            max="11"
            value={units}
            onChange={(e) => setUnits(Math.max(0, parseInt(e.target.value)))}
            className="w-full border border-black/15 dark:border-white/20 rounded-xl px-3 py-2 bg-transparent text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-foreground/50"
          />
        </div>
      </div>

      {/* Precio por Docena y Fecha */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-foreground/60">Precio / Docena ($)</label>
          <input
            type="number"
            min="0"
            step="100"
            value={pricePerDozen}
            onChange={(e) => setPricePerDozen(Math.max(0, parseInt(e.target.value) || 0))}
            className="w-full border border-black/15 dark:border-white/20 rounded-xl px-3 py-2 bg-transparent text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-foreground/50"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-foreground/60">Fecha del pedido</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full border border-black/15 dark:border-white/20 rounded-xl px-3 py-2 bg-transparent text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-foreground/50"
          />
        </div>
      </div>

      {/* Resumen del Total y Botón Guardar */}
      <div className="flex items-center justify-between pt-2 border-t border-black/10 dark:border-white/10">
        <div>
          <span className="text-xs text-foreground/60 block">Total a sumar</span>
          <span className="text-lg font-bold text-foreground">
            ${isNaN(totalAmount) ? 0 : totalAmount.toLocaleString("es-AR")}
          </span>
        </div>

          {/* disabled={createMovement.isPending || !amount || parseFloat(amount) <= 0} */}
        <button
          type="submit"
          disabled={createMovement.isPending || totalAmount <= 0 || isNaN(totalAmount)}
          className="h-10 px-5 rounded-full bg-emerald-600 text-white font-medium text-sm transition-colors hover:bg-emerald-700 disabled:opacity-50"
        >
          {createMovement.isPending ? "Guardando..." : "Confirmar Pedido"}
        </button>
          
      </div>
    </form>
  );
}
