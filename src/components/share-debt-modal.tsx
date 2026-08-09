import { useState } from "react";
import type { Movement } from "../hooks/useClientDetails";

interface ShareDebtModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientName: string;
  totalDebt: number;
  movements: Movement[];
}

interface PendingOrder {
  movement: Movement;
  pendingBalance: number;
  paidForOrder: number;
  isPartial: boolean;
}

const MONEY = (n: number) => `$${Math.round(n).toLocaleString("es-AR")}`;

function orderQty(movement: Movement) {
  const dozens = movement.dozens > 0 ? `${movement.dozens} docena${movement.dozens > 1 ? "s" : ""}` : "";
  const units = movement.units > 0 ? `${movement.units} unidad${movement.units > 1 ? "es" : ""}` : "";
  return [dozens, units].filter(Boolean).join(" y ");
}

function formatDate(isoDate: string) {
  return new Date(isoDate + "T00:00:00").toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function ShareDebtModal({
  isOpen,
  onClose,
  clientName,
  totalDebt,
  movements,
}: ShareDebtModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // --------------------------------------------------------------------------
  // LÓGICA FIFO PARA DETECTAR PEDIDOS PENDIENTES
  // --------------------------------------------------------------------------

  // 1. Calcular el total acumulado de pagos realizados por el cliente
  const totalPaid = movements
    .filter((m) => m.type === "pago")
    .reduce((sum, m) => sum + Number(m.amount), 0);

  // 2. Filtrar solo los pedidos y ordenarlos desde el MÁS ANTIGUO al MÁS NUEVO
  const ordersOldestFirst = movements
    .filter((m) => m.type !== "pago")
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // 3. Absorber el dinero pagado contra los pedidos más antiguos
  let pool = totalPaid;
  const pendingOrders: PendingOrder[] = [];

  for (const order of ordersOldestFirst) {
    const orderAmount = Number(order.amount);

    if (pool >= orderAmount) {
      // El pago cubre completamente este pedido
      pool -= orderAmount;
    } else if (pool > 0) {
      // El pago cubre parcialmente este pedido
      const paidForOrder = pool;
      pendingOrders.push({
        movement: order,
        pendingBalance: orderAmount - pool,
        paidForOrder,
        isPartial: true,
      });
      pool = 0;
    } else {
      // No hay pagos aplicables, el pedido está 100% pendiente
      pendingOrders.push({
        movement: order,
        pendingBalance: orderAmount,
        paidForOrder: 0,
        isPartial: false,
      });
    }
  }

  // --------------------------------------------------------------------------
  // CONSTRUCCIÓN DEL MENSAJE EN LENGUAJE CLARO
  // --------------------------------------------------------------------------

  const today = new Date().toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const messageLines = [
    `Hola ${clientName}! 👋`,
    ``,
    `Te paso la cuenta al día de hoy (${today}):`,
    ``,
  ];

  if (pendingOrders.length > 0 && totalDebt > 0) {
    messageLines.push(`💰 *Total a abonar: ${MONEY(totalDebt)}*`, ``);
    messageLines.push(`Detalle de lo que falta pagar:`, ``);

    const newestFirst = [...pendingOrders].reverse();
    newestFirst.forEach(({ movement, pendingBalance, paidForOrder, isPartial }) => {
      const product = movement.type === "pedido_facturas" ? "Facturas" : "Medialunas";
      const qty = orderQty(movement);
      const line = `• ${formatDate(movement.date)} — ${product}${qty ? ` (${qty})` : ""}`;

      if (isPartial) {
        messageLines.push(
          line,
          `    Falta pagar: *${MONEY(pendingBalance)}*`,
          `    (el pedido era de ${MONEY(
            Number(movement.amount),
          )} y ya abonaste ${MONEY(paidForOrder)})`,
          ``
        );
      } else {
        messageLines.push(line, `    Falta pagar: *${MONEY(pendingBalance)}*`, ``);
      }
    });

  } else {
    messageLines.push(
      `✅ *Tu cuenta está al día!*`,
      `No tenés deudas pendientes.`,
      ``,
      `¡Gracias! 🙌`,
    );
  }

  const fullMessage = messageLines.join("\n").trim();

  // Handlers
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Error al copiar:", err);
    }
  };

  const handleWhatsAppShare = () => {
    const encodedText = encodeURIComponent(fullMessage);
    window.open(`https://wa.me/?text=${encodedText}`, "_blank");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-3xl border border-black/10 dark:border-white/10 dark:bg-black bg-white p-6 shadow-2xl flex flex-col gap-5 text-black dark:text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Encabezado */}
        <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">📤</span>
            <h2 className="text-base font-bold">Compartir Estado de Cuenta</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10 text-black/60 dark:text-white/60 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Vista previa del mensaje */}
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-black/60 dark:text-white/60 uppercase tracking-wider">
            Vista previa del mensaje
          </span>
          <pre className="w-full max-h-60 overflow-y-auto whitespace-pre-wrap rounded-2xl border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.03] p-4 text-xs font-mono text-black/90 dark:text-white/90 leading-relaxed select-all">
            {fullMessage}
          </pre>
        </div>

        {/* Botones de Acción */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={handleCopy}
            className="h-11 px-4 rounded-full border border-black/15 dark:border-white/20 font-medium text-xs hover:bg-black/5 dark:hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
          >
            {copied ? "✓ Copiado" : "📋 Copiar Texto"}
          </button>

          <button
            type="button"
            onClick={handleWhatsAppShare}
            className="h-11 px-4 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            💬 Enviar por WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
}
