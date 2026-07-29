// src/components/ActivityItem.tsx
import type { Movement } from "../hooks/useClientDetails";

const TYPE_CONFIG = {
  pedido_facturas: {
    icon: "/pastrie.png",
    alt: "Facturas",
    defaultTitle: "Pedido de Facturas",
    isExpense: true,
  },
  pedido_medialunas: {
    icon: "/croissant.png",
    alt: "Medialunas",
    defaultTitle: "Pedido de Medialunas",
    isExpense: true,
  },
  pago: {
    icon: "/money.png",
    alt: "Pago",
    defaultTitle: "Pago Recibido",
    isExpense: false,
  },
};

export const ActivityItem = ({ movement }: { movement: Movement }) => {
  const config = TYPE_CONFIG[movement.type];

  // Generar subtítulo dinámico
  let subtitle = "";
  if (movement.type === "pago") {
    const method = movement.payment_method
      ? movement.payment_method.charAt(0).toUpperCase() +
        movement.payment_method.slice(1)
      : "Efectivo";
    subtitle = movement.notes ? `${method} • ${movement.notes}` : method;
  } else {
    const dozensStr = movement.dozens > 0 ? `${movement.dozens} doc.` : "";
    const unitsStr = movement.units > 0 ? `${movement.units} un.` : "";
    subtitle = [dozensStr, unitsStr].filter(Boolean).join(" y ") || "1 docena";
  }

  // Formatear la fecha ingresada
  const formattedDate = new Date(
    movement.date + "T00:00:00",
  ).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <div className="flex items-center justify-between w-full p-3 rounded-2xl transition-colors hover:bg-black/5 dark:hover:bg-white/5">
      {/* Icono de la actividad */}
      <div className="flex items-center justify-center shrink-0 w-12 h-12 rounded-full bg-white p-2.5">
        <img
          src={config.icon}
          alt={config.alt}
          className="w-8 h-8 object-contain"
        />
      </div>

      {/* Detalle central */}
      <div className="flex-1 min-w-0 ml-3 mr-2">
        <p className="text-sm font-semibold text-foreground truncate">
          {config.defaultTitle}
        </p>
        <p className="text-xs text-foreground/60 truncate">{subtitle}</p>
      </div>

      {/* Monto y Fecha */}
      <div className="text-right shrink-0">
        <p
          className={`text-sm font-bold ${
            config.isExpense
              ? "text-foreground"
              : "text-emerald-600 dark:text-emerald-400"
          }`}
        >
          {config.isExpense ? "-" : "+"} $
          {Number(movement.amount).toLocaleString("es-AR")}
        </p>
        <p className="text-xs text-foreground/50">{formattedDate}</p>
      </div>
    </div>
  );
};
