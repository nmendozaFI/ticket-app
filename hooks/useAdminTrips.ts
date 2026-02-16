"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Trip, TripStatus, PaginatedResponse } from "@/types";

/* ===============================
   Obtener todos los trips (ADMIN) con paginación
================================ */
export function useAdminTrips(page: number = 1, limit: number = 15) {
  return useQuery<PaginatedResponse<Trip>>({
    queryKey: ["adminTrips", page, limit],
    queryFn: async () => {
      const res = await fetch(`/api/admin/trips?page=${page}&limit=${limit}`, {
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Error fetching admin trips");
      }

      return res.json();
    },
  });
}

/* ===============================
   Obtener un trip específico (ADMIN)
================================ */
export function useAdminTrip(tripId: string) {
  return useQuery<Trip>({
    queryKey: ["adminTrip", tripId],
    queryFn: async () => {
      const res = await fetch(`/api/admin/trips/${tripId}`, {
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Error fetching trip");
      }

      return res.json();
    },
    enabled: !!tripId,
  });
}

/* ===============================
   Actualizar status de un trip (ADMIN)
================================ */
export function useUpdateTripStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      tripId,
      status,
    }: {
      tripId: string;
      status: TripStatus;
    }) => {
      const res = await fetch(`/api/admin/trips/${tripId}/status`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Error updating status");
      }

      return res.json();
    },
    onSuccess: (updatedTrip: Trip) => {
      // Invalidar todas las páginas
      queryClient.invalidateQueries({ queryKey: ["adminTrips"] });
      queryClient.invalidateQueries({ queryKey: ["adminTrip", updatedTrip.id] });
      queryClient.setQueryData<Trip>(["adminTrip", updatedTrip.id], updatedTrip);
    },
    onError: (error) => {
      console.error("Error updating trip status:", error);
    },
  });
}

/* ===============================
   Exportar Excel (ADMIN)
================================ */
export function useExportExcel() {
  return useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/admin/export", {
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Error exporting Excel");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `gastos-completos-${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },
    onError: (error) => {
      console.error("Error exporting Excel:", error);
    },
  });
}

/* ===============================
   Obtener TODOS los trips para stats (ADMIN)
================================ */
export function useAdminTripStats() {
  return useQuery<Trip[]>({
    queryKey: ["adminTripStats"],
    queryFn: async () => {
      const res = await fetch("/api/admin/trips/stats", {
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Error fetching admin trip stats");
      }

      return res.json();
    },
  });
}