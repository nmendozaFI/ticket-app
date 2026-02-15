"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminTrips } from "@/hooks/useAdminTrips";
import { useUsers } from "@/hooks/useUser";

export default function AdminDashboard() {
  const { data: allTrips, isLoading: loadingTrips } = useAdminTrips();
  const { users, isLoading: loadingUsers } = useUsers();
  const isLoading = loadingTrips || loadingUsers;
  
  // --- Métricas globales ---
  const totalTrips = allTrips?.length ?? 0;
  const totalAmount = allTrips?.reduce((acc, t) => acc + Number(t.totalAmount ?? 0), 0) ?? 0;
  const usersActivos = users?.filter(u => u.role === "USER").length ?? 0;

  // Gasto por usuario
  const spendByUser = (() => {
    const map = new Map<string, { name: string; total: number }>();
    allTrips?.forEach((trip) => {
      const userId = trip.userId;
      const amount = Number(trip.totalAmount ?? 0);
      const existing = map.get(userId);
      if (existing) {
        existing.total += amount;
      } else {
        map.set(userId, { name: users?.find(u => u.id === userId)?.name || userId, total: amount });
      }
    });
    return Array.from(map.values()).sort((a, b) => b.total - a.total).slice(0, 5);
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
      <h1 className="text-3xl font-bold">Dashboard Administrador</h1>

      {/* KPIs globales */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total viajes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalTrips}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Gasto total</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {totalAmount.toLocaleString("es-ES", { style: "currency", currency: "EUR" })}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Usuarios activos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{usersActivos}</p>
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
            {isLoading ? <Skeleton className="h-32" /> : (
              <ul className="space-y-2 text-sm">
                {spendByUser.map((u) => (
                  <li key={u.name} className="flex justify-between">
                    <span>{u.name}</span>
                    <span>{u.total.toLocaleString("es-ES", { style: "currency", currency: "EUR" })}</span>
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
            {isLoading ? <Skeleton className="h-32" /> : (
              <ul className="space-y-2 text-sm">
                {topCities.map(([city, count]) => (
                  <li key={city} className="flex justify-between">
                    <span>{city}</span>
                    <span>{count} viajes</span>
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
