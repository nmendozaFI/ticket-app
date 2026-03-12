/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/admin/migrate-to-sharepoint/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import cloudinary from "@/lib/cloudinary";
import { uploadFileToSharePoint } from "@/lib/microsoft-graph";

interface MigrationResult {
  success: number;
  failed: number;
  total: number;
  details: Array<{
    file: string;
    status: "success" | "error";
    sharePointUrl?: string;
    error?: string;
  }>;
}

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { year, month } = body; // Ejemplo: { year: 2026, month: 3 }

    // Si no especifican, usar el mes anterior
    const targetDate = year && month 
      ? new Date(year, month - 1)
      : new Date(new Date().getFullYear(), new Date().getMonth() - 1);

    const targetYear = targetDate.getFullYear();
    const targetMonth = String(targetDate.getMonth() + 1).padStart(2, "0");

    console.log(`Starting migration for ${targetYear}/${targetMonth}`);

    // 1. Listar archivos en Cloudinary del mes específico
    const folderPrefix = `tickets/${targetYear}/${targetMonth}`;
    
    const cloudinaryFiles = await listCloudinaryFiles(folderPrefix);
    
    if (cloudinaryFiles.length === 0) {
      return NextResponse.json({
        message: "No files found for the specified period",
        result: { success: 0, failed: 0, total: 0, details: [] },
      });
    }

    const result: MigrationResult = {
      success: 0,
      failed: 0,
      total: cloudinaryFiles.length,
      details: [],
    };

    // 2. Procesar cada archivo
    for (const file of cloudinaryFiles) {
      try {
        // Descargar de Cloudinary
        const fileBuffer = await downloadFromCloudinary(file.secure_url);

        // Extraer path relativo: tickets/2026/03/158/archivo.jpg → 2026/03/158
        const pathParts = file.public_id.split("/");
        const folderPath = pathParts.slice(1, -1).join("/"); // Quita "tickets" y el nombre de archivo
        const fileName = pathParts[pathParts.length - 1] + "." + file.format;

        // Subir a SharePoint
        const sharePointUrl = await uploadFileToSharePoint(
          fileName,
          fileBuffer,
          folderPath
        );

        result.success++;
        result.details.push({
          file: file.public_id,
          status: "success",
          sharePointUrl,
        });

        // Log en base de datos (opcional)
        await logMigration(file.public_id, sharePointUrl, "success");

      } catch (error: any) {
        console.error(`Error migrating ${file.public_id}:`, error);
        
        result.failed++;
        result.details.push({
          file: file.public_id,
          status: "error",
          error: error.message,
        });

        await logMigration(file.public_id, "", "error", error.message);
      }
    }

    return NextResponse.json({
      message: `Migration completed: ${result.success} successful, ${result.failed} failed`,
      result,
    });

  } catch (error: any) {
    console.error("Migration error:", error);
    return NextResponse.json(
      { error: "Migration failed", details: error.message },
      { status: 500 }
    );
  }
}

async function listCloudinaryFiles(prefix: string): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const files: any[] = [];

    cloudinary.api.resources(
      {
        type: "upload",
        prefix,
        max_results: 500,
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result.resources);
        }
      }
    );
  });
}

async function downloadFromCloudinary(url: string): Promise<Buffer> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download from Cloudinary: ${response.statusText}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

async function logMigration(
  cloudinaryId: string,
  sharePointUrl: string,
  status: string,
  error?: string
): Promise<void> {
  // Opcional: crear tabla MigrationLog en Prisma para tracking
  console.log({
    cloudinaryId,
    sharePointUrl,
    status,
    error,
    timestamp: new Date().toISOString(),
  });
}

// ✅ Endpoint para verificar conexión
export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { checkSharePointConnection } = await import("@/lib/microsoft-graph");
    const isConnected = await checkSharePointConnection();

    return NextResponse.json({
      connected: isConnected,
      message: isConnected 
        ? "SharePoint connection OK" 
        : "SharePoint connection failed",
    });

  } catch (error: any) {
    return NextResponse.json(
      { connected: false, error: error.message },
      { status: 500 }
    );
  }
}