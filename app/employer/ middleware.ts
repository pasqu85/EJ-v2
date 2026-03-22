import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("sb-access-token");

  // se NON loggato → fuori
  if (!token) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

// Applica solo a employer
export const config = {
  matcher: ["/employer"],
};