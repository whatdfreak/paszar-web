// ============================================================
// PASzar — Next.js Proxy (Auth Guard, pengganti middleware.ts)
// ============================================================
// Melindungi semua route admin dari akses tanpa autentikasi.
// Belum login → redirect ke /login (dengan callbackUrl).
// Lapisan kedua: session guard di dashboard/layout.tsx dan di
// setiap Server Action.
// ============================================================

import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function proxy(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set(
      "callbackUrl",
      request.nextUrl.pathname + request.nextUrl.search
    );
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
