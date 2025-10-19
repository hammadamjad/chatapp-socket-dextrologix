import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // If user is authenticated and trying to access auth pages, redirect to chat
    if (
      token &&
      (pathname.startsWith('/login') || pathname.startsWith('/signup'))
    ) {
      return NextResponse.redirect(new URL('/chat-screen', req.url));
    }

    // If user is not authenticated and trying to access protected pages, redirect to login
    if (!token && pathname.startsWith('/chat-screen')) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // Allow access to auth pages without token
        if (pathname.startsWith('/login') || pathname.startsWith('/signup')) {
          return true;
        }

        // Require token for protected pages
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: ['/chat-screen/:path*', '/login', '/signup'],
};
