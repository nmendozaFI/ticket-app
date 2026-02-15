import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

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

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    // Convertir imagen a base64
    const arrayBuffer = await image.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString("base64");
    const mediaType = image.type as "image/jpeg" | "image/png" | "image/webp";

    // Llamar a Claude Vision para extraer datos del ticket
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType,
                data: base64Image,
              },
            },
            {
              type: "text",
              text: `Analiza este ticket/recibo y extrae la siguiente información en formato JSON:
{
  "vendor": "nombre del establecimiento/proveedor",
  "amount": número (solo el monto total, sin símbolos),
  "date": "YYYY-MM-DD" (fecha del ticket),
  "invoiceNumber": "número de factura o ticket",
  "category": "una de estas opciones: Taxi, Comida, Hotel, Metrobus/Parking, Gasolina",
  "description": "descripción breve de los items"
}

IMPORTANTE:
- Para category, elige la más apropiada según el tipo de establecimiento
- Si no encuentras algún dato, usa null
- El amount debe ser un número sin símbolos de moneda
- Responde SOLO con el JSON, sin texto adicional`,
            },
          ],
        },
      ],
    });

    const responseText = message.content[0].type === "text" 
      ? message.content[0].text 
      : "";

    // Parsear respuesta JSON
    const cleanedResponse = responseText.replace(/```json\n?|\n?```/g, "").trim();
    const extractedData = JSON.parse(cleanedResponse);

    return NextResponse.json({
      success: true,
      data: extractedData,
    });
  } catch (error) {
    console.error("OCR Error:", error);
    return NextResponse.json(
      { 
        error: "Error processing image",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}