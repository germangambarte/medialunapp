import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";

export interface SaleItem {
  name: string;
  unit_price: number;
  qty: number;
}

export interface Sale {
  id: string;
  customer: string | null;
  date: string;
  total: number;
  paid: boolean;
  payment_method: "efectivo" | "transferencia" | null;
  notes: string | null;
  items: SaleItem[];
  created_at: string;
}

export interface CreateSalePayload {
  customer?: string;
  date: string;
  total: number;
  paid: boolean;
  payment_method?: "efectivo" | "transferencia";
  notes?: string;
  items: SaleItem[];
}

export function useSales() {
  return useQuery({
    queryKey: ["sales"],
    queryFn: async (): Promise<Sale[]> => {
      const { data, error } = await supabase
        .from("sales")
        .select("*")
        .order("date", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw new Error(error.message);
      return (data ?? []).map((sale) => ({
        ...sale,
        total: Number(sale.total),
        items: sale.items ?? [],
      }));
    },
  });
}

export function useCreateSale() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateSalePayload) => {
      const { data, error } = await supabase
        .from("sales")
        .insert([payload])
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
    },
  });
}

export function useDeleteSale() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("sales").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
    },
  });
}

export function useCollectSale() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      payment_method,
    }: {
      id: string;
      payment_method: "efectivo" | "transferencia";
    }) => {
      const { data, error } = await supabase
        .from("sales")
        .update({ paid: true, payment_method })
        .eq("id", id)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
    },
  });
}
