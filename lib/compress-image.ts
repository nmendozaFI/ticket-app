/**
 * Utilidad de compresión de imágenes para subida de tickets.
 *
 * Por qué existe:
 * - Móviles Android modernos generan fotos de 5-15 MB que rompen el límite
 *   de 4.5 MB del body de Vercel y el de 5 MB de Claude Vision.
 * - Subir 10 MB por 4G débil tarda eternidades y agota timeouts.
 * - HEIC/AVIF/WebP no siempre son aceptados por Claude → convertimos a JPEG.
 *
 * Qué hace:
 * - Redimensiona a un ancho máximo (default 1600px) manteniendo aspect ratio.
 * - Comprime a JPEG con calidad configurable (default 0.85).
 * - Corrige rotación EXIF (problema típico de Android: fotos giradas 90°).
 * - Reintenta con más compresión si la primera pasada queda muy grande.
 *
 * Cómo se usa:
 *   const compressed = await compressImage(file);
 *   formData.append("image", compressed);
 *
 * Sin dependencias externas — solo APIs nativas del navegador.
 */

export interface CompressImageOptions {
  /** Ancho máximo en píxeles. Default: 1600 (sobra para OCR de tickets). */
  maxWidth?: number;
  /** Alto máximo en píxeles. Default: 1600. */
  maxHeight?: number;
  /** Calidad JPEG (0-1). Default: 0.85. */
  quality?: number;
  /** Tamaño máximo final en bytes. Si se supera, reintenta con más compresión. Default: 4 MB. */
  maxSizeBytes?: number;
  /** Tipo MIME de salida. Default: 'image/jpeg'. */
  outputType?: "image/jpeg" | "image/webp";
}

const DEFAULTS: Required<CompressImageOptions> = {
  maxWidth: 1600,
  maxHeight: 1600,
  quality: 0.85,
  maxSizeBytes: 4 * 1024 * 1024, // 4 MB (deja margen vs los 4.5 MB de Vercel)
  outputType: "image/jpeg",
};

/**
 * Comprime y redimensiona una imagen para subida.
 * @throws Si el archivo no es una imagen procesable.
 */
export async function compressImage(
  file: File,
  options: CompressImageOptions = {}
): Promise<File> {
  const opts = { ...DEFAULTS, ...options };

  // Si no es una imagen, no hay nada que comprimir
  if (!file.type.startsWith("image/")) {
    throw new Error("El archivo no es una imagen");
  }

  // HEIC/HEIF: muchos navegadores no pueden decodificarlo nativamente.
  // En la práctica, iOS Safari y Chrome iOS SÍ pueden, pero Android Chrome NO.
  // Si detectamos HEIC en un navegador que no lo soporta, avisamos.
  const isHeic =
    file.type === "image/heic" ||
    file.type === "image/heif" ||
    /\.(heic|heif)$/i.test(file.name);

  if (isHeic && !canDecodeHeic()) {
    throw new Error(
      "Tu navegador no puede procesar fotos HEIC. Configura la cámara para guardar en JPEG, o vuelve a hacer la foto desde otra app."
    );
  }

  // Cargar la imagen en un HTMLImageElement
  const bitmap = await loadImage(file);

  // Calcular las nuevas dimensiones (manteniendo aspect ratio)
  const { width, height } = calculateNewDimensions(
    bitmap.width,
    bitmap.height,
    opts.maxWidth,
    opts.maxHeight
  );

  // Dibujar en canvas con las nuevas dimensiones
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    cleanupBitmap(bitmap);
    throw new Error("No se pudo procesar la imagen (canvas no disponible)");
  }

  // Fondo blanco para JPEGs con transparencia (PNG → JPEG)
  if (opts.outputType === "image/jpeg") {
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, width, height);
  }

  ctx.drawImage(bitmap, 0, 0, width, height);
  cleanupBitmap(bitmap);

  // Comprimir, reintentando con menos calidad si queda muy grande
  let quality = opts.quality;
  let blob = await canvasToBlob(canvas, opts.outputType, quality);

  // Si quedó demasiado grande, bajamos la calidad progresivamente
  // (máximo 3 intentos: 0.85 → 0.7 → 0.55 → 0.4)
  let attempts = 0;
  while (blob.size > opts.maxSizeBytes && attempts < 3) {
    quality = Math.max(0.4, quality - 0.15);
    blob = await canvasToBlob(canvas, opts.outputType, quality);
    attempts++;
  }

  // Si TODAVÍA está muy grande, reducimos dimensiones (último recurso)
  if (blob.size > opts.maxSizeBytes) {
    const scale = Math.sqrt(opts.maxSizeBytes / blob.size);
    canvas.width = Math.floor(width * scale);
    canvas.height = Math.floor(height * scale);
    const ctx2 = canvas.getContext("2d");
    if (ctx2) {
      if (opts.outputType === "image/jpeg") {
        ctx2.fillStyle = "#FFFFFF";
        ctx2.fillRect(0, 0, canvas.width, canvas.height);
      }
      // Recargamos la imagen original para el segundo dibujo
      const bitmap2 = await loadImage(file);
      ctx2.drawImage(bitmap2, 0, 0, canvas.width, canvas.height);
      cleanupBitmap(bitmap2);
      blob = await canvasToBlob(canvas, opts.outputType, 0.75);
    }
  }

  // Construir el nombre del archivo final con la extensión correcta
  const extension = opts.outputType === "image/jpeg" ? "jpg" : "webp";
  const baseName = file.name.replace(/\.[^.]+$/, "") || "ticket";
  const finalName = `${baseName}.${extension}`;

  return new File([blob], finalName, {
    type: opts.outputType,
    lastModified: Date.now(),
  });
}

