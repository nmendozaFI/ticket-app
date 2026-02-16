import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { createTripSchema } from "@/lib/validations";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ✅ Obtener parámetros de paginación
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "9");
    const skip = (page - 1) * limit;

    // ✅ Consulta con paginación
    const [trips, totalCount] = await Promise.all([
      prisma.trip.findMany({
        where: {
          userId: session.user.id,
        },
        include: {
          expenses: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.trip.count({
        where: {
          userId: session.user.id,
        },
      }),
    ]);

    return NextResponse.json({
      trips,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasMore: skip + trips.length < totalCount,
      },
    });
  } catch (error) {
    console.error("Error fetching trips:", error);
    return NextResponse.json(
      { error: "Error fetching trips" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createTripSchema.parse(body);

    const trip = await prisma.trip.create({
      data: {
        userId: session.user.id,
        city: validatedData.city,
        startDate: new Date(validatedData.startDate),
        endDate: new Date(validatedData.endDate),
        project: validatedData.project,
        notes: validatedData.notes,
      },
      include: {
        expenses: true,
      },
    });

    return NextResponse.json(trip, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error },
        { status: 400 }
      );
    }
    console.error("Error creating trip:", error);
    return NextResponse.json(
      { error: "Error creating trip" },
      { status: 500 }
    );
  }
}