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

export default function TripsPage() {
  const { data: trips, isLoading } = useTrips();
  const createTrip = useCreateTrip();
  const updateTrip = useUpdateTrip();

  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = (data: CreateTripDto) => {
    if (editingTrip) {
      updateTrip.mutate({ tripId: editingTrip.id, data });
    } else {
      createTrip.mutate(data);
    }
    setIsOpen(false);
    setEditingTrip(null);
  };

  if (isLoading)
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-56" />
        <div className="flex justify-between items-center mb-8">
          <div /> 
          <Skeleton className="h-11 w-40" />
        </div>
      </div>
    );

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {trips?.map((trip: Trip) => (
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
    </div>
  );
}
