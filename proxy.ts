import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function proxy(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  })

  const { pathname } = request.nextUrl

  // Permitir acceso libre a auth
  if (pathname.startsWith("/auth")) {
    return NextResponse.next()
  }

  // Si no hay sesión → login
  if (!session) {
    return NextResponse.redirect(new URL("/auth", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!api|_next|favicon.ico).*)",
  ],
}
