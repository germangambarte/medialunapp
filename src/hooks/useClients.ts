import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";

export interface Client {
  id: string;
  name: string;
  created_at: string;
}

export interface ClientsWithSummary extends Client {
  debt: number;
  lastActivityDate: string;
}

export function useClients() {
  return useQuery({
    queryKey: ["clients"],
    queryFn: async (): Promise<Client[]> => {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw new Error(error.message);

      return data ?? [];
    },
  });
}

export function useClientsWithSummary() {
  return useQuery({
    queryKey: ["clients-summary"],
    queryFn: async (): Promise<ClientsWithSummary[]> => {
      const { data, error } = await supabase
        .from("clients")
        .select(`id, name, created_at, movements (type, amount, date)`)
        .order("name", { ascending: true });
      if (error) throw new Error(error.message);

      return (data ?? []).map((client) => {
        const movements = client.movements ?? [];

        const debt = movements.reduce((acc, mov) => {
          if (mov.type === "pago") {
            return acc - Number(mov.amount);
          }
          return acc + Number(mov.amount);
        }, 0);

        let lastActivityDate = "Sin movimientos";
        if (movements.length > 0) {
          const sortedDates = movements
            .map((m) => m.date)
            .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
          const lastDate = new Date(sortedDates[0]);
          lastActivityDate = lastDate.toLocaleDateString("es-AR", {
            day: "2-digit",
            month: "2-digit",
          })
        }
        return {
          id: client.id,
          name: client.name,
          created_at:client.created_at,
          debt,
          lastActivityDate
        }
      });
    },
  });
}

export function useCreateClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      const { data, error } = await supabase
        .from("clients")
        .insert([{ name }])
        .select()
        .single();

      if (error) throw new Error(error.message);

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });
}

export function useUpdateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const { data, error } = await supabase
        .from("clients")
        .update({ name })
        .eq("id", id)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });
}

export function useDeleteClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("clients").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });
}
