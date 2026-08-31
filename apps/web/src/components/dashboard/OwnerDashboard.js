'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import PetsList from './PetsList';
import AdoptionRequestsList from './AdoptionRequestsList';
import DashboardStats from './DashboardStats';

export default function OwnerDashboard({ session }) {
  const [pets, setPets] = useState([]);
  const [adoptions, setAdoptions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'available', 'pending', 'adopted'
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Fetch dashboard data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch user's pets and adoption requests
        const [petsRes, adoptionsRes] = await Promise.all([
          fetch('/api/pets/owner', {
            headers: { 'Accept': 'application/json' }
          }),
          fetch('/api/adoptions', {
            headers: { 'Accept': 'application/json' }
          })
        ]);

        if (!petsRes.ok) {
          throw new Error('Failed to fetch pets');
        }

        if (!adoptionsRes.ok) {
          throw new Error('Failed to fetch adoptions');
        }

        const petsData = await petsRes.json();
        const adoptionsData = await adoptionsRes.json();

        setPets(petsData.pets || []);
        setAdoptions(adoptionsData.adoptions || []);

        // Calculate statistics
        const totalPets = petsData.pets?.length || 0;
        const adoptedCount = petsData.pets?.filter(p => p.status === 'ADOPTED').length || 0;
        const pendingRequestsCount = adoptionsData.adoptions?.filter(a => a.status === 'PENDING').length || 0;

        setStats({
          totalPets,
          adoptedCount,
          pendingRequests: pendingRequestsCount,
          successRate: totalPets > 0 ? Math.round((adoptedCount / totalPets) * 100) : 0
        });
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [refreshTrigger]);

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // Filter pets based on selected filter
  const filteredPets = filter === 'all' 
    ? pets 
    : pets.filter(pet => pet.status === (
        filter === 'available' ? 'APPROVED' :
        filter === 'pending' ? 'PENDING' :
        filter === 'adopted' ? 'ADOPTED' : pet.status
      ));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header with refresh button */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">
          Dashboard do Proprietário
        </h1>
        <button
          onClick={handleRefresh}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          Atualizar
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Statistics cards */}
      {stats && <DashboardStats stats={stats} />}

      {/* Quick actions */}
      <div className="flex gap-4 flex-wrap">
        <Link
          href="/tutores/cadastrar"
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition inline-flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Cadastrar Novo Pet
        </Link>
        <Link
          href="/pets"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition inline-flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Ver Catálogo
        </Link>
      </div>

      {/* Pets section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Meus Pets ({filteredPets.length})
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilter('available')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition ${
                filter === 'available'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Disponíveis
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition ${
                filter === 'pending'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Pendentes
            </button>
            <button
              onClick={() => setFilter('adopted')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition ${
                filter === 'adopted'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Adotados
            </button>
          </div>
        </div>

        {filteredPets.length > 0 ? (
          <PetsList 
            pets={filteredPets} 
            onRefresh={handleRefresh}
          />
        ) : (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <p className="text-gray-600">
              {filter === 'all' 
                ? 'Você ainda não tem pets cadastrados. '
                : `Você não tem pets ${filter}.`}
            </p>
            {filter === 'all' && (
              <Link
                href="/tutores/cadastrar"
                className="text-blue-600 hover:underline mt-2 inline-block"
              >
                Cadastre seu primeiro pet
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Adoption requests section */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Solicitações de Adoção Recebidas ({adoptions.length})
        </h2>

        {adoptions.length > 0 ? (
          <AdoptionRequestsList 
            adoptions={adoptions}
            onRefresh={handleRefresh}
          />
        ) : (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <p className="text-gray-600">
              Você ainda não recebeu solicitações de adoção.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
