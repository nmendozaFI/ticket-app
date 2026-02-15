"use client";

import { use } from "react";
import { useAdminTrip, useUpdateTripStatus } from "@/hooks/useAdminTrips";
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
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Expense, TripStatus } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminTripExpenses({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = use(params);
  const { data: trip, isLoading } = useAdminTrip(tripId);
  const updateStatus = useUpdateTripStatus();

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
      <div className="max-w-6xl mx-auto p-8">
        <Skeleton className="h-10 w-48 mb-8" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="max-w-6xl mx-auto p-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-2">Viaje no encontrado</h2>
          <Button asChild>
            <Link href="/admin">Volver al panel</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="mb-8">
        <Button variant="outline" asChild className="mb-6">
          <Link href="/admin">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al panel
          </Link>
        </Button>

        <div className="bg-card border rounded-lg p-6 space-y-4">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold">{trip.city}</h1>
              {trip.project && (
                <p className="text-lg text-muted-foreground">
                  Proyecto: {trip.project}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Badge
                variant={getStatusVariant(trip.status)}
                className="text-sm"
              >
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
                <SelectTrigger className="w-40">
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
            <div>
              <p className="text-sm text-muted-foreground">Usuario</p>
              <p className="font-medium">{trip.user?.name}</p>
              <p className="text-xs text-muted-foreground">
                {trip.user?.email}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Fechas</p>
              <p className="font-medium">
                {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(trip.totalAmount)}
              </p>
            </div>
          </div>

          {trip.notes && (
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">Notas</p>
              <p className="text-sm">{trip.notes}</p>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold">
          Gastos ({trip.expenses?.length || 0})
        </h2>

        {trip.expenses && trip.expenses.length > 0 ? (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Proveedor</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead className="text-center">Recibo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trip.expenses.map((expense: Expense) => (
                  <TableRow key={expense.id}>
                    <TableCell className="whitespace-nowrap">
                      {formatDate(expense.date)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {expense.category || "-"}
                      </Badge>
                    </TableCell>
                    <TableCell>{expense.vendor || "-"}</TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(expense.amount)}
                    </TableCell>
                    <TableCell className="max-w-md truncate">
                      {expense.description || "-"}
                    </TableCell>
                    <TableCell className="text-center">
                      {expense.receiptUrl ? (
                        <div className="flex gap-2 justify-center">
                          <a
                            href={expense.receiptUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline inline-flex items-center gap-1"
                          >
                            📄 Ver
                          </a>

                          <a
                            href={expense.receiptUrl}
                            download
                            className="text-green-600 hover:underline inline-flex items-center gap-1"
                          >
                            ⬇️ Descargar
                          </a>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-12 border rounded-lg text-muted-foreground">
            No hay gastos registrados para este viaje
          </div>
        )}
      </div>
    </div>
  );
}
