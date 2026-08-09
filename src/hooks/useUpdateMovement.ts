import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";

export type MovementUpdatePayload = Partial<{
  type: "pedido_facturas" | "pedido_medialunas" | "pago";
  amount: number;
  dozens: number;
  units: number;
  unit_price_per_dozen: number;
  payment_method: "efectivo" | "transferencia";
  notes: string;
  date: string;
}>;

export function useUpdateMovement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...payload
    }: { id: string; client_id: string } & MovementUpdatePayload) => {
      const { data, error } = await supabase
        .from("movements")
        .update(payload)
        .eq("id", id)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["client-details", variables.client_id],
      });
      queryClient.invalidateQueries({
        queryKey: ["clients-summary"],
      });
    },
  });
}
