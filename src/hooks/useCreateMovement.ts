import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";

export interface CreateMovementPayload {
  client_id: string;
  type: "pedido_facturas" | "pedido_medialunas" | "pago";
  amount: number;
  dozens?: number;
  units?: number;
  unit_price_per_dozen?: number;
  payment_method?: "efectivo" | "transferencia";
  notes?: string;
  date: string;
}

export function useCreateMovement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateMovementPayload) => {
      const { data, error } = await supabase
        .from("movements")
        .insert([payload])
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: (_, variables) => {
      // Invalida el detalle del cliente específico para refrescar su saldo e historial al instante
      queryClient.invalidateQueries({
        queryKey: ["client-details", variables.client_id],
      });
      // Invalida el resumen de clientes del inicio por si volvemos a la Home
      queryClient.invalidateQueries({
        queryKey: ["clients-summary"],
      });
    },
  });
}
