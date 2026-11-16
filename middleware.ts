import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth";

// Gate the live features (recording + saved meetings) behind the demo login.
// The seed-data demo pages (/meetings, /features, ...) stay public.
export function middleware(req: NextRequest) {
  const signedIn = Boolean(req.cookies.get(SESSION_COOKIE)?.value);
  if (!signedIn) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/record/:path*", "/record", "/my-meetings/:path*", "/my-meetings"],
};
