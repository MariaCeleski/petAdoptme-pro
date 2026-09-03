'use client';

import Link from 'next/link';
import styles from './PetCard.module.css';

const SPECIES_ICONS = {
  DOG: '🐕',
  CAT: '🐱',
};

const SIZE_ICONS = {
  SMALL: '📏',
  MEDIUM: '📊',
  LARGE: '📈',
  XLARGE: '🏔️',
};

export default function PetCard({ pet }) {
  if (!pet) return null;

  return (
    <Link href={`/pets/${pet.id}`}>
      <div className={styles.petCard}>
        {/* Image Container */}
        <div className={styles.imageContainer}>
          <div className={styles.imagePlaceholder}>
            {pet.photos && pet.photos.length > 0 ? (
              <img
                src={pet.photos[0].url}
                alt={pet.name}
                className={styles.petImage}
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/300x300?text=Sem+foto';
                }}
              />
            ) : (
              <div className={styles.noImagePlaceholder}>
                <span className={styles.noImageIcon}>
                  {SPECIES_ICONS[pet.species] || '🐾'}
                </span>
                <p>Sem foto</p>
              </div>
            )}
          </div>

          {/* Status Badge */}
          <div className={styles.statusBadge}>
            <span className={styles.badgeText}>✨ Disponível</span>
          </div>

          {/* Species Icon */}
          <div className={styles.speciesIcon}>
            {SPECIES_ICONS[pet.species] || '🐾'}
          </div>
        </div>

        {/* Content */}
        <div className={styles.cardContent}>
          {/* Pet Name */}
          <h2 className={styles.petName}>{pet.name}</h2>

          {/* Breed and Size */}
          <div className={styles.petMeta}>
            <span className={styles.breed}>{pet.breed}</span>
            <span className={styles.metaSeparator}>•</span>
            <span className={styles.size}>
              {SIZE_ICONS[pet.size]} {pet.size.charAt(0) + pet.size.slice(1).toLowerCase()}
            </span>
          </div>

          {/* Description */}
          <p className={styles.description}>
            {pet.description && pet.description.substring(0, 85)}
            {pet.description && pet.description.length > 85 ? '...' : ''}
          </p>

          {/* Quick Info Badges */}
          <div className={styles.quickInfoBadges}>
            <div className={styles.badge}>
              <span className={styles.badgeIcon}>📅</span>
              <span className={styles.badgeText}>
                {pet.age} {pet.age === 1 || pet.age === '1' ? 'ano' : 'anos'}
              </span>
            </div>

            <div className={styles.badge}>
              <span className={styles.badgeIcon}>
                {pet.gender === 'MALE' ? '🐕‍🦺' : '👑'}
              </span>
              <span className={styles.badgeText}>
                {pet.gender === 'MALE' ? 'Macho' : 'Fêmea'}
              </span>
            </div>

            <div className={styles.badge}>
              <span className={styles.badgeIcon}>
                {pet.is_vaccinated ? '💉' : '❌'}
              </span>
              <span className={styles.badgeText}>
                {pet.is_vaccinated ? 'Vacinado' : 'Não vacinado'}
              </span>
            </div>

            <div className={styles.badge}>
              <span className={styles.badgeIcon}>
                {pet.is_neutered ? '✂️' : '❌'}
              </span>
              <span className={styles.badgeText}>
                {pet.is_neutered ? 'Castrado' : 'Não castrado'}
              </span>
            </div>
          </div>

          {/* CTA Button */}
          <div className={styles.ctaSection}>
            <button className={styles.detailsButton}>
              Ver Detalhes →
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
