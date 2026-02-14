import { Prisma } from "@/app/generated/prisma/client";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { updateTripSchema } from "@/lib/validations";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
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

    const trip = await prisma.trip.findFirst({
      where: {
        id: tripId,
        userId: session.user.id,
      },
      include: {
        expenses: {
          orderBy: {
            date: "desc",
          },
        },
      },
    });

    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    return NextResponse.json(trip);
  } catch (error) {
    console.error("Error fetching trip:", error);
    return NextResponse.json(
      { error: "Error fetching trip" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const { tripId } = await params;
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verificar ownership
    const existingTrip = await prisma.trip.findFirst({
      where: {
        id: tripId,
        userId: session.user.id,
      },
    });

    if (!existingTrip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    const body = await request.json();
    const validatedData = updateTripSchema.parse(body);

    // Construir objeto de actualización con tipos correctos
    const updateData: Prisma.TripUpdateInput = {};

    if (validatedData.city !== undefined) updateData.city = validatedData.city;
    if (validatedData.project !== undefined)
      updateData.project = validatedData.project;
    if (validatedData.notes !== undefined) updateData.notes = validatedData.notes;
    if (validatedData.status !== undefined)
      updateData.status = validatedData.status;

    if (validatedData.startDate !== undefined) {
      updateData.startDate = new Date(validatedData.startDate);
    }
    if (validatedData.endDate !== undefined) {
      updateData.endDate = new Date(validatedData.endDate);
    }
    if (validatedData.totalAmount !== undefined) {
      updateData.totalAmount = new Prisma.Decimal(validatedData.totalAmount);
    }

    const trip = await prisma.trip.update({
      where: { id: tripId },
      data: updateData,
      include: {
        expenses: {
          orderBy: {
            date: "desc",
          },
        },
      },
    });

    return NextResponse.json(trip);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error },
        { status: 400 }
      );
    }
    console.error("Error updating trip:", error);
    return NextResponse.json(
      { error: "Error updating trip" },
      { status: 500 }
    );
  }
}

export async function DELETE(_: Request, { params }: Params) {
  try {
    const { tripId } = await params;
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verificar ownership
    const existingTrip = await prisma.trip.findFirst({
      where: {
        id: tripId,
        userId: session.user.id,
      },
    });

    if (!existingTrip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    await prisma.trip.delete({
      where: { id: tripId },
    });

    return NextResponse.json({ ok: true, message: "Trip deleted successfully" });
  } catch (error) {
    console.error("Error deleting trip:", error);
    return NextResponse.json(
      { error: "Error deleting trip" },
      { status: 500 }
    );
  }
}