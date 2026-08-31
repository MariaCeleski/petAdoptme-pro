/**
 * Authentication Middleware
 * Handles session validation and user authentication for API routes
 */

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { apiResponse } from '@/app/api/helpers/response';

/**
 * Ensure user is authenticated
 * Returns user session or unauthorized response
 */
export async function requireAuth() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return {
      authenticated: false,
      response: apiResponse.unauthorized(),
    };
  }

  return {
    authenticated: true,
    user: session.user,
    userId: session.user.id,
  };
}

/**
 * Ensure user has specific role
 */
export async function requireRole(requiredRoles) {
  const auth = await requireAuth();

  if (!auth.authenticated) {
    return {
      authorized: false,
      response: auth.response,
    };
  }

  const userRole = auth.user.type;
  const hasRole = requiredRoles.includes(userRole);

  if (!hasRole) {
    return {
      authorized: false,
      response: apiResponse.forbidden(),
    };
  }

  return {
    authorized: true,
    user: auth.user,
    userId: auth.userId,
  };
}
