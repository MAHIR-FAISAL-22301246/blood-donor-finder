import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'blood-donor-finder-secret-key-change-in-production'
);

const PROTECTED_ADMIN_ROUTES = ['/admin'];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isAdminRoute = PROTECTED_ADMIN_ROUTES.some(route => pathname.startsWith(route));
  if (!isAdminRoute) return NextResponse.next();

  const token = req.cookies.get('auth_token')?.value;

  if (!token) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (payload.role !== 'admin') {
      return NextResponse.redirect(new URL('/', req.url));
    }
    return NextResponse.next();
  } catch {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: ['/admin/:path*'],
};
