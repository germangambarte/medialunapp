import { useState } from "react";
import { useProducts } from "../hooks/useProducts";
import { useCreateSale, type SaleItem } from "../hooks/useSales";
import { formatMoney, todayISO } from "../lib/format";

interface CustomLine {
  key: number;
  name: string;
  unit_price: number;
  qty: number;
}

export function SaleForm({ onSuccess }: { onSuccess?: () => void }) {
  const { data: products, isPending } = useProducts();
  const createSale = useCreateSale();

  const [customer, setCustomer] = useState("");
  const [date, setDate] = useState(todayISO());
  const [qtyByProduct, setQtyByProduct] = useState<Record<string, number>>({});
  const [customLines, setCustomLines] = useState<CustomLine[]>([]);
  const [customName, setCustomName] = useState("");
  const [customPrice, setCustomPrice] = useState<string>("");
  const [customQty, setCustomQty] = useState<string>("1");
  const [isFiado, setIsFiado] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"efectivo" | "transferencia">("efectivo");
  const [notes, setNotes] = useState("");

  const setQty = (id: string, qty: number) => {
    setQtyByProduct((prev) => {
      const next = { ...prev };
      if (qty <= 0) delete next[id];
      else next[id] = qty;
      return next;
    });
  };

  const addCustomLine = () => {
    const price = parseFloat(customPrice);
    const qty = parseInt(customQty) || 0;
    if (!customName.trim() || isNaN(price) || price <= 0 || qty <= 0) return;

    setCustomLines((prev) => [
      ...prev,
      { key: Date.now(), name: customName.trim(), unit_price: price, qty },
    ]);
    setCustomName("");
    setCustomPrice("");
    setCustomQty("1");
  };

  const removeCustomLine = (key: number) => {
    setCustomLines((prev) => prev.filter((line) => line.key !== key));
  };

  const selectedItems: SaleItem[] = [
    ...(products ?? [])
      .filter((p) => (qtyByProduct[p.id] ?? 0) > 0)
      .map((p) => ({ name: p.name, unit_price: p.price, qty: qtyByProduct[p.id] })),
    ...customLines.map(({ name, unit_price, qty }) => ({ name, unit_price, qty })),
  ];

  const total = selectedItems.reduce((acc, item) => acc + item.unit_price * item.qty, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedItems.length === 0 || total <= 0) {
      alert("Agregá al menos un producto a la venta");
      return;
    }

    createSale.mutate(
      {
        customer: customer.trim() || undefined,
        date,
        total,
        paid: !isFiado,
        payment_method: isFiado ? undefined : paymentMethod,
        notes: notes.trim() || undefined,
        items: selectedItems,
      },
      {
        onSuccess: () => {
          if (onSuccess) onSuccess();
        },
      }
    );
  };

  if (isPending) {
    return <p className="text-foreground/60 animate-pulse">Cargando productos...</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Cliente y fecha */}
      <div className="grid grid-cols-1 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-foreground/60">
            Cliente / quien retira (opcional)
          </label>
          <input
            type="text"
            placeholder="Ej: Cumple de Juan, María, mostrador..."
            value={customer}
            onChange={(e) => setCustomer(e.target.value)}
            className="w-full border border-black/15 dark:border-white/20 rounded-xl px-3 py-2 bg-transparent text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-foreground/50"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-foreground/60">Fecha de la venta</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full border border-black/15 dark:border-white/20 rounded-xl px-3 py-2 bg-transparent text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-foreground/50"
          />
        </div>
      </div>

      {/* Grilla de productos */}
      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-foreground border-b border-black/10 dark:border-white/10 pb-2">
          Productos del menú
        </h3>

        <div className="grid grid-cols-2 gap-2">
          {products?.map((product) => {
            const qty = qtyByProduct[product.id] ?? 0;
            const isAvailable = product.available;

            return (
              <div
                key={product.id}
                className={`p-3 rounded-2xl border transition-all flex flex-col gap-2 ${
                  !isAvailable
                    ? "border-dashed border-black/10 dark:border-white/10 opacity-50"
                    : qty > 0
                      ? "border-foreground bg-foreground/5"
                      : "border-black/10 dark:border-white/10"
                }`}
              >
                <div className="flex items-start justify-between gap-1">
                  <span className="text-xs font-semibold text-foreground leading-tight">
                    {product.name}
                  </span>
                  {!isAvailable && (
                    <span className="shrink-0 text-[10px] uppercase tracking-wide text-foreground/40">
                      Agotado
                    </span>
                  )}
                </div>
                <span className="text-sm font-bold text-foreground">
                  {formatMoney(Number(product.price))}
                </span>

                {isAvailable ? (
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setQty(product.id, qty - 1)}
                      disabled={qty === 0}
                      className="w-7 h-7 rounded-full border border-black/15 dark:border-white/20 text-sm font-bold text-foreground hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                    >
                      −
                    </button>
                    <span className="text-sm font-bold text-foreground min-w-6 text-center">
                      {qty}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQty(product.id, qty + 1)}
                      className="w-7 h-7 rounded-full border border-black/15 dark:border-white/20 text-sm font-bold text-foreground hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                    >
                      +
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-7">
                    <span className="text-[10px] text-foreground/40">
                      Sin disponibilidad
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Otra venta */}
      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-foreground border-b border-black/10 dark:border-white/10 pb-2">
          Otra venta (fuera del menú)
        </h3>

        <div className="grid grid-cols-3 gap-2">
          <input
            type="text"
            placeholder="Descripción"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            className="col-span-1 border border-black/15 dark:border-white/20 rounded-xl px-3 py-2 bg-transparent text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-foreground/50"
          />
          <input
            type="number"
            min="0"
            placeholder="Precio"
            value={customPrice}
            onChange={(e) => setCustomPrice(e.target.value)}
            className="border border-black/15 dark:border-white/20 rounded-xl px-3 py-2 bg-transparent text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-foreground/50"
          />
          <div className="flex items-center gap-1">
            <input
              type="number"
              min="1"
              placeholder="Cant."
              value={customQty}
              onChange={(e) => setCustomQty(e.target.value)}
              className="w-full border border-black/15 dark:border-white/20 rounded-xl px-3 py-2 bg-transparent text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-foreground/50"
            />
            <button
              type="button"
              onClick={addCustomLine}
              disabled={!customName.trim() || !customPrice || !customQty}
              className="h-10 w-10 shrink-0 rounded-xl bg-foreground text-background font-bold text-lg hover:bg-foreground/90 disabled:opacity-40 transition-colors"
              title="Agregar ítem"
            >
              +
            </button>
          </div>
        </div>

        {customLines.length > 0 && (
          <div className="flex flex-col gap-1.5">
            {customLines.map((line) => (
              <div
                key={line.key}
                className="flex items-center justify-between px-3 py-2 rounded-xl bg-black/5 dark:bg-white/5 text-sm"
              >
                <span className="text-foreground font-medium truncate pr-2">
                  {line.qty} × {line.name}
                </span>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-foreground font-bold">
                    {formatMoney(line.unit_price * line.qty)}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeCustomLine(line.key)}
                    className="text-xs text-foreground/40 hover:text-red-500 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Método de pago / fiado */}
      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={() => setIsFiado((prev) => !prev)}
          className={`flex items-center justify-between w-full px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
            isFiado
              ? "border-red-500/40 bg-red-500/10 text-red-600 dark:text-red-400"
              : "border-black/15 dark:border-white/20 text-foreground/80 hover:bg-black/5 dark:hover:bg-white/5"
          }`}
        >
          <span>Queda fiado / pendiente de cobro</span>
          <span
            className={`w-9 h-5 rounded-full relative transition-colors ${
              isFiado ? "bg-red-500" : "bg-black/15 dark:bg-white/20"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${
                isFiado ? "translate-x-[18px]" : "translate-x-0"
              }`}
            />
          </span>
        </button>

        {!isFiado && (
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setPaymentMethod("efectivo")}
              className={`py-2.5 px-3 rounded-xl text-xs font-medium border transition-all ${
                paymentMethod === "efectivo"
                  ? "bg-foreground text-background border-foreground font-semibold"
                  : "border-black/15 dark:border-white/20 text-foreground/70 hover:bg-black/5 dark:hover:bg-white/5"
              }`}
            >
              💵 Efectivo
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod("transferencia")}
              className={`py-2.5 px-3 rounded-xl text-xs font-medium border transition-all ${
                paymentMethod === "transferencia"
                  ? "bg-foreground text-background border-foreground font-semibold"
                  : "border-black/15 dark:border-white/20 text-foreground/70 hover:bg-black/5 dark:hover:bg-white/5"
              }`}
            >
              💳 Transferencia
            </button>
          </div>
        )}
      </div>

      {/* Notas */}
      <div className="flex flex-col gap-1">
        <label className="text-xs text-foreground/60">Notas (opcional)</label>
        <input
          type="text"
          placeholder="Ej: 30 sanguchitos para cumpleaños..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full border border-black/15 dark:border-white/20 rounded-xl px-3 py-2 bg-transparent text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-foreground/50"
        />
      </div>

      {/* Total y confirmar */}
      <div className="flex items-center justify-between pt-2 border-t border-black/10 dark:border-white/10">
        <div>
          <span className="text-xs text-foreground/60 block">Total</span>
          <span className="text-lg font-bold text-foreground">
            {formatMoney(total)}
          </span>
        </div>

        <button
          type="submit"
          disabled={createSale.isPending || selectedItems.length === 0 || total <= 0}
          className="h-11 px-5 rounded-full bg-emerald-600 text-white font-medium text-sm transition-colors hover:bg-emerald-700 disabled:opacity-50"
        >
          {createSale.isPending ? "Guardando..." : "Confirmar Venta"}
        </button>
      </div>
    </form>
  );
}
