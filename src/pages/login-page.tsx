import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg("Credenciales inválidas. Verifica tu email y contraseña.");
      setLoading(false);
    } else {
      navigate("/");
    }
  };

  return (
    <main className="w-full max-w-sm mx-auto min-h-screen px-4 flex flex-col justify-center items-center">
      <div className="w-full p-6 rounded-3xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02] flex flex-col gap-6 shadow-xl">
        <div className="flex flex-col gap-1 text-center">
          <h1 className="text-2xl font-bold text-foreground">Acceso Privado</h1>
          <p className="text-xs text-foreground/60">
            Ingresa tus datos para gestionar la contabilidad
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-foreground/70">
              Correo electrónico
            </label>
            <input
              type="email"
              required
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-black/15 dark:border-white/20 rounded-full px-4 py-2.5 bg-transparent text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-foreground/50 text-sm"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-foreground/70">
              Contraseña
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-black/15 dark:border-white/20 rounded-full px-4 py-2.5 bg-transparent text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-foreground/50 text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="h-11 mt-2 w-full rounded-full bg-foreground text-background font-medium text-sm transition-colors hover:bg-foreground/90 disabled:opacity-50"
          >
            {loading ? "Iniciando sesión..." : "Ingresar"}
          </button>
        </form>
      </div>
    </main>
  );
}
