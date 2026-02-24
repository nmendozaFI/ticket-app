import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import cloudinary from "@/lib/cloudinary";
import prisma from "@/lib/db";
import { getDayNumber } from "@/lib/utils";


export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const image = formData.get("image") as File;
    const tripId = formData.get("tripId") as string;

    if (!image || !tripId) {
      return NextResponse.json(
        { error: "Missing image or tripId" },
        { status: 400 },
      );
    }

    // ✅ Obtener el trip para conseguir el numberInvoice
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      select: { numberInvoice: true, city: true, createdAt: true },
    });

    if (!trip) {
      return NextResponse.json(
        { error: "Trip not found" },
        { status: 404 },
      );
    }

    // Convertir File a Buffer
    const arrayBuffer = await image.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Generar nombre único para el archivo
    const timestamp = Date.now();
    const originalName = image.name.replace(/\.[^/.]+$/, ""); // Sin extensión

    // ✅ Usar numberInvoice si existe, sino usar tripId como fallback
    const uploadDate = new Date();
    const year = uploadDate.getFullYear();
    const month = String(uploadDate.getMonth() + 1).padStart(2, "0");
    
    // ✅ Nombre de carpeta basado en numberInvoice o tripId + ciudad
    const folderName = trip.numberInvoice 
      ? trip.numberInvoice.replace(/[^a-zA-Z0-9-_]/g, "_") // Sanitizar para Cloudinary
      : `${trip.city}_day${getDayNumber(trip.createdAt)}`; // Fallback: ciudad + primeros 8 chars del tripId

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            // ✅ Estructura: tickets/año/mes/numberInvoice/
            folder: `tickets/${year}/${month}/${folderName}`,
            public_id: `${timestamp}_${originalName}`,
            resource_type: "auto",
            format: "jpg",
            transformation: [
              { quality: "auto:good" },
              { fetch_format: "auto" },
            ],
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          },
        )
        .end(buffer);
    });

    return NextResponse.json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      folder: result.folder,
    });
  } catch (error) {
    console.error("Upload Error:", error);
    return NextResponse.json(
      { error: "Error uploading image" },
      { status: 500 },
    );
  }
}