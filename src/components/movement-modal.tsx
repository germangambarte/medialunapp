import { useState } from "react";
import type { Movement } from "../hooks/useClientDetails";
import { useUpdateMovement } from "../hooks/useUpdateMovement";

interface MovementModalProps {
  movement: Movement;
  onClose: () => void;
}

export function MovementModal({ movement, onClose }: MovementModalProps) {
  const updateMovement = useUpdateMovement();

  const isPayment = movement.type === "pago";

  const [type, setType] = useState<"pedido_facturas" | "pedido_medialunas">(
    movement.type === "pedido_medialunas" ? "pedido_medialunas" : "pedido_facturas",
  );
  const [dozens, setDozens] = useState<number>(Number(movement.dozens) || 0);
  const [units, setUnits] = useState<number>(Number(movement.units) || 0);
  const [pricePerDozen, setPricePerDozen] = useState<number>(
    Number(movement.unit_price_per_dozen) || 3600,
  );
  const [amount, setAmount] = useState<string>(
    isPayment ? String(Number(movement.amount)) : "",
  );
  const [paymentMethod, setPaymentMethod] = useState<"efectivo" | "transferencia">(
    (movement.payment_method as "efectivo" | "transferencia") || "transferencia",
  );
  const [notes, setNotes] = useState<string>(movement.notes ?? "");
  const [date, setDate] = useState<string>(movement.date);

  const unitPrice = pricePerDozen > 0 ? pricePerDozen / 12 : 0;
  const orderTotal = Math.round(dozens * pricePerDozen + units * unitPrice);
  const paymentTotal = parseFloat(amount);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload =
      movement.type === "pago"
        ? {
            id: movement.id,
            client_id: movement.client_id,
            type: "pago" as const,
            amount: paymentTotal,
            payment_method: paymentMethod,
            notes: notes.trim() || undefined,
            date,
          }
        : {
            id: movement.id,
            client_id: movement.client_id,
            type,
            dozens,
            units,
            unit_price_per_dozen: pricePerDozen,
            amount: orderTotal,
            notes: notes.trim() || undefined,
            date,
          };

    if (movement.type === "pago" && (isNaN(paymentTotal) || paymentTotal <= 0)) {
      alert("Ingresá un monto válido mayor a 0");
      return;
    }
    if (movement.type !== "pago" && orderTotal <= 0) {
      alert("El total del pedido debe ser mayor a 0");
      return;
    }

    updateMovement.mutate(payload, {
      onSuccess: onClose,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-3xl border border-black/10 dark:border-white/10 dark:bg-black bg-white p-6 shadow-2xl flex flex-col gap-5 text-black dark:text-white max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">{isPayment ? "💵" : "🧾"}</span>
            <h2 className="text-base font-bold">
              {isPayment ? "Editar Pago" : "Editar Pedido"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10 text-black/60 dark:text-white/60 transition-colors"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {isPayment ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-black/60 dark:text-white/60">
                    Monto pagado ($)
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Ej: 15000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full border border-black/15 dark:border-white/20 rounded-xl px-3 py-2 bg-transparent text-black dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-foreground/50"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs text-black/60 dark:text-white/60">
                    Fecha del pago
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full border border-black/15 dark:border-white/20 rounded-xl px-3 py-2 bg-transparent text-black dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-foreground/50"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-black/60 dark:text-white/60">
                  Método de pago
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("transferencia")}
                    className={`py-2 px-3 rounded-xl text-xs font-medium border transition-all ${
                      paymentMethod === "transferencia"
                        ? "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white font-semibold"
                        : "border-black/15 dark:border-white/20 text-black/70 dark:text-white/70 hover:bg-black/5 dark:hover:bg-white/5"
                    }`}
                  >
                    💳 Transferencia
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("efectivo")}
                    className={`py-2 px-3 rounded-xl text-xs font-medium border transition-all ${
                      paymentMethod === "efectivo"
                        ? "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white font-semibold"
                        : "border-black/15 dark:border-white/20 text-black/70 dark:text-white/70 hover:bg-black/5 dark:hover:bg-white/5"
                    }`}
                  >
                    💵 Efectivo
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setType("pedido_medialunas")}
                  className={`py-2 px-3 rounded-xl text-xs font-medium border transition-all ${
                    type === "pedido_medialunas"
                      ? "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white font-semibold"
                      : "border-black/15 dark:border-white/20 text-black/70 dark:text-white/70 hover:bg-black/5 dark:hover:bg-white/5"
                  }`}
                >
                  🥐 Medialunas
                </button>
                <button
                  type="button"
                  onClick={() => setType("pedido_facturas")}
                  className={`py-2 px-3 rounded-xl text-xs font-medium border transition-all ${
                    type === "pedido_facturas"
                      ? "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white font-semibold"
                      : "border-black/15 dark:border-white/20 text-black/70 dark:text-white/70 hover:bg-black/5 dark:hover:bg-white/5"
                  }`}
                >
                  🍩 Facturas
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-black/60 dark:text-white/60">
                    Docenas
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={dozens}
                    onChange={(e) => setDozens(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full border border-black/15 dark:border-white/20 rounded-xl px-3 py-2 bg-transparent text-black dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-foreground/50"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-black/60 dark:text-white/60">
                    Unidades sueltas
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={units}
                    onChange={(e) => setUnits(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full border border-black/15 dark:border-white/20 rounded-xl px-3 py-2 bg-transparent text-black dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-foreground/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-black/60 dark:text-white/60">
                    Precio / Docena ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={pricePerDozen}
                    onChange={(e) =>
                      setPricePerDozen(Math.max(0, parseInt(e.target.value) || 0))
                    }
                    className="w-full border border-black/15 dark:border-white/20 rounded-xl px-3 py-2 bg-transparent text-black dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-foreground/50"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-black/60 dark:text-white/60">
                    Fecha del pedido
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full border border-black/15 dark:border-white/20 rounded-xl px-3 py-2 bg-transparent text-black dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-foreground/50"
                  />
                </div>
              </div>
            </>
          )}

          <div className="flex flex-col gap-1">
            <label className="text-xs text-black/60 dark:text-white/60">
              Notas (opcional)
            </label>
            <input
              type="text"
              placeholder="Ej: Nro de comprobante, parcialidad..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full border border-black/15 dark:border-white/20 rounded-xl px-3 py-2 bg-transparent text-black dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-foreground/50"
            />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-black/10 dark:border-white/10">
            <div>
              <span className="text-xs text-black/50 dark:text-white/50 block">Total</span>
              <span className="text-lg font-bold text-black dark:text-white">
                {isPayment
                  ? `$${isNaN(paymentTotal) ? 0 : paymentTotal.toLocaleString("es-AR")}`
                  : `$${orderTotal.toLocaleString("es-AR")}`}
              </span>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="h-10 px-4 rounded-full border border-black/15 dark:border-white/20 text-black/80 dark:text-white/80 font-medium text-sm"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={updateMovement.isPending}
                className="h-10 px-5 rounded-full bg-emerald-600 text-white font-medium text-sm transition-colors hover:bg-emerald-700 disabled:opacity-50"
              >
                {updateMovement.isPending ? "Guardando..." : "Guardar Cambios"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
