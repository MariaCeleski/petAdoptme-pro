'use client';

import { formatDate } from '@/lib/utils';
import styles from './ActivityHistory.module.css';

/**
 * ActivityHistory Component
 * Displays timeline of adoption requests and status changes
 * Requirements: 7.1, 7.5 (adoption history)
 */
export function ActivityHistory({ adoptions }) {
  const getActivityDescription = (adoption) => {
    const pet = adoption.pet;
    
    switch (adoption.status) {
      case 'PENDING':
        return `Solicitação enviada para ${pet?.name}`;
      case 'APPROVED':
        return `Sua solicitação para ${pet?.name} foi aprovada`;
      case 'REJECTED':
        return `Sua solicitação para ${pet?.name} foi rejeitada`;
      case 'COMPLETED':
        return `Você adotou ${pet?.name}! 🎉`;
      case 'CANCELLED':
        return `Você cancelou a solicitação para ${pet?.name}`;
      default:
        return 'Atualização de solicitação';
    }
  };

  const getActivityIcon = (status) => {
    switch (status) {
      case 'PENDING':
        return '📋';
      case 'APPROVED':
        return '✅';
      case 'REJECTED':
        return '❌';
      case 'COMPLETED':
        return '🎉';
      case 'CANCELLED':
        return '🚫';
      default:
        return '📌';
    }
  };

  const getActivityColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'pending';
      case 'APPROVED':
        return 'approved';
      case 'REJECTED':
        return 'rejected';
      case 'COMPLETED':
        return 'completed';
      case 'CANCELLED':
        return 'cancelled';
      default:
        return 'default';
    }
  };

  if (adoptions.length === 0) {
    return (
      <div className={styles.emptyState}>
        <svg className={styles.emptyIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className={styles.emptyText}>Nenhuma atividade registrada</p>
      </div>
    );
  }

  // Sort adoptions by most recent first
  const sortedAdoptions = [...adoptions].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

  return (
    <div className={styles.timeline}>
      {sortedAdoptions.map((adoption, index) => (
        <div key={adoption.id} className={styles.timelineItem}>
          <div className={`${styles.timelineDot} ${styles[`dot${getActivityColor(adoption.status).charAt(0).toUpperCase() + getActivityColor(adoption.status).slice(1)}`]}`}>
            <span>{getActivityIcon(adoption.status)}</span>
          </div>
          
          {index < sortedAdoptions.length - 1 && (
            <div className={styles.timelineLine}></div>
          )}

          <div className={styles.content}>
            <div className={styles.header}>
              <h3 className={styles.title}>{getActivityDescription(adoption)}</h3>
              <time className={styles.time}>
                {formatDate(adoption.updatedAt)}
              </time>
            </div>

            {adoption.pet && (
              <div className={styles.petInfo}>
                <span className={styles.petName}>{adoption.pet.species}</span>
                <span className={styles.separator}>•</span>
                <span className={styles.petBreed}>{adoption.pet.breed}</span>
              </div>
            )}

            {adoption.status === 'REJECTED' && adoption.rejectionReason && (
              <div className={styles.rejectionReason}>
                <strong>Motivo:</strong> {adoption.rejectionReason}
              </div>
            )}

            {adoption.status === 'PENDING' && (
              <p className={styles.statusText}>
                Aguardando resposta do proprietário
              </p>
            )}

            {adoption.status === 'APPROVED' && (
              <p className={styles.statusText}>
                Próximas etapas serão comunicadas por email
              </p>
            )}

            {adoption.status === 'COMPLETED' && adoption.completedAt && (
              <p className={styles.statusText}>
                Adoção finalizada em {formatDate(adoption.completedAt)}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
