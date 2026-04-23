"use client";

import { useState } from "react";
import { Download, Check, Smartphone, Share } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useInstallPrompt } from "@/hooks/use-install-prompt";

/**
 * Sección de instalación de la PWA para la página /profile.
 *
 * Estados:
 * - available: muestra botón "Instalar aplicación"
 * - installed: muestra confirmación "Ya instalada"
 * - ios: muestra instrucciones manuales para Safari
 * - unsupported: no se muestra (navegador no compatible)
 */
export function PWAInstallSection() {
  const { state, canInstall, isInstalled, isIOS, promptInstall } = useInstallPrompt();
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  if (state === "unsupported") {
    // No mostrar nada si el navegador no soporta instalación
    return null;
  }

  const handleInstall = async () => {
    const result = await promptInstall();
    if (result === "accepted") {
      toast.success("Aplicación instalada correctamente");
    } else if (result === "dismissed") {
      toast.info("Instalación cancelada");
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Smartphone className="h-5 w-5 text-blue-600" />
          <CardTitle>Aplicación móvil</CardTitle>
        </div>
        <CardDescription>
          Instala la aplicación en tu dispositivo para acceder más rápido y trabajar sin abrir el navegador.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {isInstalled && (
          <Alert className="border-green-200 bg-green-50 dark:bg-green-950/30">
            <Check className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-900 dark:text-green-100">
              Aplicación instalada
            </AlertTitle>
            <AlertDescription className="text-green-800 dark:text-green-200">
              Ya tienes la aplicación instalada en este dispositivo. Puedes abrirla desde tu pantalla de inicio.
            </AlertDescription>
          </Alert>
        )}

        {canInstall && (
          <div className="space-y-3">
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Acceso directo desde tu pantalla de inicio</li>
              <li>Funciona como una app nativa (sin barra del navegador)</li>
              <li>Carga más rápido gracias al caché</li>
            </ul>
            <Button onClick={handleInstall} size="lg" className="w-full sm:w-auto">
              <Download className="h-4 w-4 mr-2" />
              Instalar aplicación
            </Button>
          </div>
        )}

        {isIOS && (
          <div className="space-y-3">
            <Alert>
              <Smartphone className="h-4 w-4" />
              <AlertTitle>Instalación en iOS</AlertTitle>
              <AlertDescription>
                En Safari, la instalación se hace manualmente. Sigue los pasos a continuación.
              </AlertDescription>
            </Alert>

            <Button
              variant="outline"
              onClick={() => setShowIOSInstructions((s) => !s)}
              className="w-full sm:w-auto"
            >
              {showIOSInstructions ? "Ocultar" : "Ver"} instrucciones
            </Button>

            {showIOSInstructions && (
              <ol className="text-sm space-y-2 border-l-2 border-blue-500 pl-4 ml-2">
                <li className="flex gap-2">
                  <span className="font-semibold">1.</span>
                  <span>
                    Toca el botón <Share className="inline h-4 w-4 mx-1" />
                    <strong>Compartir</strong> en la barra inferior de Safari.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold">2.</span>
                  <span>
                    Desliza y selecciona <strong>&quot;Añadir a pantalla de inicio&quot;</strong>.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold">3.</span>
                  <span>
                    Toca <strong>&quot;Añadir&quot;</strong> en la esquina superior derecha.
                  </span>
                </li>
              </ol>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}