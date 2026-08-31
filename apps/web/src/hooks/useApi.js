/**
 * useApi Hook
 * Custom hook for API calls with authentication
 */

import { useSession } from 'next-auth/react';
import { useState, useCallback } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export function useApi() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = useCallback(
    async (endpoint, options = {}) => {
      setLoading(true);
      setError(null);

      try {
        const url = `${API_BASE}${endpoint}`;
        const headers = {
          'Content-Type': 'application/json',
          ...options.headers,
        };

        // Add authorization header if session exists
        if (session?.accessToken) {
          headers.Authorization = `Bearer ${session.accessToken}`;
        }

        const response = await fetch(url, {
          ...options,
          headers,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Erro na solicitação');
        }

        const data = await response.json();
        return data;
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [session?.accessToken]
  );

  return { request, loading, error };
}

export default useApi;
