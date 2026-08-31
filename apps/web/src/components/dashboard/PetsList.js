'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function PetsList({ pets, onRefresh }) {
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState(null);

  const getStatusBadge = (status) => {
    const statusConfig = {
      AVAILABLE: { bg: 'bg-green-100', text: 'text-green-800', label: 'Disponível' },
      PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pendente' },
      ADOPTED: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Adotado' },
      UNAVAILABLE: { bg: 'bg-red-100', text: 'text-red-800', label: 'Indisponível' }
    };
    const config = statusConfig[status] || statusConfig.AVAILABLE;
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const handleMarkAdopted = async (petId) => {
    try {
      setUpdatingId(petId);
      setError(null);

      const response = await fetch(`/api/pets/${petId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'ADOPTED' })
      });

      if (!response.ok) {
        throw new Error('Falha ao atualizar status do pet');
      }

      onRefresh();
    } catch (err) {
      console.error('Error updating pet status:', err);
      setError(err.message || 'Erro ao atualizar pet');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleArchivePet = async (petId) => {
    if (!window.confirm('Deseja arquivar este pet? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      setUpdatingId(petId);
      setError(null);

      const response = await fetch(`/api/pets/${petId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error('Falha ao arquivar pet');
      }

      onRefresh();
    } catch (err) {
      console.error('Error archiving pet:', err);
      setError(err.message || 'Erro ao arquivar pet');
    } finally {
      setUpdatingId(null);
    }
  };

  if (pets.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-8 text-center">
        <p className="text-gray-600">Nenhum pet encontrado com os filtros selecionados.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pets.map((pet) => (
          <div key={pet.id} className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden">
            {/* Pet image */}
            <div className="relative h-48 bg-gray-200">
              {pet.images && pet.images.length > 0 ? (
                <Image
                  src={pet.images[0]}
                  alt={pet.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg
                    className="w-12 h-12 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              )}
            </div>

            {/* Pet info */}
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{pet.name}</h3>
                  <p className="text-sm text-gray-600">{pet.breed}</p>
                </div>
                {getStatusBadge(pet.status)}
              </div>

              {/* Pet details */}
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-4">
                <div>
                  <span className="font-medium">Idade:</span> {pet.age}
                </div>
                <div>
                  <span className="font-medium">Tamanho:</span>
                  {pet.size === 'SMALL' ? 'Pequeno' : pet.size === 'MEDIUM' ? 'Médio' : 'Grande'}
                </div>
                <div>
                  <span className="font-medium">Gênero:</span>
                  {pet.gender === 'MALE' ? 'Macho' : 'Fêmea'}
                </div>
                <div>
                  <span className="font-medium">Espécie:</span>
                  {pet.species === 'DOG' ? 'Cão' : 'Gato'}
                </div>
              </div>

              {/* Vaccination and neutered status */}
              <div className="flex gap-2 mb-4 text-xs">
                {pet.isVaccinated && (
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                    ✓ Vacinado
                  </span>
                )}
                {pet.isNeutered && (
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    ✓ Castrado
                  </span>
                )}
              </div>

              {/* Quick actions */}
              <div className="flex gap-2 flex-wrap">
                <Link
                  href={`/pets/${pet.id}`}
                  className="flex-1 px-3 py-2 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 transition text-center"
                >
                  Ver Detalhes
                </Link>
                <Link
                  href={`/pets/${pet.id}/edit`}
                  className="flex-1 px-3 py-2 bg-gray-600 text-white text-xs font-medium rounded hover:bg-gray-700 transition text-center"
                >
                  Editar
                </Link>
              </div>

              {/* Status-specific actions */}
              <div className="mt-2 flex gap-2 flex-wrap">
                {pet.status === 'APPROVED' && (
                  <button
                    onClick={() => handleMarkAdopted(pet.id)}
                    disabled={updatingId === pet.id}
                    className="flex-1 px-3 py-2 bg-green-600 text-white text-xs font-medium rounded hover:bg-green-700 transition disabled:opacity-50"
                  >
                    {updatingId === pet.id ? 'Atualizando...' : 'Marcar Adotado'}
                  </button>
                )}
                <button
                  onClick={() => handleArchivePet(pet.id)}
                  disabled={updatingId === pet.id}
                  className="flex-1 px-3 py-2 bg-red-600 text-white text-xs font-medium rounded hover:bg-red-700 transition disabled:opacity-50"
                >
                  {updatingId === pet.id ? 'Processando...' : 'Arquivar'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
