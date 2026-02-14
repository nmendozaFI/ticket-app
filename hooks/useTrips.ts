"use client";

import { useUserContext } from "@/context/userContext";
import { CreateTripDto, UpdateTripDto, Trip } from "@/types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

/* ===============================
   Obtener viajes del usuario
================================ */
export function useTrips() {
  const { user } = useUserContext();
  
  return useQuery<Trip[]>({
    queryKey: ["trips", user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error("No user");
      
      const res = await fetch("/api/trips", {
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Error fetching trips");
      }
      
      return res.json();
    },
    enabled: !!user?.id,
  });
}

/* ===============================
   Obtener un viaje
================================ */
export function useTrip(tripId: string) {
  const { user } = useUserContext();
  
  return useQuery<Trip>({
    queryKey: ["trip", tripId],
    queryFn: async () => {
      const res = await fetch(`/api/trips/${tripId}`, {
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Error fetching trip");
      }
      
      return res.json();
    },
    enabled: !!tripId && !!user?.id,
  });
}

/* ===============================
   Crear viaje
================================ */
export function useCreateTrip() {
  const queryClient = useQueryClient();
  const { user } = useUserContext();

  return useMutation({
    mutationFn: async (data: CreateTripDto) => {
      if (!user?.id) throw new Error("No user");
      
      const res = await fetch("/api/trips", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Error creating trip");
      }
      
      return res.json();
    },
    onSuccess: (newTrip: Trip) => {
      // Invalidar lista de trips
      queryClient.invalidateQueries({ queryKey: ["trips", user!.id] });
      
      // Opcionalmente, agregar el nuevo trip al cache inmediatamente
      queryClient.setQueryData<Trip[]>(["trips", user!.id], (oldTrips) => {
        return oldTrips ? [newTrip, ...oldTrips] : [newTrip];
      });
    },
    onError: (error) => {
      console.error("Error creating trip:", error);
    },
  });
}

/* ===============================
   Editar viaje
================================ */
export function useUpdateTrip() {
  const queryClient = useQueryClient();
  const { user } = useUserContext();

  return useMutation({
    mutationFn: async ({
      tripId,
      data,
    }: {
      tripId: string;
      data: Partial<UpdateTripDto>;
    }) => {
      if (!user?.id) throw new Error("No user");
      
      const res = await fetch(`/api/trips/${tripId}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Error updating trip");
      }
      
      return res.json();
    },
    onSuccess: (updatedTrip: Trip) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ["trips", user!.id] });
      queryClient.invalidateQueries({ queryKey: ["trip", updatedTrip.id] });
      
      // Actualizar cache inmediatamente
      queryClient.setQueryData<Trip>(["trip", updatedTrip.id], updatedTrip);
      
      queryClient.setQueryData<Trip[]>(["trips", user!.id], (oldTrips) => {
        if (!oldTrips) return [updatedTrip];
        return oldTrips.map((trip) =>
          trip.id === updatedTrip.id ? updatedTrip : trip
        );
      });
    },
    onError: (error) => {
      console.error("Error updating trip:", error);
    },
  });
}

/* ===============================
   Eliminar viaje
================================ */
export function useDeleteTrip() {
  const queryClient = useQueryClient();
  const { user } = useUserContext();

  return useMutation({
    mutationFn: async (tripId: string) => {
      if (!user?.id) throw new Error("No user");
      
      const res = await fetch(`/api/trips/${tripId}`, {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Error deleting trip");
      }
      
      return res.json();
    },
    onSuccess: (_, tripId) => {
      // Invalidar lista
      queryClient.invalidateQueries({ queryKey: ["trips", user!.id] });
      
      // Remover del cache
      queryClient.removeQueries({ queryKey: ["trip", tripId] });
      
      queryClient.setQueryData<Trip[]>(["trips", user!.id], (oldTrips) => {
        return oldTrips ? oldTrips.filter((trip) => trip.id !== tripId) : [];
      });
    },
    onError: (error) => {
      console.error("Error deleting trip:", error);
    },
  });
}