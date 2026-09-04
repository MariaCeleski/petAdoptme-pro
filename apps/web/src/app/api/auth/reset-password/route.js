import { NextResponse } from 'next/server';

/**
 * Frontend proxy for password reset.
 * Forwards requests to the backend API.
 * All password hashing and validation is handled by the backend.
 */
export async function POST(request) {
  try {
    const body = await request.json();

    // Forward request to backend API
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    
    const response = await fetch(`${backendUrl}/api/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });

  } catch (error) {
    console.error('Reset password proxy error:', error);
    return NextResponse.json(
      { error: 'Erro ao comunicar com o servidor', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}

/**
 * Frontend proxy for validating password reset token.
 * Forwards token validation requests to the backend API.
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    // Forward request to backend API
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    
    const response = await fetch(
      `${backendUrl}/api/auth/reset-password?token=${token}&email=${encodeURIComponent(email)}`,
      { method: 'GET' }
    );

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });

  } catch (error) {
    console.error('Validate reset token proxy error:', error);
    return NextResponse.json(
      { error: 'Erro ao comunicar com o servidor', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}