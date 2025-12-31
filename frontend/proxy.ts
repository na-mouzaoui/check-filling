import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function proxy(request: NextRequest) {
  const jwtCookie = request.cookies.get("jwt")
  const { pathname } = request.nextUrl

  // Public routes
  if (pathname === "/login") {
    if (jwtCookie) {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
    return NextResponse.next()
  }

  // Protected routes
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/cheque") || pathname.startsWith("/historique")) {
    if (!jwtCookie) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
