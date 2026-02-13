"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit3, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useTrip, useDeleteTrip } from "@/hooks/useTrips";
import type { Trip} from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";

interface TripCardProps {
  tripId: string;
  onEdit: (trip: Trip) => void
}

export default function TripCard({ tripId, onEdit }: TripCardProps) {
  const { data: trip, isLoading } = useTrip(tripId)
  const deleteTrip = useDeleteTrip()

  if (isLoading) return <div className="animate-pulse bg-gray-200 h-80 w-full max-w-sm rounded-lg" />
  if (!trip) return null

  const getStatusVariant = (status: Trip["status"]): "default" | "secondary" | "outline" => {
    switch (status) {
      case "BORRADOR": return "outline"
      case "ENVIADO": return "default"
      case "ARPOBADO": return "secondary"
      default: return "outline"
    }
  }

  return (
    <Card className="w-full max-w-sm hover:shadow-lg transition-all border-2 hover:border-blue-200">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="text-lg font-bold truncate flex-1">
            {trip.city}
          </CardTitle>
          <Badge variant={getStatusVariant(trip.status)}>
            {trip.status}
          </Badge>
        </div>

        <div className="space-y-1 text-sm text-muted-foreground">
          <p className="flex items-center gap-1">📅 {formatDate(trip.startDate)} - {formatDate(trip.endDate)}</p>
          {trip.project && <p className="flex items-center gap-1">💼 {trip.project}</p>}
          {trip.notes && <p className="truncate italic">📝 {trip.notes}</p>}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
          <span className="font-semibold text-lg">Total:</span>
          <span className="text-2xl font-bold text-foreground">
            {formatCurrency(trip.totalAmount)}
          </span>
        </div>

        <div className="flex gap-2 pt-2">
          <Button variant="outline" size="sm" className="flex-1" asChild>
            <Link href={`/trips/${tripId}/expenses`}>
              <Plus className="w-4 h-4 mr-2" />
              Gastos
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => trip && onEdit(trip)} // ✅ Callback para editar
            className="px-3"
          >
            <Edit3 className="w-4 h-4" />
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => deleteTrip.mutate(tripId)}
            disabled={deleteTrip.isPending}
            className="px-3"
          >
            {deleteTrip.isPending ? "⏳" : <Trash2 className="w-4 h-4" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}