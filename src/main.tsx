import { createRoot } from "react-dom/client";
import "./index.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { StrictMode } from "react";
import { BrowserRouter, Routes, Route } from "react-router";
import HomePage from "./pages/home-page";
import { ClientsManager } from "./pages/clients-manager";
import ClientDashboardPage from "./pages/client-dashboard-page";
import { ProtectedRoute } from "./components/protected-route";
import LoginPage from "./pages/login-page";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/cliente/:id" element={<ClientDashboardPage />} />
            <Route path="/clientes" element={<ClientsManager />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </StrictMode>,
);
