'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function AdoptionRequestsList({ adoptions, onRefresh }) {
  const [expandedId, setExpandedId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectionForm, setShowRejectionForm] = useState(null);
  const [error, setError] = useState(null);

  const getStatusBadge = (status) => {
    const statusConfig = {
      PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pendente' },
      APPROVED: { bg: 'bg-green-100', text: 'text-green-800', label: 'Aprovado' },
      REJECTED: { bg: 'bg-red-100', text: 'text-red-800', label: 'Rejeitado' },
      COMPLETED: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Concluído' },
      CANCELLED: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Cancelado' }
    };
    const config = statusConfig[status] || statusConfig.PENDING;

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const handleApprove = async (adoptionId) => {
    try {
      setUpdatingId(adoptionId);
      setError(null);

      const response = await fetch(`/api/adoptions/${adoptionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'APPROVED' })
      });

      if (!response.ok) {
        throw new Error('Falha ao aprovar adoção');
      }

      onRefresh();
    } catch (err) {
      console.error('Error approving adoption:', err);
      setError(err.message || 'Erro ao aprovar adoção');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleReject = async (adoptionId) => {
    if (!rejectionReason.trim()) {
      alert('Por favor, forneça um motivo para a rejeição');
      return;
    }

    try {
      setUpdatingId(adoptionId);
      setError(null);

      const response = await fetch(`/api/adoptions/${adoptionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 'REJECTED',
          rejectionReason: rejectionReason.trim()
        })
      });

      if (!response.ok) {
        throw new Error('Falha ao rejeitar adoção');
      }

      setShowRejectionForm(null);
      setRejectionReason('');
      onRefresh();
    } catch (err) {
      console.error('Error rejecting adoption:', err);
      setError(err.message || 'Erro ao rejeitar adoção');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleComplete = async (adoptionId) => {
    if (!window.confirm('Deseja marcar esta adoção como concluída? Isto não pode ser desfeito.')) {
      return;
    }

    try {
      setUpdatingId(adoptionId);
      setError(null);

      const response = await fetch(`/api/adoptions/${adoptionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'COMPLETED' })
      });

      if (!response.ok) {
        throw new Error('Falha ao completar adoção');
      }

      onRefresh();
    } catch (err) {
      console.error('Error completing adoption:', err);
      setError(err.message || 'Erro ao completar adoção');
    } finally {
      setUpdatingId(null);
    }
  };

  if (adoptions.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-8 text-center">
        <p className="text-gray-600">Você ainda não recebeu solicitações de adoção.</p>
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

      <div className="space-y-4">
        {adoptions.map((adoption) => (
          <div 
            key={adoption.id} 
            className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 bg-gray-50 border-b flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                {/* Pet image */}
                <div className="relative w-16 h-16 rounded-lg bg-gray-200 flex-shrink-0">
                  {adoption.pet.images && adoption.pet.images.length > 0 ? (
                    <Image
                      src={adoption.pet.images[0]}
                      alt={adoption.pet.name}
                      fill
                      className="object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-gray-400"
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

                {/* Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold text-gray-900">
                      {adoption.pet.name}
                    </h3>
                    <span className="text-sm text-gray-600">
                      ({adoption.pet.species === 'DOG' ? 'Cão' : 'Gato'})
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Interessado: <span className="font-medium">{adoption.adopter.name}</span>
                  </p>
                </div>

                {/* Status */}
                <div className="flex-shrink-0">
                  {getStatusBadge(adoption.status)}
                </div>
              </div>

              {/* Expand button */}
              <button
                onClick={() => setExpandedId(expandedId === adoption.id ? null : adoption.id)}
                className="ml-4 p-2 hover:bg-gray-200 rounded transition"
              >
                <svg
                  className={`w-5 h-5 transition ${expandedId === adoption.id ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                  />
                </svg>
              </button>
            </div>

            {/* Expanded content */}
            {expandedId === adoption.id && (
              <div className="p-4 space-y-4 border-t">
                {/* Request date */}
                <div>
                  <p className="text-xs text-gray-600 uppercase tracking-wide font-medium">
                    Data da Solicitação
                  </p>
                  <p className="text-sm text-gray-900 mt-1">
                    {new Date(adoption.createdAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>

                {/* Adopter information */}
                {adoption.adopterInfo && (
                  <div>
                    <p className="text-xs text-gray-600 uppercase tracking-wide font-medium mb-2">
                      Informações do Adotante
                    </p>
                    <div className="bg-gray-50 rounded p-3 space-y-2 text-sm">
                      {adoption.adopterInfo.personalInfo && (
                        <div>
                          <p className="font-medium text-gray-900">
                            {adoption.adopterInfo.personalInfo.fullName}
                          </p>
                          <p className="text-gray-600">
                            {adoption.adopterInfo.personalInfo.phone}
                          </p>
                          <p className="text-gray-600">
                            {adoption.adopterInfo.personalInfo.address}
                          </p>
                          <p className="text-gray-600">
                            {adoption.adopterInfo.personalInfo.city}, {adoption.adopterInfo.personalInfo.state}
                          </p>
                        </div>
                      )}
                      
                      {adoption.adopterInfo.livingSituation && (
                        <div className="border-t pt-2">
                          <p className="font-medium text-gray-900">Situação de Moradia</p>
                          <p className="text-gray-600">
                            Tipo: {adoption.adopterInfo.livingSituation.housingType}
                          </p>
                          <p className="text-gray-600">
                            Quintal: {adoption.adopterInfo.livingSituation.hasYard ? 'Sim' : 'Não'}
                          </p>
                          <p className="text-gray-600">
                            Próprio/Alugado: {adoption.adopterInfo.livingSituation.ownRent === 'own' ? 'Próprio' : 'Alugado'}
                          </p>
                        </div>
                      )}

                      {adoption.adopterInfo.motivation && (
                        <div className="border-t pt-2">
                          <p className="font-medium text-gray-900">Motivação</p>
                          <p className="text-gray-600 italic">
                            {adoption.adopterInfo.motivation.whyAdopt}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Rejection reason (if rejected) */}
                {adoption.status === 'REJECTED' && adoption.rejectionReason && (
                  <div className="bg-red-50 border border-red-200 rounded p-3">
                    <p className="text-xs text-red-600 uppercase tracking-wide font-medium mb-1">
                      Motivo da Rejeição
                    </p>
                    <p className="text-sm text-red-900">{adoption.rejectionReason}</p>
                  </div>
                )}

                {/* Message */}
                {adoption.message && (
                  <div>
                    <p className="text-xs text-gray-600 uppercase tracking-wide font-medium mb-1">
                      Mensagem do Adotante
                    </p>
                    <p className="text-sm text-gray-900 italic">{adoption.message}</p>
                  </div>
                )}

                {/* Actions */}
                {adoption.status === 'PENDING' && (
                  <div className="flex gap-2 pt-4 border-t">
                    <button
                      onClick={() => handleApprove(adoption.id)}
                      disabled={updatingId === adoption.id}
                      className="flex-1 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-700 transition disabled:opacity-50"
                    >
                      {updatingId === adoption.id ? 'Processando...' : 'Aprovar'}
                    </button>
                    <button
                      onClick={() => setShowRejectionForm(adoption.id)}
                      disabled={updatingId === adoption.id}
                      className="flex-1 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded hover:bg-red-700 transition disabled:opacity-50"
                    >
                      Rejeitar
                    </button>
                  </div>
                )}

                {adoption.status === 'APPROVED' && (
                  <div className="flex gap-2 pt-4 border-t">
                    <button
                      onClick={() => handleComplete(adoption.id)}
                      disabled={updatingId === adoption.id}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition disabled:opacity-50"
                    >
                      {updatingId === adoption.id ? 'Processando...' : 'Marcar como Concluída'}
                    </button>
                  </div>
                )}

                {/* Rejection form */}
                {showRejectionForm === adoption.id && (
                  <div className="bg-red-50 border border-red-200 rounded p-4 space-y-3">
                    <p className="text-sm font-medium text-red-900">
                      Por que você está rejeitando esta adoção?
                    </p>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Descreva o motivo da rejeição..."
                      className="w-full px-3 py-2 border border-red-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                      rows="3"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleReject(adoption.id)}
                        disabled={updatingId === adoption.id || !rejectionReason.trim()}
                        className="flex-1 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded hover:bg-red-700 transition disabled:opacity-50"
                      >
                        {updatingId === adoption.id ? 'Processando...' : 'Confirmar Rejeição'}
                      </button>
                      <button
                        onClick={() => {
                          setShowRejectionForm(null);
                          setRejectionReason('');
                        }}
                        disabled={updatingId === adoption.id}
                        className="flex-1 px-4 py-2 bg-gray-300 text-gray-900 text-sm font-medium rounded hover:bg-gray-400 transition disabled:opacity-50"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
