// app/trips/[tripId]/expenses/page.tsx
"use client"

import { useParams } from "next/navigation"
import { useTrip } from "@/hooks/useTrips"
import { useTripExpenses, useCreateExpense, useUpdateExpense, useDeleteExpense } from "@/hooks/useExpenses"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import type { Expense } from "@/types"
import { useState } from "react"
import ExpenseForm from "@/components/forms/ExpenseForm"

export default function TripExpensesPage() {
  const params = useParams<{ tripId: string }>()
  const tripId = params.tripId

  const { data: trip } = useTrip(tripId)
  const { data: expenses, isLoading } = useTripExpenses(tripId)
  const createExpense = useCreateExpense(tripId)
  const updateExpense = useUpdateExpense(tripId)
  const deleteExpense = useDeleteExpense(tripId)

  const [editing, setEditing] = useState<Expense | null>(null)
  const [showForm, setShowForm] = useState(false)

  if (isLoading) return <div>Cargando gastos...</div>

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Gastos de {trip?.city}</h1>
          <p className="text-sm text-muted-foreground">
            Del {trip && formatDate(trip.startDate)} al {trip && formatDate(trip.endDate)}
          </p>
        </div>
        <Button onClick={() => { setEditing(null); setShowForm(true) }}>
          Nuevo gasto
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editing ? "Editar gasto" : "Nuevo gasto"}</CardTitle>
          </CardHeader>
          <CardContent>
            <ExpenseForm
              initialData={editing || undefined}
              onSubmit={(values) => {
                if (editing) {
                  updateExpense.mutate(
                    { expenseId: editing.id, data: values },
                    { onSuccess: () => { setEditing(null); setShowForm(false) } }
                  )
                } else {
                  createExpense.mutate(
                    values,
                    { onSuccess: () => { setShowForm(false) } }
                  )
                }
              }}
              onCancel={() => { setEditing(null); setShowForm(false) }}
            />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Listado de gastos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {expenses && expenses.length > 0 ? (
            expenses.map((exp: Expense) => (
              <div key={exp.id} className="flex justify-between items-center border rounded p-2">
                <div>
                  <p className="font-medium">
                    {exp.vendor || exp.category || "Sin categoría"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(exp.date)} • {exp.description}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">
                    {formatCurrency(exp.amount)}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => { setEditing(exp); setShowForm(true) }}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteExpense.mutate(exp.id)}
                  >
                    Borrar
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">Sin gastos aún.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