/**
 * Carga una imagen como HTMLImageElement.
 * Usa createImageBitmap cuando está disponible (más rápido, respeta EXIF).
 * Fallback a Image + Object URL para navegadores antiguos.
 */
async function loadImage(file: File): Promise<HTMLImageElement | ImageBitmap> {
  // createImageBitmap respeta la orientación EXIF automáticamente con la opción.
  // Esto soluciona el problema de Android donde las fotos salen giradas 90°.
  if (typeof createImageBitmap === "function") {
    try {
      return await createImageBitmap(file, {
        imageOrientation: "from-image",
      });
    } catch {
      // Algunos navegadores no soportan la opción imageOrientation
      // → fallback a Image
    }
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("No se pudo cargar la imagen"));
    };

    img.src = url;
  });
}

function cleanupBitmap(bitmap: HTMLImageElement | ImageBitmap): void {
  if (bitmap instanceof ImageBitmap) {
    bitmap.close();
  }
}

function calculateNewDimensions(
  origWidth: number,
  origHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  // Si ya está dentro del límite, no escalar
  if (origWidth <= maxWidth && origHeight <= maxHeight) {
    return { width: origWidth, height: origHeight };
  }

  const widthRatio = maxWidth / origWidth;
  const heightRatio = maxHeight / origHeight;
  const ratio = Math.min(widthRatio, heightRatio);

  return {
    width: Math.round(origWidth * ratio),
    height: Math.round(origHeight * ratio),
  };
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("No se pudo generar la imagen comprimida"));
      },
      type,
      quality
    );
  });
}

function canDecodeHeic(): boolean {
  // iOS Safari y iOS Chrome pueden decodificar HEIC nativamente.
  // Android Chrome y la mayoría de browsers desktop NO.
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua);
  return isIOS;
}

/**
 * Helper para mostrar al usuario qué pasó con la compresión.
 * Útil para debug o para mostrar un toast informativo.
 */
export function formatCompressionStats(
  original: File,
  compressed: File
): string {
  const origMb = (original.size / 1024 / 1024).toFixed(2);
  const compMb = (compressed.size / 1024 / 1024).toFixed(2);
  const ratio = Math.round((1 - compressed.size / original.size) * 100);
  return `${origMb} MB → ${compMb} MB (${ratio}% menos)`;
}