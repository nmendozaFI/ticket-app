import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ✅ Obtener TODOS los trips del usuario para stats
    const trips = await prisma.trip.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        expenses: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(trips);
  } catch (error) {
    console.error("Error fetching trip stats:", error);
    return NextResponse.json(
      { error: "Error fetching trip stats" },
      { status: 500 }
    );
  }
}