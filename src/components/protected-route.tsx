import { Navigate, Outlet } from "react-router";
import { useAuth } from "../hooks/useAuth";

export function ProtectedRoute() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <main className="w-full max-w-2xl mx-auto min-h-screen px-4 py-8 flex justify-center items-center">
        <p className="text-foreground/60 animate-pulse">Verificando sesión...</p>
      </main>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
