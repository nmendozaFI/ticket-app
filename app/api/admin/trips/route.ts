import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ✅ Obtener parámetros de paginación
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "15");
    const skip = (page - 1) * limit;

    // ✅ Consulta con paginación
    const [trips, totalCount] = await Promise.all([
      prisma.trip.findMany({
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
      prisma.trip.count(),
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
    console.error("Error fetching admin trips:", error);
    return NextResponse.json(
      { error: "Error fetching trips" },
      { status: 500 },
    );
  }
}
