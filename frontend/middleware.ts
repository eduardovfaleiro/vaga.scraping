import { NextRequest, NextResponse } from 'next/server';

const PROTECTED = ['/dashboard', '/jobs', '/settings'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED.some((p) => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  const refreshToken = request.cookies.get('refresh_token');
  if (!refreshToken) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/jobs/:path*', '/settings/:path*'],
};
