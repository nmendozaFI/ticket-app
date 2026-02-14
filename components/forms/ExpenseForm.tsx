"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import type { Expense } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Label } from "../ui/label";

type ExpenseFormValues = {
  date: Date;
  amount: number;
  category?: string;
  vendor?: string;
  description?: string;
  invoiceNumber?: string; // ✅ NUEVO
  paymentMethod?: string; // ✅ NUEVO
};

interface ExpenseFormProps {
  initialData?: Expense;
  onSubmit: (values: ExpenseFormValues) => void;
  onCancel: () => void;
}

export default function ExpenseForm({
  initialData,
  onSubmit,
  onCancel,
}: ExpenseFormProps) {
  const [values, setValues] = React.useState<ExpenseFormValues>({
    date: initialData ? new Date(initialData.date) : new Date(),
    amount: initialData ? Number(initialData.amount) : 0,
    category: initialData?.category || "",
    vendor: initialData?.vendor || "",
    description: initialData?.description || "",
    invoiceNumber: initialData?.invoiceNumber || "",
    paymentMethod: initialData?.paymentMethod || "Tarjeta",
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = e.target;
    setValues((prev) => ({
      ...prev,
      [name]: name === "amount" ? Number(value) : value,
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit(values);
  }

  return (
    <form className="space-y-3" onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium">Fecha</label>
          <Input
            type="date"
            name="date"
            value={values.date.toISOString().slice(0, 10)}
            onChange={(e) =>
              setValues((prev) => ({ ...prev, date: new Date(e.target.value) }))
            }
          />
        </div>
        <div>
          <label className="text-sm font-medium">Monto</label>
          <Input
            type="number"
            name="amount"
            value={values.amount}
            onChange={handleChange}
            step="0.01"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium">Categoría</label>
          <Select
            value={values.category}
            onValueChange={(value) =>
              setValues((prev) => ({ ...prev, category: value }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona una categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Taxi">Taxi</SelectItem>
              <SelectItem value="Comida">Comida</SelectItem>
              <SelectItem value="Hotel">Hotel</SelectItem>
              <SelectItem value="Metrobus/Parking">Metrobus/Parking</SelectItem>
              <SelectItem value="Gasolina">Gasolina</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium">Proveedor</label>
          <Input
            name="vendor"
            value={values.vendor}
            onChange={handleChange}
            placeholder="Restaurante, taxi..."
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="invoiceNumber">Nº Factura</Label>
          <Input
            name="invoiceNumber"
            value={values.invoiceNumber}
            onChange={handleChange}
            placeholder="1234567890"
          />
        </div>

        <div>
          <Label htmlFor="paymentMethod">Método de Pago *</Label>
          <Select
            value={values.paymentMethod}
            onValueChange={(value) =>
              setValues((prev) => ({ ...prev, paymentMethod: value }))
            }
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona método" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Tarjeta">Santander tarj debito</SelectItem>
              <SelectItem value="Efectivo">Efectivo</SelectItem>
              <SelectItem value="Transferencia">
                Santander transferencia
              </SelectItem>
              <SelectItem value="Domiciliacion">
                Santander domiciliacion
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Descripción</label>
        <Textarea
          name="description"
          value={values.description}
          onChange={handleChange}
          rows={3}
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">Guardar</Button>
      </div>
    </form>
  );
}
