import prisma from "@/lib/db";
import { NextResponse } from "next/server";

type Params = {
  params: Promise<{ tripId: string }>
};

export async function GET(_: Request, { params }: Params) {
    const { tripId } = await params
  const expenses = await prisma.expense.findMany({
    where: { tripId: tripId },
    orderBy: { date: "desc" },
  });

  return NextResponse.json(expenses);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ tripId: string }> },
) {
  const { tripId } = await params
  const body = await request.json();

  const expense = await prisma.expense.create({
    data: {
      tripId,
      amount: body.amount,
      date: new Date(body.date),
      category: body.category,
      vendor: body.vendor,
      description: body.description,
      receiptUrl: body.receiptUrl,
    },
  });

  // 🔥 actualizar total del viaje
  await prisma.trip.update({
    where: { id: tripId },
    data: {
      totalAmount: {
        increment: body.amount,
      },
    },
  });

  return NextResponse.json(expense);
}
