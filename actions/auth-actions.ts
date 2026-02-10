"use server";

import { redirect } from "next/navigation";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export const signUp = async (email: string, password: string, name: string) => {
  const result = await auth.api.signUpEmail({
    body: {
      email,
      password,
      name,
      callbackURL: "/",
    },
  });
  return result;
};

export const signIn = async (email: string, password: string) => {
  const result = await auth.api.signInEmail({
    body: {
      email,
      password,
      callbackURL: "/",
    },
  });
  return result;
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