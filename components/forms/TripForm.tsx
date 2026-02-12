"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { Trip, CreateTripDto, TripFormDto } from "@/types";
import { formatDateForInput } from "@/lib/utils";

type TripFormValues = TripFormDto;

interface TripFormProps {
  initialData?: Trip | null;
  onSubmit: (values: CreateTripDto) => void;
  onCancel: () => void;
}

export default function TripForm({
  initialData,
  onSubmit,
  onCancel,
}: TripFormProps) {
  const [values, setValues] = React.useState<TripFormValues>({
    city: initialData?.city || "",
    startDate: formatDateForInput(initialData?.startDate), // ✅ Safe conversion
    endDate: formatDateForInput(initialData?.endDate),
    project: initialData?.project || "",
    notes: initialData?.notes || "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    onSubmit({
      city: values.city,
      startDate: new Date(values.startDate),
      endDate: new Date(values.endDate),
      project: values.project || undefined,
      notes: values.notes || undefined,
    });
  };

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
          disabled={!values.city || !values.startDate || !values.endDate}
        >
          {initialData ? "Actualizar" : "Crear"} Viaje
        </Button>
      </div>
    </form>
  );
}
