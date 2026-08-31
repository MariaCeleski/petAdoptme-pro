'use client';

import { useState } from 'react';
import { Card, Button, Badge, OptimizedImage } from '@/components/ui';
import { ApprovalModal } from '../ApprovalModal';
import { RejectionModal } from '../RejectionModal';
import styles from './AdoptionRequest.module.css';

/**
 * AdoptionRequest Component
 * Displays a single adoption request for pet owner review
 * Requirements: 6.5 (allow approval/rejection), 6.6 (notify via email)
 * 
 * Props:
 * - adoption: Adoption request object with pet, adopter, and adopterInfo
 * - onStatusChange: Callback when adoption status is updated
 * - isLoading: Whether the component is in a loading state
 * - canApprove: Whether the current user can approve (should be pet owner)
 */
export function AdoptionRequest({ adoption, onStatusChange, isLoading = false, canApprove = false }) {
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  const { pet, adopter, adopterInfo, status, createdAt } = adoption;

  // Format date
  const formattedDate = new Date(createdAt).toLocaleDateString('pt-BR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Status badge styling
  const statusConfig = {
    PENDING: { color: 'warning', label: 'Pendente' },
    APPROVED: { color: 'success', label: 'Aprovada' },
    REJECTED: { color: 'error', label: 'Rejeitada' },
    COMPLETED: { color: 'info', label: 'Concluída' },
    CANCELLED: { color: 'secondary', label: 'Cancelada' }
  };

  const currentStatusConfig = statusConfig[status] || { color: 'secondary', label: status };

  // Handle approval
  const handleApprove = async (confirmationData) => {
    setActionLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/adoptions/${adoption.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'APPROVED',
          ...confirmationData
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Falha ao aprovar adoção');
      }

      const updatedAdoption = await response.json();
      setShowApprovalModal(false);
      onStatusChange?.(updatedAdoption);
    } catch (err) {
      setError(err.message);
      console.error('Error approving adoption:', err);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle rejection
  const handleReject = async (rejectionReason) => {
    setActionLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/adoptions/${adoption.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'REJECTED',
          rejectionReason
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Falha ao rejeitar adoção');
      }

      const updatedAdoption = await response.json();
      setShowRejectionModal(false);
      onStatusChange?.(updatedAdoption);
    } catch (err) {
      setError(err.message);
      console.error('Error rejecting adoption:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const isDisabled = isLoading || actionLoading || status !== 'PENDING';

  return (
    <>
      <Card className={styles.container} shadow="md" rounded="lg">
        <Card.Header className={styles.header}>
          <div className={styles.titleSection}>
            <h3 className={styles.title}>
              {pet?.name}
            </h3>
            <Badge color={currentStatusConfig.color} size="small">
              {currentStatusConfig.label}
            </Badge>
          </div>
          <p className={styles.date}>{formattedDate}</p>
        </Card.Header>

        <Card.Body className={styles.body}>
          {/* Pet Information */}
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Informações do Pet</h4>
            <div className={styles.petInfo}>
              {pet?.images && pet.images.length > 0 && (
                <div className={styles.petImage}>
                  <OptimizedImage
                    src={pet.images[0]}
                    alt={pet.name}
                    width={120}
                    height={120}
                    objectFit="cover"
                  />
                </div>
              )}
              <div className={styles.petDetails}>
                <div className={styles.infoRow}>
                  <span className={styles.label}>Espécie:</span>
                  <span>{pet?.species === 'DOG' ? 'Cachorro' : 'Gato'}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.label}>Raça:</span>
                  <span>{pet?.breed}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.label}>Idade:</span>
                  <span>{pet?.age}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.label}>Tamanho:</span>
                  <span>{pet?.size === 'SMALL' ? 'Pequeno' : pet?.size === 'MEDIUM' ? 'Médio' : 'Grande'}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.label}>Gênero:</span>
                  <span>{pet?.gender === 'MALE' ? 'Macho' : 'Fêmea'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Adopter Information */}
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Informações do Adotante</h4>
            <div className={styles.adopterInfo}>
              <div className={styles.infoRow}>
                <span className={styles.label}>Nome:</span>
                <span>{adopter?.name}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>Email:</span>
                <span>{adopter?.email}</span>
              </div>
              {adopterInfo?.personalInfo && (
                <>
                  <div className={styles.infoRow}>
                    <span className={styles.label}>Telefone:</span>
                    <span>{adopterInfo.personalInfo.phone}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.label}>Endereço:</span>
                    <span>
                      {adopterInfo.personalInfo.address}, {adopterInfo.personalInfo.city} - {adopterInfo.personalInfo.state}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Living Situation */}
          {adopterInfo?.livingSituation && (
            <div className={styles.section}>
              <h4 className={styles.sectionTitle}>Situação de Moradia</h4>
              <div className={styles.livingSituation}>
                <div className={styles.infoRow}>
                  <span className={styles.label}>Tipo de moradia:</span>
                  <span>
                    {adopterInfo.livingSituation.housingType === 'apartment' ? 'Apartamento' :
                     adopterInfo.livingSituation.housingType === 'house' ? 'Casa' :
                     adopterInfo.livingSituation.housingType === 'farm' ? 'Fazenda' :
                     'Outro'}
                  </span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.label}>Tem quintal:</span>
                  <span>{adopterInfo.livingSituation.hasYard ? 'Sim' : 'Não'}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.label}>Próprio ou alugado:</span>
                  <span>{adopterInfo.livingSituation.ownRent === 'own' ? 'Próprio' : 'Alugado'}</span>
                </div>
                {adopterInfo.livingSituation.ownRent === 'rent' && (
                  <div className={styles.infoRow}>
                    <span className={styles.label}>Aprovação do proprietário:</span>
                    <span>{adopterInfo.livingSituation.landlordApproval ? 'Sim' : 'Não'}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Experience */}
          {adopterInfo?.experience && (
            <div className={styles.section}>
              <h4 className={styles.sectionTitle}>Experiência com Animais</h4>
              <div className={styles.experience}>
                <div className={styles.infoRow}>
                  <span className={styles.label}>Já teve pets:</span>
                  <span>{adopterInfo.experience.hadPetsBefore ? 'Sim' : 'Não'}</span>
                </div>
                {adopterInfo.experience.currentPets && adopterInfo.experience.currentPets.length > 0 && (
                  <div className={styles.infoBlock}>
                    <span className={styles.label}>Pets atuais:</span>
                    <ul className={styles.petsList}>
                      {adopterInfo.experience.currentPets.map((pet, idx) => (
                        <li key={idx}>
                          {pet.species} - {pet.breed} ({pet.age})
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {adopterInfo.experience.veterinarianInfo && (
                  <div className={styles.infoBlock}>
                    <span className={styles.label}>Veterinário:</span>
                    <p>{adopterInfo.experience.veterinarianInfo}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Motivation */}
          {adopterInfo?.motivation && (
            <div className={styles.section}>
              <h4 className={styles.sectionTitle}>Motivação para Adoção</h4>
              <div className={styles.motivation}>
                <div className={styles.infoBlock}>
                  <span className={styles.label}>Por que deseja adotar:</span>
                  <p>{adopterInfo.motivation.whyAdopt}</p>
                </div>
                <div className={styles.infoBlock}>
                  <span className={styles.label}>Comprometimento esperado:</span>
                  <p>{adopterInfo.motivation.expectedCommitment}</p>
                </div>
                <div className={styles.infoBlock}>
                  <span className={styles.label}>Tempo disponível:</span>
                  <p>{adopterInfo.motivation.availableTime}</p>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className={styles.errorMessage}>
              <svg className={styles.errorIcon} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}
        </Card.Body>

        {/* Actions */}
        {canApprove && status === 'PENDING' && (
          <Card.Footer className={styles.footer}>
            <div className={styles.actions}>
              <Button
                variant="primary"
                onClick={() => setShowApprovalModal(true)}
                disabled={isDisabled}
                loading={actionLoading}
              >
                Aprovar
              </Button>
              <Button
                variant="secondary"
                onClick={() => setShowRejectionModal(true)}
                disabled={isDisabled}
                loading={actionLoading}
              >
                Rejeitar
              </Button>
            </div>
          </Card.Footer>
        )}

        {/* View Only Status */}
        {(!canApprove || status !== 'PENDING') && (
          <Card.Footer className={styles.footer}>
            <div className={styles.viewOnlyMessage}>
              {!canApprove && 'Você não tem permissão para modificar esta solicitação.'}
              {status !== 'PENDING' && `Esta solicitação já foi ${status === 'APPROVED' ? 'aprovada' : status === 'REJECTED' ? 'rejeitada' : 'processada'}.`}
            </div>
          </Card.Footer>
        )}
      </Card>

      {/* Modals */}
      <ApprovalModal
        isOpen={showApprovalModal}
        onClose={() => setShowApprovalModal(false)}
        onConfirm={handleApprove}
        petName={pet?.name}
        adopterName={adopter?.name}
        isLoading={actionLoading}
      />

      <RejectionModal
        isOpen={showRejectionModal}
        onClose={() => setShowRejectionModal(false)}
        onSubmit={handleReject}
        petName={pet?.name}
        adopterName={adopter?.name}
        isLoading={actionLoading}
      />
    </>
  );
}

export default AdoptionRequest;
