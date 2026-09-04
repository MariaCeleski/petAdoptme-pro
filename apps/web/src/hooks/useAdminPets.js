'use client';

import { useState, useCallback, useEffect } from 'react';
import { useSession } from 'next-auth/react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * useAdminPets Hook
 * Manages the state and API calls for admin pet management
 * Used in the admin dashboard for pending pet approval workflow
 */
export function useAdminPets() {
  const { data: session } = useSession();
  const [pets, setPets] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetch pending pets from API
   */
  const fetchPendingPets = useCallback(
    async (page = 1, limit = 10) => {
      if (!session?.accessToken) {
        setError('Sessão expirada. Por favor, faça login novamente.');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const url = new URL(`${API_BASE}/api/admin/pets/pending`);
        url.searchParams.set('page', page);
        url.searchParams.set('limit', limit);

        const response = await fetch(url.toString(), {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.accessToken}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Erro ao carregar pets');
        }

        const data = await response.json();
        setPets(data.data || []);
        setPagination({
          page: data.pagination.page,
          limit: data.pagination.limit,
          total: data.pagination.total,
          pages: data.pagination.pages,
        });
      } catch (err) {
        setError(err.message);
        setPets([]);
      } finally {
        setLoading(false);
      }
    },
    [session?.accessToken]
  );

  /**
   * Approve a pet
   */
  const approvePet = useCallback(
    async (petId) => {
      if (!session?.accessToken) {
        throw new Error('Sessão expirada. Por favor, faça login novamente.');
      }

      try {
        const response = await fetch(`${API_BASE}/api/admin/pets/${petId}/approve`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.accessToken}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Erro ao aprovar pet');
        }

        const data = await response.json();
        
        // Remove pet from list
        setPets(pets.filter(p => p.id !== petId));
        setPagination(prev => ({ ...prev, total: prev.total - 1 }));

        return data;
      } catch (err) {
        throw err;
      }
    },
    [session?.accessToken, pets]
  );

  /**
   * Reject a pet with reason
   */
  const rejectPet = useCallback(
    async (petId, reason) => {
      if (!session?.accessToken) {
        throw new Error('Sessão expirada. Por favor, faça login novamente.');
      }

      try {
        const response = await fetch(`${API_BASE}/api/admin/pets/${petId}/reject`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.accessToken}`,
          },
          body: JSON.stringify({ reason }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Erro ao rejeitar pet');
        }

        const data = await response.json();
        
        // Remove pet from list
        setPets(pets.filter(p => p.id !== petId));
        setPagination(prev => ({ ...prev, total: prev.total - 1 }));

        return data;
      } catch (err) {
        throw err;
      }
    },
    [session?.accessToken, pets]
  );

  return {
    pets,
    pagination,
    loading,
    error,
    fetchPendingPets,
    approvePet,
    rejectPet,
  };
}

export default useAdminPets;
