'use client';

import Link from 'next/link';
import { useState } from 'react';
import styles from './FavoritePetCard.module.css';

/**
 * FavoritePetCard Component
 * Displays a favorite pet with action buttons
 * Requirements: 7.1 (display favorite pets)
 */
export function FavoritePetCard({ pet, onUnfavorite, onAdoptClick }) {
  const [isRemoving, setIsRemoving] = useState(false);

  const handleRemoveFavorite = async () => {
    if (onUnfavorite) {
      setIsRemoving(true);
      try {
        await onUnfavorite(pet.id);
      } finally {
        setIsRemoving(false);
      }
    }
  };

  return (
    <article className={styles.card}>
      <div className={styles.imageContainer}>
        {pet.images?.[0] ? (
          <img
            src={pet.images[0]}
            alt={pet.name}
            className={styles.image}
          />
        ) : (
          <div className={styles.imagePlaceholder}>
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" />
            </svg>
          </div>
        )}
        {pet.status === 'ADOPTED' && (
          <div className={styles.adoptedBadge}>Adotado</div>
        )}
      </div>

      <div className={styles.content}>
        <h3 className={styles.name}>
          <Link href={`/pets/${pet.id}`} className={styles.nameLink}>
            {pet.name}
          </Link>
        </h3>

        <p className={styles.breed}>
          {pet.breed} • {pet.species}
        </p>

        <div className={styles.info}>
          <span className={styles.infoItem}>
            {pet.gender === 'MALE' ? '♂️ Macho' : '♀️ Fêmea'}
          </span>
          <span className={styles.infoItem}>
            {pet.size === 'SMALL' && 'Pequeno'}
            {pet.size === 'MEDIUM' && 'Médio'}
            {pet.size === 'LARGE' && 'Grande'}
            {pet.size === 'XLARGE' && 'Extra grande'}
          </span>
        </div>

        {pet.location && (
          <p className={styles.location}>
            📍 {pet.location}
          </p>
        )}

        <div className={styles.actions}>
          <Link href={`/pets/${pet.id}`} className={styles.viewButton}>
            Ver Detalhes
          </Link>

          {pet.status !== 'ADOPTED' && (
            <button
              className={styles.adoptButton}
              onClick={onAdoptClick}
              type="button"
            >
              Adotar
            </button>
          )}

          <button
            className={styles.removeButton}
            onClick={handleRemoveFavorite}
            disabled={isRemoving}
            title="Remover dos favoritos"
            type="button"
          >
            {isRemoving ? '...' : '❤️'}
          </button>
        </div>
      </div>
    </article>
  );
}
