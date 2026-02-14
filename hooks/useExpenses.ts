"use client";

import { useUserContext } from "@/context/userContext";
import { CreateExpenseDto, UpdateExpenseDto, Expense } from "@/types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

/* ===============================
   Obtener expenses de un trip
================================ */
export function useExpenses(tripId: string) {
  const { user } = useUserContext();
  
  return useQuery<Expense[]>({
    queryKey: ["expenses", tripId],
    queryFn: async () => {
      const res = await fetch(`/api/trips/${tripId}/expenses`, {
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Error fetching expenses");
      }
      
      return res.json();
    },
    enabled: !!tripId && !!user?.id,
  });
}

/* ===============================
   Crear expense
================================ */
export function useCreateExpense(tripId: string) {
  const queryClient = useQueryClient();
  const { user } = useUserContext();

  return useMutation({
    mutationFn: async (data: Omit<CreateExpenseDto, "tripId">) => {
      if (!user?.id) throw new Error("No user");
      
      const res = await fetch(`/api/trips/${tripId}/expenses`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Error creating expense");
      }
      
      return res.json();
    },
    onSuccess: (newExpense: Expense) => {
      // Invalidar expenses del trip
      queryClient.invalidateQueries({ queryKey: ["expenses", tripId] });
      
      // Invalidar el trip para actualizar totalAmount
      queryClient.invalidateQueries({ queryKey: ["trip", tripId] });
      queryClient.invalidateQueries({ queryKey: ["trips", user!.id] });
      
      // Actualizar cache de expenses
      queryClient.setQueryData<Expense[]>(["expenses", tripId], (oldExpenses) => {
        return oldExpenses ? [newExpense, ...oldExpenses] : [newExpense];
      });
    },
    onError: (error) => {
      console.error("Error creating expense:", error);
    },
  });
}

/* ===============================
   Editar expense
================================ */
export function useUpdateExpense(tripId: string) {
  const queryClient = useQueryClient();
  const { user } = useUserContext();

  return useMutation({
    mutationFn: async ({
      expenseId,
      data,
    }: {
      expenseId: string;
      data: Partial<UpdateExpenseDto>;
    }) => {
      if (!user?.id) throw new Error("No user");
      
      const res = await fetch(`/api/trips/${tripId}/expenses/${expenseId}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Error updating expense");
      }
      
      return res.json();
    },
    onSuccess: (updatedExpense: Expense) => {
      // Invalidar todas las queries relacionadas
      queryClient.invalidateQueries({ queryKey: ["expenses", tripId] });
      queryClient.invalidateQueries({ queryKey: ["trip", tripId] });
      queryClient.invalidateQueries({ queryKey: ["trips", user!.id] });
      
      // Actualizar cache
      queryClient.setQueryData<Expense[]>(["expenses", tripId], (oldExpenses) => {
        if (!oldExpenses) return [updatedExpense];
        return oldExpenses.map((expense) =>
          expense.id === updatedExpense.id ? updatedExpense : expense
        );
      });
    },
    onError: (error) => {
      console.error("Error updating expense:", error);
    },
  });
}

/* ===============================
   Eliminar expense
================================ */
export function useDeleteExpense(tripId: string) {
  const queryClient = useQueryClient();
  const { user } = useUserContext();

  return useMutation({
    mutationFn: async (expenseId: string) => {
      if (!user?.id) throw new Error("No user");
      
      const res = await fetch(`/api/trips/${tripId}/expenses/${expenseId}`, {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Error deleting expense");
      }
      
      return res.json();
    },
    onSuccess: (_, expenseId) => {
      // Invalidar queries
      queryClient.invalidateQueries({ queryKey: ["expenses", tripId] });
      queryClient.invalidateQueries({ queryKey: ["trip", tripId] });
      queryClient.invalidateQueries({ queryKey: ["trips", user!.id] });
      
      // Actualizar cache
      queryClient.setQueryData<Expense[]>(["expenses", tripId], (oldExpenses) => {
        return oldExpenses ? oldExpenses.filter((exp) => exp.id !== expenseId) : [];
      });
    },
    onError: (error) => {
      console.error("Error deleting expense:", error);
    },
  });
}