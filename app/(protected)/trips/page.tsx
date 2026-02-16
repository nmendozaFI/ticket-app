"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useTrips, useCreateTrip, useUpdateTrip } from "@/hooks/useTrips";
import type { Trip, CreateTripDto } from "@/types";
import TripCard from "@/components/trips/TripCard";
import TripForm from "@/components/forms/TripForm";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";

export default function TripsPage() {
  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useTrips();
  
  const createTrip = useCreateTrip();
  const updateTrip = useUpdateTrip();

  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = (formData: CreateTripDto) => {
    if (editingTrip) {
      updateTrip.mutate({ tripId: editingTrip.id, data: formData });
    } else {
      createTrip.mutate(formData);
    }
    setIsOpen(false);
    setEditingTrip(null);
  };

  // ✅ Flatten todas las páginas en un solo array
  const allTrips = data?.pages.flatMap((page) => page.trips) || [];

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-8">
        <Skeleton className="h-10 w-56 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(9)].map((_, i) => (
            <Skeleton key={i} className="h-80 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Mis Viajes</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              + Nuevo Viaje
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingTrip ? "Editar Viaje" : "Nuevo Viaje"}
              </DialogTitle>
            </DialogHeader>
            <TripForm
              initialData={editingTrip}
              onSubmit={handleSubmit}
              onCancel={() => {
                setIsOpen(false);
                setEditingTrip(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {allTrips.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allTrips.map((trip: Trip) => (
              <TripCard
                key={trip.id}
                tripId={trip.id}
                onEdit={(trip) => {
                  setEditingTrip(trip);
                  setIsOpen(true);
                }}
              />
            ))}
          </div>

          {/* ✅ BOTÓN CARGAR MÁS */}
          {hasNextPage && (
            <div className="flex justify-center mt-8">
              <Button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                size="lg"
                variant="outline"
              >
                {isFetchingNextPage ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Cargando...
                  </>
                ) : (
                  "Cargar más viajes"
                )}
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          No tienes viajes registrados. ¡Crea tu primer viaje!
        </div>
      )}
    </div>
  );
}