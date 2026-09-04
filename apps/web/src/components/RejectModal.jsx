'use client';

import { useState } from 'react';
import { Modal, Button } from '@/components/ui';
import Image from 'next/image';
import styles from './RejectModal.module.css';

/**
 * RejectModal Component
 * Modal for rejecting a pet with reason in admin dashboard
 * Requirements: Wave 5 Task 5.3
 *
 * Props:
 * - isOpen: Whether modal is visible
 * - onClose: Callback when modal is closed
 * - onConfirm: Callback with rejection reason
 * - pet: Pet object with id, name, photo_urls, owner info
 * - isLoading: Whether submission is in progress
 */
export function RejectModal({ isOpen, onClose, onConfirm, pet, isLoading = false }) {
  const [selectedReason, setSelectedReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const rejectionReasons = [
    { value: 'incomplete_info', label: 'Informações incompletas' },
    { value: 'insufficient_docs', label: 'Documentação insuficiente' },
    { value: 'data_contradiction', label: 'Contradição nos dados' },
    { value: 'other', label: 'Outro (especifique abaixo)' },
  ];

  const handleSubmit = async () => {
    setError('');

    // Validate reason is selected
    if (!selectedReason) {
      setError('Por favor, selecione um motivo para a rejeição');
      return;
    }

    // If other reason selected, validate custom reason
    if (selectedReason === 'other') {
      const trimmed = customReason.trim();
      if (!trimmed) {
        setError('Por favor, descreva o motivo da rejeição');
        return;
      }
      if (trimmed.length < 10) {
        setError('O motivo deve ter pelo menos 10 caracteres');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const reason = selectedReason === 'other' ? customReason : selectedReason;
      await onConfirm?.(reason);
      handleClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedReason('');
    setCustomReason('');
    setError('');
    onClose?.();
  };

  if (!pet) return null;

  const petPhoto = pet.photo_urls?.[0] || null;
  const ownerName = pet.owner_name || 'Proprietário desconhecido';

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Rejeitar Pet"
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

        {/* Message Section */}
        <div className={styles.message}>
          <p>
            Você está prestes a <strong>rejeitar</strong> o pet <strong>{pet.name}</strong>.
          </p>
          <p className={styles.secondaryMessage}>
            Uma notificação de rejeição será enviada ao proprietário com o motivo.
          </p>
        </div>

        {/* Reason Selection */}
        <div className={styles.form}>
          <label className={styles.label}>
            <span className={styles.labelText}>Motivo da rejeição:</span>
            <select
              value={selectedReason}
              onChange={(e) => {
                setSelectedReason(e.target.value);
                setError('');
              }}
              className={styles.select}
              disabled={isLoading || isSubmitting}
            >
              <option value="">-- Selecione um motivo --</option>
              {rejectionReasons.map(reason => (
                <option key={reason.value} value={reason.value}>
                  {reason.label}
                </option>
              ))}
            </select>
          </label>

          {selectedReason === 'other' && (
            <label className={styles.label}>
              <span className={styles.labelText}>Descreva o motivo:</span>
              <textarea
                value={customReason}
                onChange={(e) => {
                  setCustomReason(e.target.value);
                  setError('');
                }}
                placeholder="Explique por que você está rejeitando este pet..."
                className={styles.textarea}
                maxLength={500}
                disabled={isLoading || isSubmitting}
                rows={4}
              />
              <span className={styles.charCount}>
                {customReason.length}/500
              </span>
            </label>
          )}

          {error && (
            <div className={styles.errorMessage}>
              <svg className={styles.errorIcon} fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              {error}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className={styles.actions}>
          <Button
            variant="secondary"
            onClick={handleClose}
            disabled={isLoading || isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            variant="secondary"
            onClick={handleSubmit}
            loading={isLoading || isSubmitting}
          >
            Rejeitar
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default RejectModal;
