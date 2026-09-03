'use client';

import Image from 'next/image';
import { Button } from '@/components/ui';
import styles from './PetCard.module.css';
import { clsx } from 'clsx';

/**
 * PetCard Component
 * Displays pet information with approve/reject action buttons
 * Used in admin dashboard for pending pet approval
 *
 * Props:
 * - pet: Pet object with id, name, breed, size, age, photo_urls, owner info
 * - onApprove: Callback when approve button is clicked
 * - onReject: Callback when reject button is clicked
 * - isLoading: Whether buttons should be disabled
 */
export function PetCard({ pet, onApprove, onReject, isLoading = false }) {
  if (!pet) return null;

  const petPhoto = pet.photo_urls?.[0] || null;
  const ownerName = pet.owner_name || 'Sem informação';
  const ownerEmail = pet.owner_email || 'sem-email@example.com';
  const ownerPhone = pet.phone_number || 'Sem telefone';
  const createdDate = pet.created_at
    ? new Date(pet.created_at).toLocaleDateString('pt-BR')
    : 'Data desconhecida';

  return (
    <div className={styles.card}>
      {/* Pet Photo */}
      <div className={styles.photoContainer}>
        {petPhoto ? (
          <Image
            src={petPhoto}
            alt={`${pet.name}`}
            fill
            className={styles.photo}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className={styles.photoPlaceholder}>
            <span className={styles.emoji}>
              {pet.type === 'dog' || pet.type === 'cão' ? '🐕' : '🐈'}
            </span>
          </div>
        )}
      </div>

      {/* Pet Information */}
      <div className={styles.content}>
        <div className={styles.petInfo}>
          <h3 className={styles.petName}>{pet.name}</h3>
          <div className={styles.petDetails}>
            {pet.breed && (
              <span className={styles.detail}>
                <span className={styles.label}>Raça:</span> {pet.breed}
              </span>
            )}
            {pet.size && (
              <span className={styles.detail}>
                <span className={styles.label}>Tamanho:</span> {pet.size}
              </span>
            )}
            {pet.age && (
              <span className={styles.detail}>
                <span className={styles.label}>Idade:</span> {pet.age}
              </span>
            )}
          </div>
        </div>

        {/* Owner Information */}
        <div className={styles.ownerInfo}>
          <h4 className={styles.sectionTitle}>Informações do Criador</h4>
          <div className={styles.ownerDetails}>
            {ownerName !== 'Sem informação' && (
              <div className={styles.ownerDetail}>
                <span className={styles.label}>Nome:</span>
                <span className={styles.value}>{ownerName}</span>
              </div>
            )}
            <div className={styles.ownerDetail}>
              <span className={styles.label}>Email:</span>
              <a href={`mailto:${ownerEmail}`} className={styles.link}>
                {ownerEmail}
              </a>
            </div>
            {ownerPhone !== 'Sem telefone' && (
              <div className={styles.ownerDetail}>
                <span className={styles.label}>Telefone:</span>
                <a href={`tel:${ownerPhone}`} className={styles.link}>
                  {ownerPhone}
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Registration Date */}
        <div className={styles.metadata}>
          <span className={styles.date}>
            <span className={styles.label}>Cadastro:</span> {createdDate}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className={styles.actions}>
        <Button
          variant="secondary"
          onClick={() => onReject?.(pet)}
          disabled={isLoading}
          className={styles.rejectBtn}
        >
          Rejeitar
        </Button>
        <Button
          variant="primary"
          onClick={() => onApprove?.(pet)}
          disabled={isLoading}
          className={styles.approveBtn}
        >
          Aprovar
        </Button>
      </div>
    </div>
  );
}

export default PetCard;
