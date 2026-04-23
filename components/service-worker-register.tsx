"use client";

import { useEffect } from "react";

/**
 * Registra el Service Worker una vez que la app está cargada.
 * Se monta en el layout raíz.
 *
 * En desarrollo (NODE_ENV !== "production") NO se registra para evitar
 * problemas de cache con HMR de Next.js.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    const register = async () => {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
        });

        // Detectar actualizaciones del SW
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (!newWorker) return;

          newWorker.addEventListener("statechange", () => {
            if (
              newWorker.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              // Hay una nueva versión disponible.
              // Podrías mostrar un toast aquí si quieres.
              console.log("[SW] Nueva versión disponible");
            }
          });
        });
      } catch (err) {
        console.warn("[SW] Registro fallido:", err);
      }
    };

    // Registrar tras el 'load' para no competir con recursos críticos
    if (document.readyState === "complete") {
      register();
    } else {
      window.addEventListener("load", register, { once: true });
    }
  }, []);

  return null;
}