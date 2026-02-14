import { Prisma } from "@/app/generated/prisma/client";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { createExpenseSchema } from "@/lib/validations";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

type Params = {
  params: Promise<{ tripId: string }>;
};

export async function GET(_: Request, { params }: Params) {
  try {
    const { tripId } = await params;
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verificar que el trip pertenece al usuario
    const trip = await prisma.trip.findFirst({
      where: {
        id: tripId,
        userId: session.user.id,
      },
    });

    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    const expenses = await prisma.expense.findMany({
      where: { tripId },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(expenses);
  } catch (error) {
    console.error("Error fetching expenses:", error);
    return NextResponse.json(
      { error: "Error fetching expenses" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request, { params }: Params) {
  try {
    const { tripId } = await params;
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verificar que el trip pertenece al usuario
    const trip = await prisma.trip.findFirst({
      where: {
        id: tripId,
        userId: session.user.id,
      },
    });

    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    const body = await request.json();
    const validatedData = createExpenseSchema.parse(body);

    // Crear expense y actualizar total en una transacción
    const [expense] = await prisma.$transaction([
      prisma.expense.create({
        data: {
          tripId,
          amount: new Prisma.Decimal(validatedData.amount),
          date: new Date(validatedData.date),
          category: validatedData.category,
          vendor: validatedData.vendor,
          description: validatedData.description,
          receiptUrl: validatedData.receiptUrl,
          invoiceNumber: validatedData.invoiceNumber, 
          paymentMethod: validatedData.paymentMethod,
        },
      }),
      prisma.trip.update({
        where: { id: tripId },
        data: {
          totalAmount: {
            increment: validatedData.amount,
          },
        },
      }),
    ]);

    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error },
        { status: 400 },
      );
    }
    console.error("Error creating expense:", error);
    return NextResponse.json(
      { error: "Error creating expense" },
      { status: 500 },
    );
  }
}
