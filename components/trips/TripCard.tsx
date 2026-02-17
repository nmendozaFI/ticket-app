"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit3, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useTrip, useDeleteTrip } from "@/hooks/useTrips";
import { useAdminTrip } from "@/hooks/useAdminTrips";
import type { Trip } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";

interface TripCardProps {
  tripId: string;
  readOnly?: boolean;   // USER: solo ve y carga gastos, sin editar/borrar viaje
  isAdmin?: boolean;    // ADMIN: usa ruta admin + botones CRUD
  onEdit?: (trip: Trip) => void;
  onDelete?: (tripId: string) => void;
}

// ✅ Componente interno que recibe trip ya resuelto
function TripCardContent({
  trip,
  tripId,
  readOnly = false,
  isAdmin = false,
  onEdit,
  onDelete,
}: TripCardProps & { trip: Trip }) {
  const deleteTrip = useDeleteTrip();

  const getStatusVariant = (
    status: Trip["status"]
  ): "default" | "secondary" | "outline" | "destructive" => {
    switch (status) {
      case "PENDIENTE": return "outline";
      case "APROBADO":  return "default";
      case "RECHAZADO": return "destructive";
      default:          return "outline";
    }
  };

  const assignedNames = trip.assignedUsers
    ?.map((a) => a.user?.name)
    .filter(Boolean)
    .join(", ");

  const handleDelete = () => {
    if (onDelete) {
      onDelete(tripId);
    } else {
      deleteTrip.mutate(tripId);
    }
  };

  // ✅ Ruta de gastos según rol
  const expensesHref = isAdmin
    ? `/admin/trips/${tripId}/expenses`
    : `/trips/${tripId}/expenses`;

  return (
    <Card className="w-full hover:shadow-lg transition-all border-2 hover:border-blue-200">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="text-lg font-bold truncate flex-1">
            {trip.city}
          </CardTitle>
          <Badge variant={getStatusVariant(trip.status)}>{trip.status}</Badge>
        </div>

        <div className="space-y-1 text-sm text-muted-foreground">
          <p>📅 {formatDate(trip.startDate)} — {formatDate(trip.endDate)}</p>
          {trip.project && <p>💼 {trip.project}</p>}
          {isAdmin && assignedNames && <p>👤 {assignedNames}</p>}
          {trip.notes && <p className="truncate italic">📝 {trip.notes}</p>}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
          <span className="font-semibold">Total:</span>
          <span className="text-2xl font-bold">
            {formatCurrency(trip.totalAmount)}
          </span>
        </div>

        <div className="flex gap-2 pt-2">
          {/* Siempre visible */}
          <Button variant="outline" size="sm" className="flex-1" asChild>
            <Link href={expensesHref}>
              <Plus className="w-4 h-4 mr-2" />
              Gastos
            </Link>
          </Button>

          {/* Editar — solo si no es readOnly y tiene handler */}
          {!readOnly && onEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(trip)}
              className="px-3"
            >
              <Edit3 className="w-4 h-4" />
            </Button>
          )}

          {/* Eliminar — solo admin */}
          {isAdmin && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={deleteTrip.isPending}
              className="px-3"
            >
              {deleteTrip.isPending ? "⏳" : <Trash2 className="w-4 h-4" />}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ✅ Wrapper para USER — usa /api/trips/:id (verifica asignación)
function UserTripCard(props: TripCardProps) {
  const { data: trip, isLoading } = useTrip(props.tripId);

  if (isLoading) return <CardSkeleton />;
  if (!trip) return null;

  return <TripCardContent {...props} trip={trip} />;
}

// ✅ Wrapper para ADMIN — usa /api/admin/trips/:id (sin restricción de ownership)
function AdminTripCard(props: TripCardProps) {
  const { data: trip, isLoading } = useAdminTrip(props.tripId);

  if (isLoading) return <CardSkeleton />;
  if (!trip) return null;

  return <TripCardContent {...props} trip={trip} />;
}

// ✅ Skeleton reutilizable
function CardSkeleton() {
  return (
    <div className="animate-pulse bg-gray-200 h-80 w-full rounded-xl" />
  );
}

// ✅ Export principal — decide qué wrapper usar según isAdmin
export default function TripCard(props: TripCardProps) {
  if (props.isAdmin) {
    return <AdminTripCard {...props} />;
  }
  return <UserTripCard {...props} />;
}