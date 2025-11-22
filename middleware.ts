import { NextRequest, NextResponse } from "next/server";

const privateRouts = [
  "/board",
  "/register",
  "/profile",
  "/skills"
]

export function middleware(request: NextRequest) {
  if(privateRouts.includes(request.nextUrl.pathname)) {
    const cookie = request.cookies.get("token");
    if(cookie==null) {
      const url = new URL("/login", request.url) 
      return NextResponse.redirect(url)
    }
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}