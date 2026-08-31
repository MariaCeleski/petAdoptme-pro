/**
 * usePets Hook
 * Custom hook for pet management
 */

import { useState, useCallback, useEffect } from 'react';
import { useApi } from './useApi';

export function usePets() {
  const { request, loading, error } = useApi();
  const [pets, setPets] = useState([]);
  const [filteredPets, setFilteredPets] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    pages: 0,
  });

  // Fetch all pets
  const fetchPets = useCallback(
    async (filters = {}, page = 1) => {
      try {
        const params = new URLSearchParams({
          page,
          limit: 10,
          ...filters,
        });

        const data = await request(`/api/pets?${params.toString()}`);
        setPets(data.data || []);
        setPagination(data.pagination || {});
        setFilteredPets(data.data || []);
        return data;
      } catch (err) {
        console.error('Error fetching pets:', err);
        throw err;
      }
    },
    [request]
  );

  // Fetch single pet
  const fetchPet = useCallback(
    async (petId) => {
      try {
        const data = await request(`/api/pets/${petId}`);
        return data.data;
      } catch (err) {
        console.error('Error fetching pet:', err);
        throw err;
      }
    },
    [request]
  );

  // Create pet
  const createPet = useCallback(
    async (petData) => {
      try {
        const data = await request('/api/pets', {
          method: 'POST',
          body: JSON.stringify(petData),
        });
        return data.data;
      } catch (err) {
        console.error('Error creating pet:', err);
        throw err;
      }
    },
    [request]
  );

  // Update pet
  const updatePet = useCallback(
    async (petId, petData) => {
      try {
        const data = await request(`/api/pets/${petId}`, {
          method: 'PATCH',
          body: JSON.stringify(petData),
        });
        return data.data;
      } catch (err) {
        console.error('Error updating pet:', err);
        throw err;
      }
    },
    [request]
  );

  // Delete pet
  const deletePet = useCallback(
    async (petId) => {
      try {
        const data = await request(`/api/pets/${petId}`, {
          method: 'DELETE',
        });
        return data;
      } catch (err) {
        console.error('Error deleting pet:', err);
        throw err;
      }
    },
    [request]
  );

  // Search pets
  const searchPets = useCallback(
    (searchTerm) => {
      if (!searchTerm) {
        setFilteredPets(pets);
        return;
      }

      const filtered = pets.filter(
        (pet) =>
          pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          pet.breed.toLowerCase().includes(searchTerm.toLowerCase()) ||
          pet.species.toLowerCase().includes(searchTerm.toLowerCase())
      );

      setFilteredPets(filtered);
    },
    [pets]
  );

  return {
    pets,
    filteredPets,
    pagination,
    loading,
    error,
    fetchPets,
    fetchPet,
    createPet,
    updatePet,
    deletePet,
    searchPets,
  };
}

export default usePets;
