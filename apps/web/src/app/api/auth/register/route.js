import { NextResponse } from 'next/server';

/**
 * Frontend proxy for authentication registration.
 * Forwards requests to the backend API.
 * All password hashing and validation is handled by the backend.
 */
export async function POST(request) {
  try {
    const body = await request.json();

    // Forward request to backend API
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    
    const response = await fetch(`${backendUrl}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });

  } catch (error) {
    console.error('Registration proxy error:', error);
    return NextResponse.json(
      { error: 'Erro ao comunicar com o servidor', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}