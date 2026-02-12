"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useUserContext } from "@/context/userContext"
import type { CreateExpenseDto, UpdateExpenseDto } from "@/types"

// Expenses por trip específico (tu única ruta GET)
export function useTripExpenses(tripId: string) {
  const { user } = useUserContext()
  return useQuery({
    queryKey: ["expenses", tripId],
    queryFn: async () => {
      const res = await fetch(`/api/trips/${tripId}/expenses?userId=${user?.id}`, { 
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      })
      if (!res.ok) throw new Error(`Error: ${res.status}`)
      return res.json()
    },
    enabled: !!tripId && !!user?.id,
  })
}

// Crear expense (POST /api/trips/[tripId]/expenses)
export function useCreateExpense(tripId: string) {
  const queryClient = useQueryClient()
  const { user } = useUserContext()

  return useMutation({
    mutationFn: async (data: Omit<CreateExpenseDto, 'tripId'>) => {
      const res = await fetch(`/api/trips/${tripId}/expenses`, {
        method: "POST",
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...data, 
          tripId, // Ya lo pasa la ruta
          userId: user!.id 
        }),
      })
      if (!res.ok) {
        const error = await res.text()
        throw new Error(`Error: ${res.status} - ${error}`)
      }
      return res.json()
    },
    onSuccess: () => {
      // Invalida este trip y todos los trips del user
      queryClient.invalidateQueries({ queryKey: ["expenses", tripId] })
      queryClient.invalidateQueries({ queryKey: ["trips", user!.id] })
    },
  })
}

export function useUpdateExpense(tripId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: { expenseId: string; data: UpdateExpenseDto }) => {
      const res = await fetch(`/api/trips/${tripId}/expenses/${input.expenseId}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input.data),
      })
      if (!res.ok) throw new Error("Error updating expense")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses", tripId] })
      queryClient.invalidateQueries({ queryKey: ["trips"] })
    },
  })
}


// Eliminar expense (DELETE /api/trips/[tripId]/expenses/[expenseId])
export function useDeleteExpense(tripId: string) {
  const queryClient = useQueryClient()
  const { user } = useUserContext()

  return useMutation({
    mutationFn: async (expenseId: string) => {
      const res = await fetch(`/api/trips/${tripId}/expenses/${expenseId}`, {
        method: "DELETE",
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user!.id }),
      })
      if (!res.ok) throw new Error("Error deleting expense")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses", tripId] })
      queryClient.invalidateQueries({ queryKey: ["trips", user!.id] })
    },
  })
}
