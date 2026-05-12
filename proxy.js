import { NextResponse } from "next/server";

export function proxy(request) {
  const session = request.cookies.get("pos_session")?.value;
  const pathname = request.nextUrl.pathname;

  const publicPaths = ["/login"];
  const isPublic = publicPaths.includes(pathname) || pathname.startsWith("/api");

  if (!session && !isPublic) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (session && pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
