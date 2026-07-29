import { useState } from "react";
import { useCreateMovement } from "../hooks/useCreateMovement";

interface NewPaymentFormProps {
  clientId: string;
  onSuccess?: () => void;
}

export function NewPaymentForm({ clientId, onSuccess }: NewPaymentFormProps) {
  const createMovement = useCreateMovement();

  // Estados locales
  const [amount, setAmount] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<"efectivo" | "transferencia">("transferencia");
  const [notes, setNotes] = useState<string>("");
  const [date, setDate] = useState<string>(new Date().toISOString().split("T")[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      alert("Ingresa un monto válido mayor a 0");
      return;
    }

    createMovement.mutate(
      {
        client_id: clientId,
        type: "pago",
        amount: numericAmount,
        payment_method: paymentMethod,
        notes: notes.trim() || undefined,
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
          Registrar Nuevo Pago
        </h3>
        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
          Resta a la deuda
        </span>
      </div>

      {/* Selector Método de Pago */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setPaymentMethod("transferencia")}
          className={`py-2 px-3 rounded-xl text-xs font-medium border transition-all ${
            paymentMethod === "transferencia"
              ? "bg-foreground text-background border-foreground font-semibold"
              : "border-black/15 dark:border-white/20 text-foreground/70 hover:bg-black/5 dark:hover:bg-white/5"
          }`}
        >
          💳 Transferencia
        </button>
        <button
          type="button"
          onClick={() => setPaymentMethod("efectivo")}
          className={`py-2 px-3 rounded-xl text-xs font-medium border transition-all ${
            paymentMethod === "efectivo"
              ? "bg-foreground text-background border-foreground font-semibold"
              : "border-black/15 dark:border-white/20 text-foreground/70 hover:bg-black/5 dark:hover:bg-white/5"
          }`}
        >
          💵 Efectivo
        </button>
      </div>

      {/* Monto e Ingreso de Fecha */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-foreground/60">Monto pagado ($)</label>
          <input
            type="number"
            min="1"
            placeholder="Ej: 15000"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full border border-black/15 dark:border-white/20 rounded-xl px-3 py-2 bg-transparent text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-foreground/50"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-foreground/60">Fecha del pago</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full border border-black/15 dark:border-white/20 rounded-xl px-3 py-2 bg-transparent text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-foreground/50"
          />
        </div>
      </div>

      {/* Observaciones o Notas */}
      <div className="flex flex-col gap-1">
        <label className="text-xs text-foreground/60">Notas u observaciones (opcional)</label>
        <input
          type="text"
          placeholder="Ej: Nro de comprobante MP, parcialidad..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full border border-black/15 dark:border-white/20 rounded-xl px-3 py-2 bg-transparent text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-foreground/50"
        />
      </div>

      {/* Botón Guardar */}
      <div className="flex justify-end pt-2 border-t border-black/10 dark:border-white/10">
        <button
          type="submit"
          disabled={createMovement.isPending || !amount || parseFloat(amount) <= 0}
          className="h-10 px-5 rounded-full bg-emerald-600 text-white font-medium text-sm transition-colors hover:bg-emerald-700 disabled:opacity-50"
        >
          {createMovement.isPending ? "Guardando..." : "Confirmar Pago"}
        </button>
      </div>
    </form>
  );
}
