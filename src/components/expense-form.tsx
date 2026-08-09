import { useState } from "react";
import { useCreateExpense } from "../hooks/useExpenses";
import { todayISO } from "../lib/format";

export function ExpenseForm({ onSuccess }: { onSuccess?: () => void }) {
  const createExpense = useCreateExpense();

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(todayISO());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const numericAmount = parseFloat(amount);
    if (!description.trim() || isNaN(numericAmount) || numericAmount <= 0) {
      alert("Completá la descripción y un monto válido");
      return;
    }

    createExpense.mutate(
      { description: description.trim(), amount: numericAmount, date },
      {
        onSuccess: () => {
          setDescription("");
          setAmount("");
          if (onSuccess) onSuccess();
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-foreground/60">Descripción del gasto</label>
          <input
            type="text"
            placeholder="Ej: Masa para pizzas, gaseosas, delivery..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border border-black/15 dark:border-white/20 rounded-xl px-3 py-2 bg-transparent text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-foreground/50"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-foreground/60">Monto ($)</label>
            <input
              type="number"
              min="1"
              placeholder="Ej: 5000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full border border-black/15 dark:border-white/20 rounded-xl px-3 py-2 bg-transparent text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-foreground/50"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-foreground/60">Fecha</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border border-black/15 dark:border-white/20 rounded-xl px-3 py-2 bg-transparent text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-foreground/50"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-2 border-t border-black/10 dark:border-white/10">
        <button
          type="submit"
          disabled={createExpense.isPending || !description.trim() || !amount || parseFloat(amount) <= 0}
          className="h-10 px-5 rounded-full bg-emerald-600 text-white font-medium text-sm transition-colors hover:bg-emerald-700 disabled:opacity-50"
        >
          {createExpense.isPending ? "Guardando..." : "Registrar Gasto"}
        </button>
      </div>
    </form>
  );
}
