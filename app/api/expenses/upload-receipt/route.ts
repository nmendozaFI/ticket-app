import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import cloudinary from "@/lib/cloudinary";

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

    // Convertir File a Buffer
    const arrayBuffer = await image.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Generar nombre único para el archivo
    const timestamp = Date.now();
    const originalName = image.name.replace(/\.[^/.]+$/, ""); // Sin extensión

    // Subir a Cloudinary
    // ✅ Subir a carpeta organizada: tickets/año/mes/tripId/
    const uploadDate = new Date();
    const year = uploadDate.getFullYear();
    const month = String(uploadDate.getMonth() + 1).padStart(2, "0");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: `tickets/${year}/${month}/${tripId}`, // ✅ Estructura organizada
            public_id: `${timestamp}_${originalName}`, // ✅ Nombre único
            resource_type: "auto",
            format: "jpg",
            transformation: [
              { quality: "auto:good" }, // Optimizar calidad
              { fetch_format: "auto" }, // Formato óptimo
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
