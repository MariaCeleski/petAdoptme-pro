/**
 * Next.js Middleware
 * Handles authentication and protected routes
 */

import { withAuth } from 'next-auth/middleware';

export const middleware = withAuth(
  function middleware(req) {
    // Add any custom logic here
    // Protected routes are automatically handled by withAuth
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

// Specify which routes require authentication
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/tutores/meus-pets/:path*',
    '/adocoes/:path*',
  ],
};
