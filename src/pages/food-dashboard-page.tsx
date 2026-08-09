import { useState } from "react";
import { Link } from "react-router";
import { useSales, useDeleteSale, useCollectSale } from "../hooks/useSales";
import { useExpenses, useDeleteExpense } from "../hooks/useExpenses";
import { ExpenseForm } from "../components/expense-form";
import { formatMoney, formatDate, todayISO } from "../lib/format";

type TxKind = "sale" | "expense";

interface Tx {
  id: string;
  kind: TxKind;
  title: string;
  subtitle?: string;
  date: string;
  signed: number;
  paid: boolean;
  saleId?: string;
}

export default function FoodDashboardPage() {
  const { data: sales, isPending: salesPending } = useSales();
  const { data: expenses, isPending: expensesPending } = useExpenses();
  const deleteSale = useDeleteSale();
  const deleteExpense = useDeleteExpense();
  const collectSale = useCollectSale();

  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [filter, setFilter] = useState<"hoy" | "todo">("hoy");
  const [collectingId, setCollectingId] = useState<string | null>(null);

  const today = todayISO();

  const salesList = sales ?? [];
  const expensesList = expenses ?? [];

  // Resumen del día
  const paidToday = salesList
    .filter((s) => s.paid && s.date === today)
    .reduce((acc, s) => acc + Number(s.total), 0);
  const expensesToday = expensesList
    .filter((e) => e.date === today)
    .reduce((acc, e) => acc + Number(e.amount), 0);
  const balanceToday = paidToday - expensesToday;
  const pendingDebt = salesList
    .filter((s) => !s.paid)
    .reduce((acc, s) => acc + Number(s.total), 0);

  // Fiado pendiente
  const pendingSales = salesList.filter((s) => !s.paid);

  // Historial unificado
  const transactions: Tx[] = [
    ...salesList.map((s) => ({
      id: s.id,
      kind: "sale" as const,
      title:
        s.customer ||
        s.items.map((i) => `${i.qty} ${i.name}`).join(", ") ||
        "Venta",
      subtitle: s.items.map((i) => `${i.qty} ${i.name}`).join(", "),
      date: s.date,
      signed: s.paid ? Number(s.total) : 0,
      paid: s.paid,
      saleId: s.id,
    })),
    ...expensesList.map((e) => ({
      id: e.id,
      kind: "expense" as const,
      title: e.description,
      date: e.date,
      signed: -Number(e.amount),
      paid: true,
    })),
  ];

  const filteredTx = transactions.filter(
    (tx) => filter === "todo" || tx.date === today
  );

  const sortedAsc = [...transactions].sort(
    (a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime() ||
      a.signed - b.signed
  );

  const cumulative = new Map<string, number>();
  let running = 0;
  for (const tx of sortedAsc) {
    running += tx.signed;
    cumulative.set(tx.id, running);
  }

  const sortedDesc = [...filteredTx].sort(
    (a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime() ||
      b.signed - a.signed
  );

  if (salesPending || expensesPending) {
    return (
      <main className="w-full max-w-2xl mx-auto min-h-screen px-4 py-8 flex justify-center items-center">
        <p className="text-foreground/60 animate-pulse">Cargando caja...</p>
      </main>
    );
  }

  const handleCollect = (saleId: string, method: "efectivo" | "transferencia") => {
    collectSale.mutate({ id: saleId, payment_method: method });
    setCollectingId(null);
  };

  return (
    <main className="w-full max-w-2xl mx-auto min-h-screen px-4 py-6 pb-28 flex flex-col gap-6">
      {/* Encabezado */}
      <header className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs text-foreground/60 hover:text-foreground transition-colors"
          >
            ← Inicio
          </Link>
          <h1 className="text-2xl font-bold text-foreground mt-1">🍕 Caja de Comidas</h1>
          <p className="text-xs text-foreground/50">
            Ventas, gastos y fiado del negocio de pizzas y hamburguesas
          </p>
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0 pt-6">
          <Link
            to="/comidas/venta"
            className="flex items-center gap-1.5 h-10 px-4 rounded-full bg-emerald-600 text-white font-medium text-sm transition-colors hover:bg-emerald-700"
          >
            Nueva Venta
          </Link>
          <Link
            to="/comidas/productos"
            className="flex items-center gap-1.5 h-10 px-4 rounded-full border border-black/15 dark:border-white/20 text-foreground text-sm font-medium transition-colors hover:bg-black/5 dark:hover:bg-white/5"
          >
            Productos
          </Link>
        </div>
      </header>

      {/* Resumen del día */}
      <section className="grid grid-cols-2 gap-3">
        <div className="p-4 rounded-2xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02]">
          <span className="text-xs text-foreground/60 block">Ventas cobradas hoy</span>
          <span className="text-xl font-extrabold text-foreground">
            {formatMoney(paidToday)}
          </span>
        </div>
        <div className="p-4 rounded-2xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02]">
          <span className="text-xs text-foreground/60 block">Gastos hoy</span>
          <span className="text-xl font-extrabold text-red-500 dark:text-red-400">
            {formatMoney(expensesToday)}
          </span>
        </div>
        <div className="p-4 rounded-2xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02]">
          <span className="text-xs text-foreground/60 block">Saldo del día</span>
          <span
            className={`text-xl font-extrabold ${
              balanceToday >= 0
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-red-500 dark:text-red-400"
            }`}
          >
            {formatMoney(balanceToday)}
          </span>
        </div>
        <div className="p-4 rounded-2xl border border-red-500/20 bg-red-500/5">
          <span className="text-xs text-red-500/70 block">Fiado pendiente</span>
          <span className="text-xl font-extrabold text-red-600 dark:text-red-400">
            {formatMoney(pendingDebt)}
          </span>
        </div>
      </section>

      {/* Fiado pendiente de cobro */}
      {pendingSales.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold text-foreground/70 px-1">
            Fiado pendiente de cobro
          </h2>
          <div className="flex flex-col gap-2">
            {pendingSales.map((sale) => (
              <div
                key={sale.id}
                className="flex items-center justify-between p-3 rounded-2xl border border-red-500/20 bg-red-500/5"
              >
                <div className="min-w-0 pr-2">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {sale.customer || "Sin nombre"}
                  </p>
                  <p className="text-xs text-foreground/60 truncate">
                    {formatDate(sale.date)} •{" "}
                    {sale.items.map((i) => `${i.qty} ${i.name}`).join(", ")}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-sm font-bold text-red-600 dark:text-red-400">
                    {formatMoney(Number(sale.total))}
                  </span>

                  {collectingId === sale.id ? (
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => handleCollect(sale.id, "efectivo")}
                        disabled={collectSale.isPending}
                        className="px-2.5 py-1.5 rounded-full bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700 disabled:opacity-50"
                      >
                        Efectivo
                      </button>
                      <button
                        onClick={() => handleCollect(sale.id, "transferencia")}
                        disabled={collectSale.isPending}
                        className="px-2.5 py-1.5 rounded-full bg-foreground text-background text-xs font-medium hover:bg-foreground/90 disabled:opacity-50"
                      >
                        Transf.
                      </button>
                      <button
                        onClick={() => setCollectingId(null)}
                        className="px-2.5 py-1.5 rounded-full border border-black/15 dark:border-white/20 text-foreground/70 text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setCollectingId(sale.id)}
                      className="px-3 py-1.5 rounded-full bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700 transition-colors"
                    >
                      Cobrar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Registrar gasto */}
      <section className="border border-black/10 dark:border-white/10 rounded-3xl p-4 bg-black/[0.02] dark:bg-white/[0.02] flex flex-col gap-3">
        <button
          type="button"
          onClick={() => setShowExpenseForm((prev) => !prev)}
          className="flex items-center justify-between text-sm font-semibold text-foreground"
        >
          <span>💸 Registrar gasto</span>
          <span className="text-foreground/50">{showExpenseForm ? "−" : "+"}</span>
        </button>
        {showExpenseForm && <ExpenseForm onSuccess={() => setShowExpenseForm(false)} />}
      </section>

      {/* Historial */}
      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-semibold text-foreground/70">Historial</h2>
          <div className="flex rounded-full border border-black/10 dark:border-white/10 overflow-hidden text-xs font-medium">
            <button
              onClick={() => setFilter("hoy")}
              className={`px-3 py-1.5 transition-colors ${
                filter === "hoy" ? "bg-foreground text-background" : "text-foreground/60"
              }`}
            >
              Hoy
            </button>
            <button
              onClick={() => setFilter("todo")}
              className={`px-3 py-1.5 transition-colors ${
                filter === "todo" ? "bg-foreground text-background" : "text-foreground/60"
              }`}
            >
              Todo
            </button>
          </div>
        </div>

        {sortedDesc.length > 0 ? (
          <div className="flex flex-col gap-1">
            {sortedDesc.map((tx) => {
              const balance = cumulative.get(tx.id) ?? 0;
              const isSale = tx.kind === "sale";

              return (
                <div
                  key={`${tx.kind}-${tx.id}`}
                  className="flex items-center justify-between w-full p-3 rounded-2xl transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex items-center justify-center shrink-0 w-9 h-9 rounded-full bg-black/5 dark:bg-white/10 text-base">
                      {isSale ? "🍕" : "💸"}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {tx.title}
                      </p>
                      <p className="text-xs text-foreground/60 truncate">
                        {formatDate(tx.date)}
                        {isSale && !tx.paid ? " • Pendiente de cobro" : ""}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-right">
                      <p
                        className={`text-sm font-bold ${
                          !isSale
                            ? "text-red-500 dark:text-red-400"
                            : tx.paid
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-foreground/40 line-through"
                        }`}
                      >
                        {isSale && !tx.paid ? "" : tx.signed > 0 ? "+" : "−"}
                        {isSale && !tx.paid ? "" : formatMoney(Math.abs(tx.signed))}
                      </p>
                      {tx.signed !== 0 && (
                        <p className="text-[10px] text-foreground/40">
                          {formatMoney(balance)}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        if (isSale) {
                          if (confirm("¿Eliminar esta venta?")) deleteSale.mutate(tx.saleId!);
                        } else {
                          if (confirm("¿Eliminar este gasto?")) deleteExpense.mutate(tx.id);
                        }
                      }}
                      className="text-xs text-foreground/30 hover:text-red-500 transition-colors"
                      title="Eliminar"
                    >
                      🗑
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-center text-sm text-foreground/50 py-8">
            No hay movimientos para mostrar.
          </p>
        )}
      </section>
    </main>
  );
}
