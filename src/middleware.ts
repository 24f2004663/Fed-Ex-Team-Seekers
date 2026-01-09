import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;

    // 1. Define Protected Routes
    const isAgencyRoute = path.startsWith('/agency');
    const isAdminRoute = path.startsWith('/analytics') || path === '/';

    // 2. Session Check
    const token = request.cookies.get('fedex_auth_token');

    // If trying to access protected routes without token, redirect to Login
    if (!token && (isAgencyRoute || isAdminRoute)) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // If logged in and trying to go to login, redirect to Dashboard
    if (token && path === '/login') {
        // Basic redirect based on role could go here, but defaulting to / for now
        return NextResponse.redirect(new URL('/', request.url));
    }

    // Example Governance Check: 
    // Ensure Agencies cannot access internal Analytics
    if (isAgencyRoute) {
        // Validation: Ensure Strict-Transport-Security
        const headers = new Headers(request.headers);
        headers.set('x-content-type-options', 'nosniff');

        // In a real implementation we would decode the JWT here to check specific roles
        // const role = JSON.parse(token.value).role;
        // if (role !== 'AGENCY') return NextResponse.redirect(new URL('/login', request.url));

        return NextResponse.next({ headers });
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/', '/agency/:path*', '/analytics/:path*'],
};
