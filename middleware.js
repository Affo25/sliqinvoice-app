import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'yoursecret';

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Define public routes that don't require authentication
  const publicRoutes = [
    '/auth/admin-login',
    '/auth/customer-login', 
    '/auth/customer-register',
    '/api/auth/login',
    '/auth/forgot-password',
    '/',
  ];

  // Define API routes that don't require authentication
  const publicApiRoutes = [
    '/api/auth/login',
  ];

  // Check if the current route is public
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
  const isPublicApiRoute = publicApiRoutes.some(route => pathname.startsWith(route));

  // For API routes
  if (pathname.startsWith('/api/')) {
    if (isPublicApiRoute) {
      return NextResponse.next();
    }

    // Check for authentication token in API routes
    const token = request.cookies.get('authToken')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized - No token provided' },
        { status: 401 }
      );
    }

    try {
      jwt.verify(token, JWT_SECRET);
      return NextResponse.next();
    } catch (error) {
      console.error('JWT verification failed:', error);
      return NextResponse.json(
        { success: false, message: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }
  }

  // For page routes
  const token = request.cookies.get('authToken')?.value;

  // If trying to access a protected route without a token
  if (!isPublicRoute && !token) {
    const loginUrl = new URL('/auth/admin-login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // If trying to access auth pages while already logged in
  if (isPublicRoute && token && pathname !== '/') {
    try {
      jwt.verify(token, JWT_SECRET);
      const dashboardUrl = new URL('/dashboard', request.url);
      return NextResponse.redirect(dashboardUrl);
    } catch (error) {
      // Invalid token, allow access to auth pages
      return NextResponse.next();
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|images|css|js).*)',
  ],
};