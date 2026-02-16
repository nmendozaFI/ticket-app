"use client";

import { useTripStats } from "@/hooks/useTrips";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function UserDashboard() {
  const router = useRouter();
  const { data: trips, isLoading } = useTripStats(); // ✅ Hook sin paginación

  // --- Mis métricas ---
  const totalTrips = trips?.length ?? 0;
  const totalAmount =
    trips?.reduce((acc, t) => acc + Number(t.totalAmount ?? 0), 0) ?? 0;

  // Mis gastos por viaje (top 5)
  const spendByTrip =
    trips
      ?.map((t) => ({ ...t, amount: Number(t.totalAmount ?? 0) }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5) ?? [];

  // Contar viajes por estado
  const tripsByStatus = {
    PENDIENTE: trips?.filter((t) => t.status === "PENDIENTE").length ?? 0,
    APROBADO: trips?.filter((t) => t.status === "APROBADO").length ?? 0,
    RECHAZADO: trips?.filter((t) => t.status === "RECHAZADO").length ?? 0,
  };

  return (
    <main className="flex flex-col gap-6 p-6">
      <section className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Mis viajes</h1>
          <p className="text-muted-foreground text-sm">
            Resumen de tus viajes y gastos.
          </p>
        </div>
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white"
          onClick={() => router.push("/trips")}
        >
          Ver todos mis viajes
        </Button>
      </section>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total viajes</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-9 w-16" />
            ) : (
              <p className="text-3xl font-bold">{totalTrips}</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total gastado</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-9 w-24" />
            ) : (
              <p className="text-3xl font-bold">
                {totalAmount.toLocaleString("es-ES", {
                  style: "currency",
                  currency: "EUR",
                })}
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-9 w-12" />
            ) : (
              <p className="text-3xl font-bold text-yellow-600">
                {tripsByStatus.PENDIENTE}
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Aprobados</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-9 w-12" />
            ) : (
              <p className="text-3xl font-bold text-green-600">
                {tripsByStatus.APROBADO}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Gastos por viaje */}
      <Card>
        <CardHeader>
          <CardTitle>Top 5 Viajes con Mayor Gasto</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : spendByTrip.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No tienes viajes aún. ¡Crea tu primer viaje!
            </p>
          ) : (
            <ul className="space-y-3">
              {spendByTrip.map((trip) => (
                <li
                  key={trip.id}
                  className="flex items-center justify-between py-3 border-b last:border-0 hover:bg-muted/50 px-2 rounded cursor-pointer transition-colors"
                  onClick={() => router.push(`/trips/${trip.id}/expenses`)}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{trip.city || "Sin ciudad"}</p>
                      <Badge
                        variant={
                          trip.status === "APROBADO"
                            ? "default"
                            : trip.status === "PENDIENTE"
                            ? "outline"
                            : "destructive"
                        }
                      >
                        {trip.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {new Date(trip.startDate).toLocaleDateString("es-ES", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}{" "}
                      -{" "}
                      {new Date(trip.endDate).toLocaleDateString("es-ES", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                    {trip.project && (
                      <p className="text-xs text-muted-foreground">
                        Proyecto: {trip.project}
                      </p>
                    )}
                  </div>
                  <p className="text-lg font-semibold">
                    {trip.amount.toLocaleString("es-ES", {
                      style: "currency",
                      currency: "EUR",
                    })}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </main>
  );
}