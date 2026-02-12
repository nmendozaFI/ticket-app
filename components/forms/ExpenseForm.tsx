// app/trips/[tripId]/expenses/ExpenseForm.tsx
"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import type { Expense } from "@/types"

type ExpenseFormValues = {
  date: Date
  amount: number
  category?: string
  vendor?: string
  description?: string
}

interface ExpenseFormProps {
  initialData?: Expense
  onSubmit: (values: ExpenseFormValues) => void
  onCancel: () => void
}

export default function ExpenseForm({ initialData, onSubmit, onCancel }: ExpenseFormProps) {
  const [values, setValues] = React.useState<ExpenseFormValues>({
    date: initialData ? new Date(initialData.date) : new Date(),
    amount: initialData ? Number(initialData.amount) : 0,
    category: initialData?.category || "",
    vendor: initialData?.vendor || "",
    description: initialData?.description || "",
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target
    setValues((prev) => ({
      ...prev,
      [name]: name === "amount" ? Number(value) : value,
    }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSubmit(values)
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
          <Input
            name="category"
            value={values.category}
            onChange={handleChange}
            placeholder="Comida, hotel..."
          />
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
        <Button type="submit">
          Guardar
        </Button>
      </div>
    </form>
  )
}
