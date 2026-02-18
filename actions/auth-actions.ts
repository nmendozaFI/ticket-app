"use server";

import { redirect } from "next/navigation";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { APIError } from "better-auth";

export const signUp = async (email: string, password: string, name: string) => {
  try {
    const result = await auth.api.signUpEmail({
      body: { email, password, name, callbackURL: "/" },
    });
    return { success: true, user: result };  // Éxito: retorna user
  } catch (error) {
    if (error instanceof APIError) {
      // Mensajes user-friendly basados en código de error común
      if (error.body?.code === "EMAIL_EXISTS") {
        return { success: false, error: "El email ya está en uso." };
      }
      return { success: false, error: "Error al crear cuenta. Verifica los datos." };
    }
    return { success: false, error: "Error interno al crear cuenta." };
  }
};

export const signIn = async (email: string, password: string) => {
 try {
    const result = await auth.api.signInEmail({
      body: { email, password, callbackURL: "/" },
    });
    return { success: true, user: result };  // Éxito
  } catch (error) {
    if (error instanceof APIError) {
      // Códigos comunes: INVALID_CREDENTIALS, EMAIL_NOT_VERIFIED, etc.
      if (error.body?.code === "INVALID_CREDENTIALS") {
        return { success: false, error: "Email o contraseña incorrectos." };
      }
      if (error.body?.code === "EMAIL_NOT_VERIFIED") {
        return { success: false, error: "Verifica tu email antes de iniciar sesión." };
      }
      return { success: false, error: "Credenciales inválidas." };
    }
    return { success: false, error: "Error al iniciar sesión." };
  }
};

export const signInSocial = async (provider: "microsoft") => {
  const { url } = await auth.api.signInSocial({
    body: {
      provider,
      callbackURL: "/",
    },
  });

  if (url) {
    redirect(url);
  }
};

export const signOut = async () => {
  const result = await auth.api.signOut({
    headers: await headers()
  });
  return result;
};