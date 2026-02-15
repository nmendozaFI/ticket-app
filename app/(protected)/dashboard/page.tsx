"use client";

import { useTrips } from "@/hooks/useTrips";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function UserDashboard() {
  const router = useRouter();
  const { data: trips, isLoading } = useTrips();

  // --- Mis métricas ---
  const totalTrips = trips?.length ?? 0;
  const totalAmount =
    trips?.reduce((acc, t) => acc + Number(t.totalAmount ?? 0), 0) ?? 0;

  // Mis gastos por viaje (top 5)
  const spendByTrip =
    trips
      ?.map((t) => ({ ...t, amount: t.totalAmount ?? 0 }))
      .sort((a, b) => (b.amount ?? 0) - (a.amount ?? 0))
      .slice(0, 5) ?? [];

  return (
    <main className="flex flex-col gap-6 p-6">
      <section className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mis viajes</h1>
          <p className="text-muted-foreground">
            Resumen de tus viajes y gastos.
          </p>
        </div>
        <Button onClick={() => router.push("/trips")}>Ver mis viajes</Button>
      </section>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total viajes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalTrips}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total gastado</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">${totalAmount.toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Gastos por viaje */}
      <Card>
        <CardHeader>
          <CardTitle>Gastos por viaje</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-32" />
          ) : spendByTrip.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No tienes viajes aún.
            </p>
          ) : (
            <ul className="space-y-3">
              {spendByTrip.map((trip) => (
                <li
                  key={trip.id}
                  className="flex items-center justify-between py-2"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{trip.city || "Sin ciudad"}</p>
                      <Badge variant="secondary">{trip.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {new Date(trip.startDate).toLocaleDateString("es-ES", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <p className="text-lg font-semibold">
                    ${trip.amount?.toLocaleString("es-ES", {
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
