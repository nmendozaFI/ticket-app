"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { CreateTripDto, Trip, TripFormDto } from "@/types";
import { formatDateForInput } from "@/lib/utils";
import { useUsers } from "@/hooks/useUser";
import { X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface TripFormProps {
  initialData?: Trip | null;
  onSubmit: (values: CreateTripDto) => void;
  onCancel: () => void;
}

export default function TripForm({ initialData, onSubmit, onCancel }: TripFormProps) {
  const { users } = useUsers();
  
  // ✅ Inicializar usuarios asignados desde datos existentes
  const [selectedUserIds, setSelectedUserIds] = React.useState<string[]>(
    initialData?.assignedUsers?.map((a) => a.userId) || []
  );

  const [values, setValues] = React.useState<Omit<TripFormDto, "assignedUserIds">>({
    city: initialData?.city || "",
    startDate: formatDateForInput(initialData?.startDate),
    endDate: formatDateForInput(initialData?.endDate),
    project: initialData?.project || "",
    notes: initialData?.notes || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddUser = (userId: string) => {
    if (!selectedUserIds.includes(userId)) {
      setSelectedUserIds((prev) => [...prev, userId]);
    }
  };

  const handleRemoveUser = (userId: string) => {
    setSelectedUserIds((prev) => prev.filter((id) => id !== userId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...values,
      startDate: new Date(values.startDate),
      endDate: new Date(values.endDate),
      assignedUserIds: selectedUserIds,
    });
  };

  // ✅ Usuarios disponibles para asignar (solo USERs, no ADMINs)
  const availableUsers = users?.filter((u) => u.role === "USER") || [];

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="city">Ciudad *</Label>
          <Input
            id="city"
            name="city"
            value={values.city}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="project">Proyecto</Label>
          <Input
            id="project"
            name="project"
            value={values.project}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="startDate">Fecha inicio *</Label>
          <Input
            id="startDate"
            name="startDate"
            type="date"
            value={values.startDate}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="endDate">Fecha fin *</Label>
          <Input
            id="endDate"
            name="endDate"
            type="date"
            value={values.endDate}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      {/* ✅ NUEVO: Selector de usuarios */}
      <div className="space-y-2">
        <Label>Asignar usuarios *</Label>
        <Select onValueChange={handleAddUser}>
          <SelectTrigger>
            <SelectValue placeholder="Selecciona un usuario..." />
          </SelectTrigger>
          <SelectContent>
            {availableUsers
              .filter((u) => !selectedUserIds.includes(u.id))
              .map((u) => (
                <SelectItem key={u.id} value={u.id}>
                  {u.name} ({u.email})
                </SelectItem>
              ))}
          </SelectContent>
        </Select>

        {/* ✅ Usuarios seleccionados como badges */}
        {selectedUserIds.length > 0 && (
          <div className="flex flex-wrap gap-2 p-3 border rounded-lg bg-muted/50">
            {selectedUserIds.map((uid) => {
              const user = availableUsers.find((u) => u.id === uid);
              return (
                <Badge key={uid} variant="secondary" className="gap-1 pr-1">
                  {user?.name || uid}
                  <button
                    type="button"
                    onClick={() => handleRemoveUser(uid)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              );
            })}
          </div>
        )}

        {selectedUserIds.length === 0 && (
          <p className="text-xs text-muted-foreground">
            Debes asignar al menos un usuario
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="notes">Notas</Label>
        <Textarea
          id="notes"
          name="notes"
          value={values.notes}
          onChange={handleChange}
          rows={3}
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={
            !values.city ||
            !values.startDate ||
            !values.endDate ||
            selectedUserIds.length === 0
          }
        >
          {initialData ? "Actualizar" : "Crear"} Viaje
        </Button>
      </div>
    </form>
  );
}