import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { createTripSchema } from "@/lib/validations";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "9");
    const skip = (page - 1) * limit;

    // ✅ USER solo ve viajes asignados a él
    const whereClause = {
      assignedUsers: {
        some: {
          userId: session.user.id,
        },
      },
    };

    const [trips, totalCount] = await Promise.all([
      prisma.trip.findMany({
        where: whereClause,
        include: {
          assignedUsers: {
            include: {
              user: {
                select: { id: true, name: true, email: true },
              },
            },
          },
          expenses: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.trip.count({ where: whereClause }),
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
    return NextResponse.json({ error: "Error fetching trips" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ✅ SOLO ADMIN puede crear viajes
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Only admins can create trips" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = createTripSchema.parse(body);

    // ✅ Crear viaje con asignaciones en una transacción
    const trip = await prisma.$transaction(async (tx) => {
      const newTrip = await tx.trip.create({
        data: {
          createdByAdminId: session.user.id,
          city: validatedData.city,
          startDate: new Date(validatedData.startDate),
          endDate: new Date(validatedData.endDate),
          project: validatedData.project,
          notes: validatedData.notes,
          // ✅ Crear asignaciones
          assignedUsers: {
            create: validatedData.assignedUserIds.map((userId) => ({
              userId,
            })),
          },
        },
        include: {
          assignedUsers: {
            include: {
              user: {
                select: { id: true, name: true, email: true },
              },
            },
          },
          expenses: true,
        },
      });

      return newTrip;
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
    return NextResponse.json({ error: "Error creating trip" }, { status: 500 });
  }
}