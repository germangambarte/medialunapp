import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";

export interface Movement {
  id: string;
  client_id: string;
  type: "pedido_facturas" | "pedido_medialunas" | "pago";
  amount: number;
  dozens: number;
  units: number;
  unit_price_per_dozen?: number;
  payment_method?: string;
  notes?: string;
  date: string;
  created_at: string;
}

export interface ClientDetails {
  id: string;
  name: string;
  totalDebt: number;
  movements: Movement[];
}

export function useClientDetails(clientId: string) {
  return useQuery({
    queryKey: ["client-details", clientId],
    enabled: Boolean(clientId),
    queryFn: async (): Promise<ClientDetails> => {
      // 1. Obtener datos del cliente
      const { data: client, error: clientError } = await supabase
        .from("clients")
        .select("id, name")
        .eq("id", clientId)
        .single();

      if (clientError) throw new Error(clientError.message);

      // 2. Obtener movimientos del cliente
      const { data: movements, error: movementsError } = await supabase
        .from("movements")
        .select("*")
        .eq("client_id", clientId)
        .order("date", { ascending: false })
        .order("created_at", { ascending: false });

      if (movementsError) throw new Error(movementsError.message);

      const movList = (movements || []) as Movement[];

      // 3. Calcular deuda total
      const totalDebt = movList.reduce((acc, mov) => {
        if (mov.type === "pago") {
          return acc - Number(mov.amount);
        }
        return acc + Number(mov.amount);
      }, 0);

      return {
        id: client.id,
        name: client.name,
        totalDebt,
        movements: movList,
      };
    },
  });
}
