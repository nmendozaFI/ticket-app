import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

type Params = {
  params: Promise<{ tripId: string }>;
};

export async function GET(_: Request, { params }: Params) {
  try {
    const { tripId } = await params;
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const trip = await prisma.trip.findUnique({
      where: {
        id: tripId,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
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
    console.error("Error fetching admin trip:", error);
    return NextResponse.json(
      { error: "Error fetching trip" },
      { status: 500 }
    );
  }
}