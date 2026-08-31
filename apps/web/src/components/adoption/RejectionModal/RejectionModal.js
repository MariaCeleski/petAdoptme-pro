'use client';

import { useState } from 'react';
import { Modal, Button } from '@/components/ui';
import styles from './RejectionModal.module.css';

/**
 * RejectionModal Component
 * Modal with form for collecting rejection reason for adoption requests
 * Requirements: 6.5 (allow rejection), 6.6 (notify via email)
 *
 * Props:
 * - isOpen: Whether the modal is open
 * - onClose: Callback when modal is closed
 * - onSubmit: Callback with rejection reason
 * - petName: Name of the pet
 * - adopterName: Name of the adopter
 * - isLoading: Whether the submission is loading
 */
export function RejectionModal({
  isOpen,
  onClose,
  onSubmit,
  petName = 'Pet',
  adopterName = 'Adotante',
  isLoading = false
}) {
  const [selectedReason, setSelectedReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [error, setError] = useState('');

  const rejectionReasons = [
    {
      value: 'incompatible_living',
      label: 'Situação de moradia incompatível'
    },
    {
      value: 'insufficient_experience',
      label: 'Experiência insuficiente com animais'
    },
    {
      value: 'concerns_care',
      label: 'Preocupações sobre cuidado'
    },
    {
      value: 'lack_time',
      label: 'Falta de tempo para dedicar'
    },
    {
      value: 'other',
      label: 'Outro motivo'
    }
  ];

  const handleSubmit = () => {
    setError('');

    // Validate that a reason is selected
    if (!selectedReason) {
      setError('Por favor, selecione um motivo para a rejeição');
      return;
    }

    // Validate custom reason if selected
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

    const reason = selectedReason === 'other' ? customReason : selectedReason;
    onSubmit?.(reason);
    handleClose();
  };

  const handleClose = () => {
    setSelectedReason('');
    setCustomReason('');
    setError('');
    onClose?.();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Rejeitar Solicitação de Adoção"
      size="small"
    >
      <div className={styles.content}>
        <div className={styles.message}>
          <p>
            Você está prestes a <strong>rejeitar</strong> a solicitação de adoção de{' '}
            <strong>{adopterName}</strong> para o pet <strong>{petName}</strong>.
          </p>
          <p className={styles.secondaryMessage}>
            O adotante receberá uma notificação com o motivo da rejeição. O pet voltará a estar disponível para outras solicitações.
          </p>
        </div>

        <div className={styles.form}>
          <label className={styles.label}>
            <span>Motivo da rejeição:</span>
            <select
              value={selectedReason}
              onChange={(e) => {
                setSelectedReason(e.target.value);
                setError('');
              }}
              className={styles.select}
              disabled={isLoading}
            >
              <option value="">-- Selecione um motivo --</option>
              {rejectionReasons.map((reason) => (
                <option key={reason.value} value={reason.value}>
                  {reason.label}
                </option>
              ))}
            </select>
          </label>

          {selectedReason === 'other' && (
            <label className={styles.label}>
              <span>Descreva o motivo:</span>
              <textarea
                value={customReason}
                onChange={(e) => {
                  setCustomReason(e.target.value);
                  setError('');
                }}
                placeholder="Explique por que você está rejeitando esta solicitação..."
                className={styles.textarea}
                maxLength={500}
                disabled={isLoading}
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
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}
        </div>

        <div className={styles.actions}>
          <Button
            variant="secondary"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            variant="secondary"
            onClick={handleSubmit}
            loading={isLoading}
          >
            Rejeitar Adoção
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default RejectionModal;
