/**
 * Response Helpers - Standardized API responses
 * Ensures consistent response format across all endpoints
 */

import { NextResponse } from 'next/server';

export const apiResponse = {
  /**
   * Success response
   */
  success: (data, statusCode = 200, message = 'Success') => {
    return NextResponse.json(
      {
        success: true,
        message,
        data,
        timestamp: new Date().toISOString(),
      },
      { status: statusCode }
    );
  },

  /**
   * Created response (201)
   */
  created: (data, message = 'Created successfully') => {
    return NextResponse.json(
      {
        success: true,
        message,
        data,
        timestamp: new Date().toISOString(),
      },
      { status: 201 }
    );
  },

  /**
   * Error response
   */
  error: (message, statusCode = 400, code = 'ERROR', details = null) => {
    return NextResponse.json(
      {
        success: false,
        message,
        code,
        details,
        timestamp: new Date().toISOString(),
      },
      { status: statusCode }
    );
  },

  /**
   * Validation error
   */
  validationError: (message, details) => {
    return NextResponse.json(
      {
        success: false,
        message: message || 'Validation error',
        code: 'VALIDATION_ERROR',
        details,
        timestamp: new Date().toISOString(),
      },
      { status: 400 }
    );
  },

  /**
   * Unauthorized
   */
  unauthorized: () => {
    return NextResponse.json(
      {
        success: false,
        message: 'Unauthorized',
        code: 'UNAUTHORIZED',
        timestamp: new Date().toISOString(),
      },
      { status: 401 }
    );
  },

  /**
   * Forbidden
   */
  forbidden: () => {
    return NextResponse.json(
      {
        success: false,
        message: 'Forbidden',
        code: 'FORBIDDEN',
        timestamp: new Date().toISOString(),
      },
      { status: 403 }
    );
  },

  /**
   * Not found
   */
  notFound: () => {
    return NextResponse.json(
      {
        success: false,
        message: 'Not found',
        code: 'NOT_FOUND',
        timestamp: new Date().toISOString(),
      },
      { status: 404 }
    );
  },

  /**
   * Conflict (409)
   */
  conflict: (message, code = 'CONFLICT') => {
    return NextResponse.json(
      {
        success: false,
        message,
        code,
        timestamp: new Date().toISOString(),
      },
      { status: 409 }
    );
  },

  /**
   * Server error
   */
  serverError: (message = 'Internal server error', error = null) => {
    if (process.env.NODE_ENV === 'development' && error) {
      console.error('API Error:', error);
    }

    return NextResponse.json(
      {
        success: false,
        message,
        code: 'INTERNAL_SERVER_ERROR',
        ...(process.env.NODE_ENV === 'development' && error && { debug: error.message }),
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  },
};
