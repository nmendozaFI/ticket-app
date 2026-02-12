import prisma from "@/lib/db"
import { NextResponse } from "next/server"

type Params = {
  params: Promise<{ expenseId: string }>
}

export async function PUT(request: Request, { params }: Params) {
  const { expenseId } = await params
  const body = await request.json()

  const expense = await prisma.expense.update({
    where: { id: expenseId },
    data: {
      amount: body.amount,
      date: new Date(body.date),
      category: body.category,
      vendor: body.vendor,
      description: body.description,
      receiptUrl: body.receiptUrl,
    },
  })

  return NextResponse.json(expense)
}

export async function DELETE(_: Request, { params }: Params) {
  const { expenseId } = await params
  await prisma.expense.delete({
    where: { id: expenseId },
  })

  return NextResponse.json({ ok: true })
}
