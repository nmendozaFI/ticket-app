"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Evento beforeinstallprompt (no tipado nativamente en TS todavía).
 */
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

type InstallState = "unsupported" | "available" | "installed" | "ios";

/**
 * Detecta el estado inicial SIN tocar React state dentro de useEffect.
 * Se ejecuta solo en cliente (por eso comprobamos `typeof window`).
 */
function detectInitialState(): InstallState {
  if (typeof window === "undefined") return "unsupported";

  // ¿Ya está instalada? (modo standalone o iOS standalone)
  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    // @ts-expect-error - propiedad no estándar de iOS
    window.navigator.standalone === true;

  if (isStandalone) return "installed";

  // Detectar iOS (Safari no soporta beforeinstallprompt)
  const isIOS =
    /iPad|iPhone|iPod/.test(navigator.userAgent) &&
    // @ts-expect-error - MSStream es propiedad legacy
    !window.MSStream;

  if (isIOS) return "ios";

  // Por defecto: 'unsupported' hasta que dispare beforeinstallprompt
  return "unsupported";
}

/**
 * Hook para gestionar la instalación de la PWA.
 *
 * - Escucha `beforeinstallprompt` (Chrome/Edge/Android)
 * - Detecta si la app ya está instalada (display-mode: standalone)
 * - Detecta iOS (Safari no dispara el evento → instrucciones manuales)
 */
export function useInstallPrompt() {
  // Lazy initializer: React llama a la función UNA sola vez en el primer render.
  // Así evitamos setState síncrono en useEffect.
  const [state, setState] = useState<InstallState>(detectInitialState);
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // Si ya detectamos que está instalada o es iOS, no hay nada que escuchar
    if (state === "installed" || state === "ios") return;

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setState("available");
    };

    const handleInstalled = () => {
      setDeferredPrompt(null);
      setState("installed");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, [state]);

  const promptInstall = useCallback(async (): Promise<
    "accepted" | "dismissed" | null
  > => {
    if (!deferredPrompt) return null;

    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    setDeferredPrompt(null);

    if (choice.outcome === "accepted") {
      setState("installed");
    }

    return choice.outcome;
  }, [deferredPrompt]);

  return {
    state,
    canInstall: state === "available",
    isInstalled: state === "installed",
    isIOS: state === "ios",
    promptInstall,
  };
}