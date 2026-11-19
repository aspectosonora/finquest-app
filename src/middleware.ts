import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE_NAME = "finquest_session";
const PUBLIC_PATHS = ["/login", "/signup", "/unirse"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.has(SESSION_COOKIE_NAME);

  const isPublic = PUBLIC_PATHS.some((path) => pathname.startsWith(path));

  if (!hasSession && !isPublic && pathname !== "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (hasSession && isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/inicio";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|assets|manifest.webmanifest|sw.js).*)"],
};
