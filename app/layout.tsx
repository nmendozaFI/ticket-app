import type React from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { User, UserRole } from "@/types";
import { UserProvider } from "@/context/userContext";
import Navigation from "@/components/Navigation";
import { Toaster } from "sonner";
import { QueryProvider } from "@/providers/QueryProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ticketing App",
  description: "Control de gastos en viajes",
};

const isValidUserRole = (role: string | undefined | null): role is UserRole => {
  if (typeof role !== "string") return false;
  return ["USER", "ADMIN"].includes(role as UserRole);
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  let currentUser: User | null = null;

  if (session?.user) {
    const sessionUserRole = session.user.role; 

    if (isValidUserRole(sessionUserRole)) {
      currentUser = {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        role: sessionUserRole,
      };
    } else {
      console.warn(
        `[Auth Warning] Rol inválido o ausente recibido para el usuario ${session.user.id}: '${sessionUserRole}'. Estableciendo usuario como null o rol por defecto si aplicable.`
      );
    }
  }

  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="antialiased">
        <UserProvider initialUser={currentUser}>
          <QueryProvider>
            <Navigation />
            {children}
          </QueryProvider>
        </UserProvider>
        <Toaster position="bottom-center" richColors />
      </body>
    </html>
  );
}
