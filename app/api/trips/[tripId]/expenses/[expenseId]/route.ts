import { Prisma } from "@/app/generated/prisma/client";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { updateExpenseSchema } from "@/lib/validations";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

type Params = {
  params: Promise<{ tripId: string; expenseId: string }>;
};

export async function PUT(request: Request, { params }: Params) {
  try {
    const { tripId, expenseId } = await params;
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verificar que el expense existe y pertenece a un trip del usuario
    const existingExpense = await prisma.expense.findFirst({
      where: {
        id: expenseId,
        tripId,
        trip: {
          userId: session.user.id,
        },
      },
    });

    if (!existingExpense) {
      return NextResponse.json(
        { error: "Expense not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validatedData = updateExpenseSchema.parse(body);

    // Construir objeto de actualización
    const updateData: Prisma.ExpenseUpdateInput = {};

    if (validatedData.date !== undefined) {
      updateData.date = new Date(validatedData.date);
    }
    if (validatedData.amount !== undefined) {
      updateData.amount = new Prisma.Decimal(validatedData.amount);
    }
    if (validatedData.category !== undefined) {
      updateData.category = validatedData.category;
    }
    if (validatedData.vendor !== undefined) {
      updateData.vendor = validatedData.vendor;
    }
    if (validatedData.description !== undefined) {
      updateData.description = validatedData.description;
    }
    if (validatedData.receiptUrl !== undefined) {
      updateData.receiptUrl = validatedData.receiptUrl;
    }

    // Si cambia el amount, actualizar el total del trip
    let expense;
    if (validatedData.amount !== undefined) {
      const amountDifference =
        validatedData.amount - Number(existingExpense.amount);

      const [updatedExpense] = await prisma.$transaction([
        prisma.expense.update({
          where: { id: expenseId },
          data: updateData,
        }),
        prisma.trip.update({
          where: { id: tripId },
          data: {
            totalAmount: {
              increment: amountDifference,
            },
          },
        }),
      ]);
      expense = updatedExpense;
    } else {
      expense = await prisma.expense.update({
        where: { id: expenseId },
        data: updateData,
      });
    }

    return NextResponse.json(expense);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error },
        { status: 400 }
      );
    }
    console.error("Error updating expense:", error);
    return NextResponse.json(
      { error: "Error updating expense" },
      { status: 500 }
    );
  }
}

export async function DELETE(_: Request, { params }: Params) {
  try {
    const { tripId, expenseId } = await params;
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verificar que el expense existe y pertenece a un trip del usuario
    const existingExpense = await prisma.expense.findFirst({
      where: {
        id: expenseId,
        tripId,
        trip: {
          userId: session.user.id,
        },
      },
    });

    if (!existingExpense) {
      return NextResponse.json(
        { error: "Expense not found" },
        { status: 404 }
      );
    }

    // Eliminar expense y actualizar total en transacción
    await prisma.$transaction([
      prisma.expense.delete({
        where: { id: expenseId },
      }),
      prisma.trip.update({
        where: { id: tripId },
        data: {
          totalAmount: {
            decrement: Number(existingExpense.amount),
          },
        },
      }),
    ]);

    return NextResponse.json({
      ok: true,
      message: "Expense deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting expense:", error);
    return NextResponse.json(
      { error: "Error deleting expense" },
      { status: 500 }
    );
  }
}