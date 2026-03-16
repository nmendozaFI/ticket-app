"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Camera, ImageIcon, X, Loader2, ExternalLink } from "lucide-react";
import Image from "next/image";

interface ImageCaptureProps {
  previewUrl: string | null;
  receiptUrl: string;
  isProcessing: boolean;
  onFileSelected: (file: File) => void;
  onRemove: () => void;
}

/**
 * ImageCapture component
 *
 * Solves Android/iOS inconsistency where `<input type="file">` with `capture`
 * attribute behaves differently across browsers and manufacturers.
 *
 * Strategy:
 * - Desktop: single file input, standard browser dialog
 * - Mobile: bottom sheet with two explicit inputs:
 *     1. `<input capture="environment">` → opens camera directly
 *     2. `<input accept="image/*">` (no capture) → opens gallery
 *
 * This bypasses the OS-level ambiguity entirely.
 */
export function ImageCapture({
  previewUrl,
  receiptUrl,
  isProcessing,
  onFileSelected,
  onRemove,
}: ImageCaptureProps) {
  const [showSheet, setShowSheet] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const cameraInputRef = React.useRef<HTMLInputElement>(null);
  const galleryInputRef = React.useRef<HTMLInputElement>(null);

  // Detect mobile on mount — SSR-safe
  React.useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Close sheet on outside click
  React.useEffect(() => {
    if (!showSheet) return;
    const handler = (e: MouseEvent) => {
      const sheet = document.getElementById("image-capture-sheet");
      if (sheet && !sheet.contains(e.target as Node)) {
        setShowSheet(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showSheet]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    // Reset input so the same file can be re-selected if needed
    e.target.value = "";
    setShowSheet(false);
    onFileSelected(file);
  }

  function handleUploadClick() {
    if (isMobile) {
      setShowSheet(true);
    } else {
      fileInputRef.current?.click();
    }
  }

  return (
    <div className="border-2 border-dashed rounded-lg p-6 space-y-4">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-base font-semibold">Escanear Ticket</p>
          <p className="text-sm text-muted-foreground">
            Sube una foto del recibo para autocompletar
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleUploadClick}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Procesando...
            </>
          ) : (
            <>
              <Camera className="w-4 h-4 mr-2" />
              {previewUrl ? "Cambiar Foto" : "Subir Foto"}
            </>
          )}
        </Button>
      </div>

      {/* Desktop: single input (browser handles camera vs gallery natively) */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="hidden"
      />

      {/* Mobile: two dedicated inputs */}
      {/* 1. Camera — `capture="environment"` opens rear camera directly */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleChange}
        className="hidden"
      />
      {/* 2. Gallery — no `capture` attribute, opens file picker / gallery */}
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="hidden"
      />

      {/* Preview */}
      {previewUrl && (
        <div className="space-y-2">
          <div className="relative w-full h-64 rounded-lg overflow-hidden border bg-muted">
            <Image
              src={previewUrl}
              alt="Recibo"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-contain"
              unoptimized={!previewUrl.startsWith("http")}
            />
          </div>
          <div className="flex gap-2">
            {receiptUrl && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex-1"
                asChild
              >
                <a href={receiptUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Ver Original
                </a>
              </Button>
            )}
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={onRemove}
            >
              <X className="w-4 h-4 mr-2" />
              Eliminar
            </Button>
          </div>
        </div>
      )}

      {/* Mobile bottom sheet overlay */}
      {showSheet && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/40">
          <div
            id="image-capture-sheet"
            className="w-full bg-background rounded-t-2xl p-6 space-y-3 shadow-xl"
          >
            <p className="text-center text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
              Añadir imagen
            </p>

            {/* Camera button */}
            <button
              type="button"
              className="w-full flex items-center gap-4 p-4 rounded-xl border hover:bg-accent transition-colors text-left"
              onClick={() => cameraInputRef.current?.click()}
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Camera className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Tomar foto</p>
                <p className="text-xs text-muted-foreground">
                  Abre la cámara directamente
                </p>
              </div>
            </button>

            {/* Gallery button */}
            <button
              type="button"
              className="w-full flex items-center gap-4 p-4 rounded-xl border hover:bg-accent transition-colors text-left"
              onClick={() => galleryInputRef.current?.click()}
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <ImageIcon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Elegir de galería</p>
                <p className="text-xs text-muted-foreground">
                  Selecciona una foto guardada
                </p>
              </div>
            </button>

            {/* Cancel */}
            <button
              type="button"
              className="w-full p-4 rounded-xl text-center text-sm font-medium text-muted-foreground hover:bg-accent transition-colors"
              onClick={() => setShowSheet(false)}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}