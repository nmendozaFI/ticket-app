"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminTripStats } from "@/hooks/useAdminTrips";
import { useUsers } from "@/hooks/useUser";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const router = useRouter();
  const { data: allTrips, isLoading: loadingTrips } = useAdminTripStats(); // ✅ Hook sin paginación
  const { users, isLoading: loadingUsers } = useUsers();
  const isLoading = loadingTrips || loadingUsers;

  // --- Métricas globales ---
  const totalTrips = allTrips?.length ?? 0;
  const totalAmount =
    allTrips?.reduce((acc, t) => acc + Number(t.totalAmount ?? 0), 0) ?? 0;
  const usersActivos = users?.filter((u) => u.role === "USER").length ?? 0;

  // Contar por estado
  const tripsByStatus = {
    PENDIENTE: allTrips?.filter((t) => t.status === "PENDIENTE").length ?? 0,
    APROBADO: allTrips?.filter((t) => t.status === "APROBADO").length ?? 0,
    RECHAZADO: allTrips?.filter((t) => t.status === "RECHAZADO").length ?? 0,
  };

  // Gasto por usuario
  const spendByUser = (() => {
    const map = new Map<string, { name: string; total: number; trips: number }>();
    allTrips?.forEach((trip) => {
      const userId = trip.userId;
      const amount = Number(trip.totalAmount ?? 0);
      const existing = map.get(userId);
      if (existing) {
        existing.total += amount;
        existing.trips += 1;
      } else {
        map.set(userId, {
          name: trip.user?.name || "Usuario desconocido",
          total: amount,
          trips: 1,
        });
      }
    });
    return Array.from(map.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  })();

  // Ciudades más visitadas
  const topCities = (() => {
    const map = new Map<string, number>();
    allTrips?.forEach((t) => {
      if (t.city) map.set(t.city, (map.get(t.city) ?? 0) + 1);
    });
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  })();

  return (
    <main className="flex flex-col gap-6 p-6">
      <section className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard Administrador</h1>
        <Button
          variant="outline"
          onClick={() => router.push("/admin")}
        >
          Ver todos los viajes
        </Button>
      </section>

      {/* KPIs globales */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total viajes</CardTitle>
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
            <CardTitle className="text-sm">Gasto total</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-9 w-32" />
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
            <CardTitle className="text-sm">Usuarios activos</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-9 w-12" />
            ) : (
              <p className="text-3xl font-bold">{usersActivos}</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Pendientes</CardTitle>
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
      </div>

      {/* Estados de viajes */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-yellow-600">Pendientes</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-12" />
            ) : (
              <p className="text-2xl font-bold">{tripsByStatus.PENDIENTE}</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-green-600">Aprobados</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-12" />
            ) : (
              <p className="text-2xl font-bold">{tripsByStatus.APROBADO}</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-red-600">Rechazados</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-12" />
            ) : (
              <p className="text-2xl font-bold">{tripsByStatus.RECHAZADO}</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dos columnas: gasto por usuario + ciudades */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Gasto por usuario (top 5)</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : spendByUser.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No hay datos disponibles
              </p>
            ) : (
              <ul className="space-y-3">
                {spendByUser.map((u) => (
                  <li
                    key={u.name}
                    className="flex justify-between items-center py-2 border-b last:border-0"
                  >
                    <div>
                      <span className="font-medium">{u.name}</span>
                      <p className="text-xs text-muted-foreground">
                        {u.trips} viajes
                      </p>
                    </div>
                    <span className="font-semibold">
                      {u.total.toLocaleString("es-ES", {
                        style: "currency",
                        currency: "EUR",
                      })}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ciudades más visitadas</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : topCities.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No hay datos disponibles
              </p>
            ) : (
              <ul className="space-y-3">
                {topCities.map(([city, count]) => (
                  <li
                    key={city}
                    className="flex justify-between items-center py-2 border-b last:border-0"
                  >
                    <span className="font-medium">{city}</span>
                    <span className="text-muted-foreground">
                      {count} {count === 1 ? "viaje" : "viajes"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}