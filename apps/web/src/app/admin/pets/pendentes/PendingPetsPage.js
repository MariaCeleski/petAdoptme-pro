'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { PetCard } from '@/components/PetCard';
import { ApproveModal } from '@/components/ApproveModal';
import { RejectModal } from '@/components/RejectModal';
import { ToastContainer, useToast } from '@/components/Toast';
import { Button } from '@/components/ui';
import { useAdminPets } from '@/hooks/useAdminPets';
import styles from './PendingPetsPage.module.css';
import { clsx } from 'clsx';

/**
 * PendingPetsPage Component
 * Admin dashboard for managing pending pet approvals
 * Requirements: Wave 5 Task 5.1
 */
export default function PendingPetsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { toasts, addToast, removeToast } = useToast();

  // Admin pets management
  const {
    pets,
    pagination,
    loading,
    error,
    fetchPendingPets,
    approvePet,
    rejectPet,
  } = useAdminPets();

  // Modal states
  const [selectedPet, setSelectedPet] = useState(null);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Initialize data on mount
  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/auth/signin');
      return;
    }

    if (session.user?.role !== 'admin') {
      router.push('/');
      return;
    }

    fetchPendingPets(1, 10);
  }, [session, status, router, fetchPendingPets]);

  /**
   * Handle approve button click
   */
  const handleApproveClick = useCallback((pet) => {
    setSelectedPet(pet);
    setApproveModalOpen(true);
  }, []);

  /**
   * Handle reject button click
   */
  const handleRejectClick = useCallback((pet) => {
    setSelectedPet(pet);
    setRejectModalOpen(true);
  }, []);

  /**
   * Confirm pet approval
   */
  const handleApproveConfirm = useCallback(async () => {
    if (!selectedPet) return;

    setIsProcessing(true);
    try {
      await approvePet(selectedPet.id);
      setApproveModalOpen(false);
      setSelectedPet(null);
      addToast({
        message: `Pet ${selectedPet.name} aprovado com sucesso!`,
        type: 'success',
        duration: 3000,
      });
    } catch (err) {
      addToast({
        message: err.message || 'Erro ao aprovar pet. Tente novamente.',
        type: 'error',
        duration: 4000,
      });
    } finally {
      setIsProcessing(false);
    }
  }, [selectedPet, approvePet, addToast]);

  /**
   * Confirm pet rejection
   */
  const handleRejectConfirm = useCallback(
    async (reason) => {
      if (!selectedPet) return;

      setIsProcessing(true);
      try {
        await rejectPet(selectedPet.id, reason);
        setRejectModalOpen(false);
        setSelectedPet(null);
        addToast({
          message: `Pet ${selectedPet.name} rejeitado com sucesso!`,
          type: 'success',
          duration: 3000,
        });
      } catch (err) {
        addToast({
          message: err.message || 'Erro ao rejeitar pet. Tente novamente.',
          type: 'error',
          duration: 4000,
        });
      } finally {
        setIsProcessing(false);
      }
    },
    [selectedPet, rejectPet, addToast]
  );

  /**
   * Handle modal close
   */
  const handleCloseModals = useCallback(() => {
    setApproveModalOpen(false);
    setRejectModalOpen(false);
    setSelectedPet(null);
  }, []);

  /**
   * Handle pagination
   */
  const handlePageChange = useCallback(
    (newPage) => {
      fetchPendingPets(newPage, pagination.limit);
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [fetchPendingPets, pagination.limit]
  );

  /**
   * Handle refresh
   */
  const handleRefresh = useCallback(() => {
    fetchPendingPets(pagination.page, pagination.limit);
  }, [fetchPendingPets, pagination.page, pagination.limit]);

  // Loading state
  if (status === 'loading' || !session) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingState}>Carregando...</div>
      </div>
    );
  }

  // Error state
  if (error && !loading) {
    return (
      <div className={styles.container}>
        <div className={styles.errorState}>
          <h2>Erro ao carregar pets</h2>
          <p>{error}</p>
          <Button onClick={handleRefresh}>Tentar Novamente</Button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div>
            <h1 className={styles.title}>Pets Aguardando Aprovação</h1>
            <p className={styles.subtitle}>
              Gerencie as solicitações de inclusão de novos pets no catálogo
            </p>
          </div>
          <div className={styles.headerActions}>
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={loading}
            >
              🔄 Atualizar
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className={styles.stats}>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Pets Pendentes</span>
            <span className={styles.statValue}>{pagination.total}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.mainContent}>
        {/* Loading skeleton */}
        {loading && pets.length === 0 && (
          <div className={styles.gridContainer}>
            {[...Array(6)].map((_, i) => (
              <div key={i} className={clsx(styles.card, styles.skeleton)}>
                <div className={styles.skeletonPhoto} />
                <div className={styles.skeletonContent}>
                  <div className={styles.skeletonLine} style={{ width: '60%' }} />
                  <div className={styles.skeletonLine} style={{ width: '80%' }} />
                  <div className={styles.skeletonLine} style={{ width: '70%' }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && pets.length === 0 && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>✅</div>
            <h2>Nenhum Pet Pendente</h2>
            <p>Todos os pets foram aprovados ou rejeitados. Volte em breve para verificar novas solicitações.</p>
            <Button onClick={handleRefresh} variant="primary">
              Atualizar
            </Button>
          </div>
        )}

        {/* Pets Grid */}
        {pets.length > 0 && (
          <>
            <div className={styles.gridContainer}>
              {pets.map(pet => (
                <PetCard
                  key={pet.id}
                  pet={pet}
                  onApprove={handleApproveClick}
                  onReject={handleRejectClick}
                  isLoading={isProcessing}
                />
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className={styles.pagination}>
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1 || loading}
                >
                  ← Anterior
                </Button>

                <div className={styles.pageIndicator}>
                  Página {pagination.page} de {pagination.pages}
                </div>

                <Button
                  variant="outline"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages || loading}
                >
                  Próxima →
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      <ApproveModal
        isOpen={approveModalOpen}
        onClose={handleCloseModals}
        onConfirm={handleApproveConfirm}
        pet={selectedPet}
        isLoading={isProcessing}
      />

      <RejectModal
        isOpen={rejectModalOpen}
        onClose={handleCloseModals}
        onConfirm={handleRejectConfirm}
        pet={selectedPet}
        isLoading={isProcessing}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
