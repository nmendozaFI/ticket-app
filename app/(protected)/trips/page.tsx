"use client";

import { useTrips, useExportUserExcel } from "@/hooks/useTrips";
import type { Trip } from "@/types";
import TripCard from "@/components/trips/TripCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Luggage, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TripsPage() {
  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useTrips();
  
  const exportExcel = useExportUserExcel();

  const allTrips = data?.pages.flatMap((page) => page.trips) ?? [];

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-8">
        <div className="mb-8">
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-5 w-48" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-80 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-8">
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Mis Viajes</h1>
            <p className="text-muted-foreground mt-1">
              Viajes asignados a ti por el administrador
            </p>
          </div>

          {/* ✅ Botón exportar Excel — solo visible si hay trips */}
          {allTrips.length > 0 && (
            <Button
              onClick={() => exportExcel.mutate()}
              disabled={exportExcel.isPending}
              variant="outline"
              className="gap-2"
            >
              {exportExcel.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Exportando...
                </>
              ) : (
                <>
                  <FileSpreadsheet className="w-4 h-4" />
                  Exportar mis gastos
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {allTrips.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allTrips.map((trip: Trip) => (
              <TripCard
                key={trip.id}
                tripId={trip.id}
                readOnly
              />
            ))}
          </div>

          {hasNextPage && (
            <div className="flex justify-center mt-10">
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
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Luggage className="w-16 h-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">No tienes viajes asignados</h2>
          <p className="text-muted-foreground max-w-sm">
            El administrador todavía no te ha asignado ningún viaje.
            Cuando lo haga, aparecerá aquí.
          </p>
        </div>
      )}
    </div>
  );
}