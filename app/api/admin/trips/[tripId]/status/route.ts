import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { updateStatusSchema } from "@/lib/validations"; 
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

type Params = {
  params: Promise<{ tripId: string }>;
};

export async function PUT(request: Request, { params }: Params) {
  try {
    const { tripId } = await params;
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { status } = updateStatusSchema.parse(body); // ✅ Usar schema correcto

    const trip = await prisma.trip.update({
      where: { id: tripId },
      data: { status },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        expenses: true,
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
    console.error("Error updating trip status:", error);
    return NextResponse.json(
      { error: "Error updating trip status" },
      { status: 500 }
    );
  }
}