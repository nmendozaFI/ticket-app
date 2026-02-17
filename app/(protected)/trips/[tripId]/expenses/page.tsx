// app/trips/[tripId]/expenses/page.tsx
"use client";

import { useParams } from "next/navigation";
import { useTrip } from "@/hooks/useTrips";
import {
  useCreateExpense,
  useUpdateExpense,
  useDeleteExpense,
  useExpenses,
} from "@/hooks/useExpenses";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { Expense } from "@/types";
import { useState } from "react";
import ExpenseForm from "@/components/forms/ExpenseForm";
import { useRouter } from "next/navigation";
import { SkeletonExpenses } from "@/components/SkeletonExpenses";

export default function TripExpensesPage() {
  const params = useParams<{ tripId: string }>();
  const tripId = params.tripId;
  const router = useRouter();

  const { data: trip } = useTrip(tripId);
  const { data: expenses, isLoading } = useExpenses(tripId);
  const createExpense = useCreateExpense(tripId);
  const updateExpense = useUpdateExpense(tripId);
  const deleteExpense = useDeleteExpense(tripId);

  const [editing, setEditing] = useState<Expense | null>(null);
  const [showForm, setShowForm] = useState(false);

  if (isLoading) return <SkeletonExpenses />;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <Button
        variant="ghost"
        className="px-0"
        onClick={() => router.push("/trips")}
      >
        ← Volver
      </Button>
      <div className="flex flex-col items-center gap-4 md:flex-row md:items-center md:justify-between">
        <div className="text-center md:text-left">
          <h1 className="text-2xl font-bold">Gastos de {trip?.city}</h1>
          <p className="text-sm text-muted-foreground">
            Del {trip && formatDate(trip.startDate)} al{" "}
            {trip && formatDate(trip.endDate)}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto mb-2">
          <Button
            onClick={() => {
              setEditing(null);
              setShowForm(true);
            }}
          >
            Nuevo gasto
          </Button>
        </div>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editing ? "Editar gasto" : "Nuevo gasto"}</CardTitle>
          </CardHeader>
          <CardContent>
            <ExpenseForm
              tripId={tripId}
              initialData={editing || undefined}
              onSubmit={(values) => {
                if (editing) {
                  updateExpense.mutate(
                    { expenseId: editing.id, data: values },
                    {
                      onSuccess: () => {
                        setEditing(null);
                        setShowForm(false);
                      },
                    },
                  );
                } else {
                  createExpense.mutate(values, {
                    onSuccess: () => {
                      setShowForm(false);
                    },
                  });
                }
              }}
              onCancel={() => {
                setEditing(null);
                setShowForm(false);
              }}
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
              <div
                key={exp.id}
                className="flex flex-col sm:flex-row sm:justify-between sm:items-center border rounded p-2 gap-3"
              >
                <div className="flex-1">
                  <p className="font-medium">
                    {exp.vendor || exp.category || "Sin categoría"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(exp.date)} • {exp.description}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <span className="font-semibold text-center sm:text-right">
                    {formatCurrency(exp.amount)}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditing(exp);
                      setShowForm(true);
                    }}
                    className="w-full sm:w-auto"
                  >
                    Editar
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteExpense.mutate(exp.id)}
                    className="w-full sm:w-auto"
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
  );
}
