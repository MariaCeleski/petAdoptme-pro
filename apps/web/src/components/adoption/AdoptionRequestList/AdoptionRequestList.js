'use client';

import { useState, useEffect } from 'react';
import { AdoptionRequest } from '../AdoptionRequest';
import { LoadingSkeleton, Button } from '@/components/ui';
import styles from './AdoptionRequestList.module.css';

/**
 * AdoptionRequestList Component
 * Displays a list of adoption requests for pet owners to review
 * Requirements: 6.5 (allow approval/rejection), 6.8 (track adoption history)
 *
 * Props:
 * - adoptions: Array of adoption request objects
 * - isLoading: Whether the list is loading
 * - onRefresh: Callback to refresh the list
 * - showStatusFilter: Whether to show status filter (default: true)
 * - canApprove: Whether the current user can approve (should be pet owner)
 */
export function AdoptionRequestList({
  adoptions = [],
  isLoading = false,
  onRefresh,
  showStatusFilter = true,
  canApprove = false
}) {
  const [filteredAdoptions, setFilteredAdoptions] = useState(adoptions);
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [localAdoptions, setLocalAdoptions] = useState(adoptions);

  useEffect(() => {
    setLocalAdoptions(adoptions);
  }, [adoptions]);

  useEffect(() => {
    if (statusFilter === 'ALL') {
      setFilteredAdoptions(localAdoptions);
    } else {
      setFilteredAdoptions(
        localAdoptions.filter((adoption) => adoption.status === statusFilter)
      );
    }
  }, [statusFilter, localAdoptions]);

  const handleStatusChange = (updatedAdoption) => {
    // Update the adoption in the local list
    const updated = localAdoptions.map((adoption) =>
      adoption.id === updatedAdoption.id ? updatedAdoption : adoption
    );
    setLocalAdoptions(updated);
    onRefresh?.();
  };

  const statusCounts = {
    ALL: localAdoptions.length,
    PENDING: localAdoptions.filter((a) => a.status === 'PENDING').length,
    APPROVED: localAdoptions.filter((a) => a.status === 'APPROVED').length,
    REJECTED: localAdoptions.filter((a) => a.status === 'REJECTED').length,
    COMPLETED: localAdoptions.filter((a) => a.status === 'COMPLETED').length
  };

  const statusLabels = {
    ALL: 'Todas',
    PENDING: 'Pendentes',
    APPROVED: 'Aprovadas',
    REJECTED: 'Rejeitadas',
    COMPLETED: 'Concluídas'
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Solicitações de Adoção</h2>
          <p className={styles.subtitle}>
            {filteredAdoptions.length} solicitação{filteredAdoptions.length !== 1 ? 's' : ''} encontrada{filteredAdoptions.length !== 1 ? 's' : ''}
          </p>
        </div>
        {onRefresh && (
          <Button
            variant="secondary"
            size="small"
            onClick={onRefresh}
            disabled={isLoading}
          >
            Atualizar
          </Button>
        )}
      </div>

      {/* Filter */}
      {showStatusFilter && (
        <div className={styles.filters}>
          {Object.keys(statusCounts).map((status) => (
            <button
              key={status}
              className={`${styles.filterButton} ${
                statusFilter === status ? styles.active : ''
              }`}
              onClick={() => setStatusFilter(status)}
              disabled={isLoading}
            >
              <span>{statusLabels[status]}</span>
              <span className={styles.count}>{statusCounts[status]}</span>
            </button>
          ))}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className={styles.loadingContainer}>
          {[1, 2, 3].map((i) => (
            <LoadingSkeleton
              key={i}
              height="300px"
              borderRadius="0.5rem"
              style={{ marginBottom: '1.5rem' }}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredAdoptions.length === 0 && (
        <div className={styles.emptyState}>
          <svg
            className={styles.emptyIcon}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
          <h3 className={styles.emptyTitle}>Nenhuma solicitação encontrada</h3>
          <p className={styles.emptyMessage}>
            {statusFilter === 'ALL'
              ? 'Você ainda não recebeu nenhuma solicitação de adoção.'
              : statusFilter === 'PENDING'
              ? 'Você não tem solicitações pendentes no momento.'
              : `Você não tem solicitações ${statusLabels[statusFilter].toLowerCase()} no momento.`}
          </p>
        </div>
      )}

      {/* Adoption Requests */}
      {!isLoading && filteredAdoptions.length > 0 && (
        <div className={styles.adoptionsList}>
          {filteredAdoptions.map((adoption) => (
            <AdoptionRequest
              key={adoption.id}
              adoption={adoption}
              onStatusChange={handleStatusChange}
              isLoading={isLoading}
              canApprove={canApprove && adoption.status === 'PENDING'}
            />
          ))}
        </div>
      )}

      {/* Disclaimer */}
      <div className={styles.disclaimer}>
        <svg
          className={styles.disclaimerIcon}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p>
          Revise cuidadosamente cada solicitação antes de tomar uma decisão. Uma vez rejeitada, a decisão não pode ser revertida automaticamente.
        </p>
      </div>
    </div>
  );
}

export default AdoptionRequestList;
