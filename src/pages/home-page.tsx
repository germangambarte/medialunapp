import { Link } from "react-router";
import { useAuth } from "../hooks/useAuth";

export default function HomePage() {
  const { logout } = useAuth();

  return (
    <main className="w-full max-w-2xl mx-auto min-h-screen px-4 py-8 flex flex-col gap-8">
      {/* Encabezado */}
      <header className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src="/croissant-colored.png"
            alt="icono de medialuna coloreada"
            className="w-10"
          />
          <h1 className="text-2xl font-bold text-foreground">Medialunapp</h1>
        </div>
        <button
          onClick={logout}
          className="text-sm text-foreground/50 hover:text-red-500 transition-colors"
        >
          Cerrar sesión
        </button>
      </header>

      <p className="text-sm text-foreground/60 -mt-4">
        ¿Qué querés gestionar hoy?
      </p>

      {/* Menú principal */}
      <nav className="flex flex-col gap-4">
        <Link
          to="/comidas"
          className="group flex items-center gap-4 p-6 rounded-3xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02] hover:bg-black/5 dark:hover:bg-white/5 transition-all"
        >
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-foreground/5 text-3xl shrink-0">
            🍕
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-lg font-bold text-foreground">
              Ventas de Comidas
            </span>
            <span className="text-sm text-foreground/60">
              Pizzas y hamburguesas: caja, ventas, gastos y fiado
            </span>
          </div>
          <span className="text-foreground/30 group-hover:text-foreground/60 transition-colors">
            →
          </span>
        </Link>

        <Link
          to="/mayorista"
          className="group flex items-center gap-4 p-6 rounded-3xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02] hover:bg-black/5 dark:hover:bg-white/5 transition-all"
        >
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-foreground/5 text-3xl shrink-0">
            🥐
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-lg font-bold text-foreground">
              Medialunas por Mayor
            </span>
            <span className="text-sm text-foreground/60">
              Clientes, pedidos de facturas y medialunas, cuenta corriente
            </span>
          </div>
          <span className="text-foreground/30 group-hover:text-foreground/60 transition-colors">
            →
          </span>
        </Link>
      </nav>
    </main>
  );
}
