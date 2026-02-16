import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ✅ Obtener TODOS los trips para stats
    const trips = await prisma.trip.findMany({
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        expenses: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(trips);
  } catch (error) {
    console.error("Error fetching admin trip stats:", error);
    return NextResponse.json(
      { error: "Error fetching trip stats" },
      { status: 500 }
    );
  }
}