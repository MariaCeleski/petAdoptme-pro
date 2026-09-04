'use client';

import { useState } from 'react';
import { Modal, Button } from '@/components/ui';
import Image from 'next/image';
import styles from './ApproveModal.module.css';

/**
 * ApproveModal Component
 * Modal for confirming pet approval in admin dashboard
 * Requirements: Wave 5 Task 5.2
 *
 * Props:
 * - isOpen: Whether modal is visible
 * - onClose: Callback when modal is closed
 * - onConfirm: Callback with approval data
 * - pet: Pet object with id, name, photo_urls, owner info
 * - isLoading: Whether submission is in progress
 */
export function ApproveModal({ isOpen, onClose, onConfirm, pet, isLoading = false }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm?.();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!pet) return null;

  const petPhoto = pet.photo_urls?.[0] || null;
  const ownerName = pet.owner_name || 'Proprietário desconhecido';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Aprovar Pet"
      size="small"
      className={styles.modal}
    >
      <div className={styles.content}>
        {/* Pet Photo and Name */}
        <div className={styles.petSection}>
          <div className={styles.petPhotoContainer}>
            {petPhoto ? (
              <Image
                src={petPhoto}
                alt={pet.name}
                fill
                className={styles.petPhoto}
                sizes="150px"
              />
            ) : (
              <div className={styles.petPhotoPlaceholder}>
                <span className={styles.emoji}>
                  {pet.type === 'dog' || pet.type === 'cão' ? '🐕' : '🐈'}
                </span>
              </div>
            )}
          </div>
          <div>
            <h3 className={styles.petName}>{pet.name}</h3>
            <p className={styles.ownerName}>{ownerName}</p>
          </div>
        </div>

        {/* Confirmation Message */}
        <div className={styles.message}>
          <p>
            Você está prestes a <strong>aprovar</strong> o pet <strong>{pet.name}</strong> para
            adoção.
          </p>
          <p className={styles.secondaryMessage}>
            Uma notificação de aprovação será enviada ao proprietário.
          </p>
        </div>

        {/* Action Buttons */}
        <div className={styles.actions}>
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isLoading || isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirm}
            loading={isLoading || isSubmitting}
          >
            Aprovar
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default ApproveModal;
