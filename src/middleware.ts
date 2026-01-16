import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req });

  const isAuthPage =
    req.nextUrl.pathname.startsWith("/login") ||
    req.nextUrl.pathname.startsWith("/register");

  // Chưa đăng nhập -> chặn vào /chat, /friends
  const isProtected =
    req.nextUrl.pathname.startsWith("/chat") ||
    req.nextUrl.pathname.startsWith("/friends");

  if (!token && isProtected) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  // Đã đăng nhập -> không cho vào login/register nữa
  if (token && isAuthPage) {
    const url = req.nextUrl.clone();
    url.pathname = "/chat";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/chat/:path*", "/friends/:path*", "/login", "/register"],
};
