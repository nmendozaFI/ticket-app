"use client"

import { useUserContext } from "@/context/userContext"
import { CreateTripDto } from "@/types"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"


/* ===============================
   Obtener viajes del usuario
================================ */
export function useTrips() {
    const { user } = useUserContext()
  return useQuery({
    queryKey: ["trips", user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error("No user")
      const res = await fetch(`/api/trips?userId=${user.id}`, {
        credentials: 'include', // Cookies auth
        headers: { 'Content-Type': 'application/json' }
      })
      if (!res.ok) throw new Error("Error fetching trips")
      return res.json()
    },
    enabled: !!user?.id, // Espera auth
  })
}

/* ===============================
   Obtener un viaje
================================ */
export function useTrip(tripId: string) {
    const { user } = useUserContext()
  return useQuery({
    queryKey: ["trip", tripId],
    queryFn: async () => {
      const res = await fetch(`/api/trips/${tripId}`)
      if (!res.ok) throw new Error("Error fetching trip")
      return res.json()
    },
    enabled: !!tripId  && !!user?.id,
  })
}

/* ===============================
   Crear viaje
================================ */
export function useCreateTrip() {
  const queryClient = useQueryClient()
  const { user } = useUserContext()

  return useMutation({
    mutationFn: async (data: CreateTripDto) => { // ✅ Solo CreateTripDto
      const res = await fetch("/api/trips", {
        method: "POST",
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...data, 
          userId: user!.id  // ✅ Hook lo añade automáticamente
        }),
      })
      if (!res.ok) throw new Error("Error creating trip")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trips", user!.id] })
    },
  })
}

/* ===============================
   Editar viaje
================================ */
export function useUpdateTrip() {
  const queryClient = useQueryClient()
  const { user } = useUserContext()

  return useMutation({
    mutationFn: async ({ tripId, data }: { tripId: string; data: Partial<CreateTripDto> }) => {
      const res = await fetch(`/api/trips/${tripId}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, userId: user!.id }),
      })
      if (!res.ok) throw new Error("Error updating trip")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trips", user!.id] })
    },
  })
}

/* ===============================
   Eliminar viaje
================================ */
export function useDeleteTrip() {
  const queryClient = useQueryClient()
  const { user } = useUserContext()

  return useMutation({
    mutationFn: async (tripId: string) => {
      const res = await fetch(`/api/trips/${tripId}`, {
        method: "DELETE",
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user!.id }),
      })
      if (!res.ok) throw new Error("Error deleting trip")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trips", user!.id] })
    },
  })
}
