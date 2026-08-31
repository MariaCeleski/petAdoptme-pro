'use client';

import { useState } from 'react';
import { Modal, Button } from '@/components/ui';
import styles from './ApprovalModal.module.css';

/**
 * ApprovalModal Component
 * Confirmation modal for approving adoption requests
 * Requirements: 6.5 (allow approval), 6.6 (notify via email)
 *
 * Props:
 * - isOpen: Whether the modal is open
 * - onClose: Callback when modal is closed
 * - onConfirm: Callback with approval data
 * - petName: Name of the pet
 * - adopterName: Name of the adopter
 * - isLoading: Whether the submission is loading
 */
export function ApprovalModal({
  isOpen,
  onClose,
  onConfirm,
  petName = 'Pet',
  adopterName = 'Adotante',
  isLoading = false
}) {
  const [confirmationText, setConfirmationText] = useState('');

  const handleConfirm = () => {
    onConfirm?.({
      confirmationText: confirmationText || null
    });
    setConfirmationText('');
  };

  const handleClose = () => {
    setConfirmationText('');
    onClose?.();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Confirmar Aprovação de Adoção"
      size="small"
    >
      <div className={styles.content}>
        <div className={styles.message}>
          <p>
            Você está prestes a <strong>aprovar</strong> a solicitação de adoção de{' '}
            <strong>{adopterName}</strong> para o pet <strong>{petName}</strong>.
          </p>
          <p className={styles.secondaryMessage}>
            Uma notificação será enviada ao adotante com a aprovação. Você poderá marcar como concluída depois que confirmar os detalhes.
          </p>
        </div>

        <div className={styles.form}>
          <label className={styles.label}>
            <span>Notas adicionais (opcional):</span>
            <textarea
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              placeholder="Ex: Combinamos uma data para o adotante vir buscar o pet..."
              className={styles.textarea}
              maxLength={500}
              disabled={isLoading}
              rows={3}
            />
            <span className={styles.charCount}>
              {confirmationText.length}/500
            </span>
          </label>
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
            variant="primary"
            onClick={handleConfirm}
            loading={isLoading}
          >
            Aprovar Adoção
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default ApprovalModal;
