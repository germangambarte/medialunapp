import { useState } from "react";
import { Link, useParams } from "react-router";
import { useClientDetails } from "../hooks/useClientDetails";
import { ActivityItem } from "../components/activity-item";
// Importa tus componentes de formularios cuando los tengas listos
import { NewOrderForm } from "../components/new-order-form";
import { NewPaymentForm } from "../components/new-payment-form";
import { ShareDebtModal } from "../components/share-debt-modal";

export default function ClientDashboardPage() {
  const { id } = useParams<{ id: string }>();
  const clientId = id || "";

  const {
    data: client,
    isLoading,
    isError,
    error,
  } = useClientDetails(clientId);

  const [newOrderFormToggle, setNewOrderFormToggle] = useState(false);
  const [newPaymentFormToggle, setNewPaymentFormToggle] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  function toggleNewOrder() {
    if (newPaymentFormToggle) setNewPaymentFormToggle(false);
    setNewOrderFormToggle((prev) => !prev);
  }

  function toggleNewPayment() {
    if (newOrderFormToggle) setNewOrderFormToggle(false);
    setNewPaymentFormToggle((prev) => !prev);
  }

  if (isLoading) {
    return (
      <main className="w-full max-w-2xl mx-auto min-h-screen px-4 py-8 flex justify-center items-center">
        <p className="text-foreground/60 animate-pulse">
          Cargando estado de cuenta...
        </p>
      </main>
    );
  }

  if (isError || !client) {
    return (
      <main className="w-full max-w-2xl mx-auto min-h-screen px-4 py-8">
        <p className="text-red-500">
          Error: {error ? (error as Error).message : "Cliente no encontrado"}
        </p>
        <Link to="/" className="text-sm underline mt-4 inline-block">
          Volver al inicio
        </Link>
      </main>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto min-h-screen px-4 py-6 pb-28 flex flex-col gap-6">
      {/* Top Bar: Volver y Compartir */}
      <div className="flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center text-xs font-medium text-foreground/60 hover:text-foreground transition-colors"
        >
          ← Volver a clientes
        </Link>

        <button
          type="button"
          onClick={() => setIsShareModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-xs font-semibold text-foreground transition-all cursor-pointer"
        >
          <span>📤</span> Compartir estado
        </button>
      </div>

      {/* Hero Display de Deuda */}
      <section className="relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br from-black/[0.04] to-black/[0.01] dark:from-white/[0.08] dark:to-white/[0.02] border border-black/10 dark:border-white/10 shadow-sm flex flex-col items-center text-center gap-2">
        <span className="text-xs font-semibold tracking-wider uppercase text-foreground/50">
          Estado de Cuenta • {client.name}
        </span>

        <div className="flex items-baseline gap-1 my-1">
          <span className="text-2xl font-bold text-foreground/60">$</span>
          <h1 className="text-5xl font-extrabold tracking-tight text-foreground">
            {client.totalDebt.toLocaleString("es-AR")}
          </h1>
        </div>

        <div
          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
            client.totalDebt > 0
              ? "bg-red-500/10 text-red-600 dark:text-red-400"
              : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              client.totalDebt > 0
                ? "bg-red-500 animate-pulse"
                : "bg-emerald-500"
            }`}
          />
          {client.totalDebt > 0
            ? "Saldo pendiente de pago"
            : "Al día / Sin deuda"}
        </div>
      </section>

      {newOrderFormToggle && (
        <div className="border border-black/10 dark:border-white/10 rounded-3xl p-4 bg-black/[0.02] dark:bg-white/[0.02]">
          <NewOrderForm
            clientId={clientId}
            onSuccess={() => setNewOrderFormToggle(false)}
          />
        </div>
      )}

      {newPaymentFormToggle && (
        <div className="border border-black/10 dark:border-white/10 rounded-3xl p-4 bg-black/[0.02] dark:bg-white/[0.02]">
          <NewPaymentForm
            clientId={clientId}
            onSuccess={() => setNewPaymentFormToggle(false)}
          />
        </div>
      )}

      {/* Historial de Actividad / Movimientos */}
      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-foreground/70 px-1">
          Historial de Movimientos
        </h2>

        {client.movements.length > 0 ? (
          <div className="flex flex-col gap-1">
            {client.movements.map((mov) => (
              <ActivityItem key={mov.id} movement={mov} />
            ))}
          </div>
        ) : (
          <p className="text-center text-sm text-foreground/50 py-8">
            Aún no hay movimientos registrados para este cliente.
          </p>
        )}
      </section>

      {/* Barra fija inferior */}
      <div className="fixed bottom-0 left-0 right-0 z-40 flex w-full max-w-2xl mx-auto gap-4 p-4 text-base font-medium backdrop-blur-md bg-white/70 dark:bg-black/70 border-t border-black/5 dark:border-white/10">
        <button
          type="button"
          className="flex h-12 w-full items-center justify-center gap-2 rounded-full border border-black/15 bg-white px-5 text-black font-medium transition-colors hover:bg-white/90 cursor-pointer"
          onClick={toggleNewOrder}
        >
          Nuevo Pedido
        </button>
        <button
          type="button"
          className="flex h-12 w-full items-center justify-center rounded-full border border-black/15 text-foreground font-medium transition-colors hover:bg-black/5 dark:border-white/20 dark:hover:bg-white/10 cursor-pointer"
          onClick={toggleNewPayment}
        >
          Nuevo Pago
        </button>
      </div>

      <ShareDebtModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        clientName={client.name}
        totalDebt={client.totalDebt}
        movements={client.movements}
      />
    </div>
  );
}
