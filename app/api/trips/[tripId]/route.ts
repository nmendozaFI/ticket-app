import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

type Params = {
  params: Promise<{ tripId: string }>;
};

export async function GET(_: Request, { params }: Params) {
  const { tripId } = await params;
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const trip = await prisma.trip.findFirst({
    where: {
      id: tripId,
      userId: session.user.id,
    },
    include: {
      expenses: true,
    },
  });

  return NextResponse.json(trip);
}

export async function PUT(request: Request, { params }: { params: { tripId: string } }) {
  const { tripId } = params
  const body = await request.json()

  const trip = await prisma.trip.update({
    where: { id: tripId },
    data: {
      city: body.city,
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
      project: body.project,
      notes: body.notes,
    },
  })

  return NextResponse.json(trip)
}

export async function DELETE(_: Request, { params }: Params) {
  const { tripId } = await params;
  await prisma.trip.delete({
    where: { id: tripId },
  });

  return NextResponse.json({ ok: true });
}
