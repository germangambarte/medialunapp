import { Link, useNavigate } from "react-router";
import { SaleForm } from "../components/sale-form";

export default function SalePage() {
  const navigate = useNavigate();

  return (
    <main className="w-full max-w-2xl mx-auto min-h-screen px-4 py-6 pb-28">
      <header className="flex flex-col gap-1 mb-5">
        <Link
          to="/comidas"
          className="inline-flex items-center gap-1.5 text-xs text-foreground/60 hover:text-foreground transition-colors"
        >
          ← Volver a la Caja
        </Link>
        <h1 className="text-2xl font-bold text-foreground mt-1">
          Nueva Venta
        </h1>
      </header>

      <div className="border border-black/10 dark:border-white/10 rounded-3xl p-4 bg-black/[0.02] dark:bg-white/[0.02]">
        <SaleForm onSuccess={() => navigate("/comidas")} />
      </div>
    </main>
  );
}
