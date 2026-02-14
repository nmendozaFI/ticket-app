"use client";

import { useAdminTrips, useUpdateTripStatus, useExportExcel } from "@/hooks/useAdminTrips";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";
import { Trip, TripStatus } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { FileSpreadsheet } from "lucide-react";

export default function AdminPage() {
  const { data: trips, isLoading } = useAdminTrips();
  const updateStatus = useUpdateTripStatus();
  const exportExcel = useExportExcel();

  const STATUS_OPTIONS: TripStatus[] = ["PENDIENTE", "APROBADO", "RECHAZADO"];

  const getStatusVariant = (status: TripStatus) => {
    switch (status) {
      case "PENDIENTE":
        return "outline";
      case "APROBADO":
        return "default";
      case "RECHAZADO":
        return "destructive";
      default:
        return "outline";
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-8 space-y-6">
        <Skeleton className="h-10 w-96" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold">Admin - Todos los Viajes</h1>
        <Button
          onClick={() => exportExcel.mutate()}
          disabled={exportExcel.isPending}
          size="lg"
          className="gap-2"
        >
          {exportExcel.isPending ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              Exportando...
            </>
          ) : (
            <>
              <FileSpreadsheet className="w-4 h-4" />
              Exportar Excel
            </>
          )}
        </Button>
      </div>

      {trips?.length ? (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ciudad</TableHead>
                <TableHead>Usuario</TableHead>
                <TableHead>Fechas</TableHead>
                <TableHead className="text-right">Gastos</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trips.map((trip: Trip) => (
                <TableRow key={trip.id}>
                  <TableCell className="font-medium">{trip.city}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{trip.user?.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {trip.user?.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {trip.expenses?.length || 0}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {formatCurrency(trip.totalAmount)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusVariant(trip.status)}>
                        {trip.status}
                      </Badge>
                      <Select
                        value={trip.status}
                        onValueChange={(status) =>
                          updateStatus.mutate({
                            tripId: trip.id,
                            status: status as TripStatus,
                          })
                        }
                        disabled={updateStatus.isPending}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUS_OPTIONS.map((s) => (
                            <SelectItem key={s} value={s}>
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/trips/${trip.id}/expenses`}>
                        Ver Gastos
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground border rounded-lg">
          No hay viajes registrados
        </div>
      )}
    </div>
  );
}