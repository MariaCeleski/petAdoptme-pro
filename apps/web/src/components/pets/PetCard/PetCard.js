'use client';

import Link from 'next/link';
import { Card, Button, Badge, OptimizedImage } from '@/components/ui';
import { HeartIcon, MapPinIcon, CalendarIcon, UserIcon } from 'lucide-react';
import styles from './PetCard.module.css';
import { clsx } from 'clsx';

export default function PetCard({ 
  pet, 
  variant = 'default',
  onInterestClick,
  showOwner = true,
  className,
  onFavoriteToggle,
  isFavorite = false,
  ...props 
}) {
  const primaryImage = pet.images?.[0] || '/images/pet-placeholder.jpg';
  const isAvailable = pet.status === 'APPROVED';

  const handleInterestClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onInterestClick && isAvailable) {
      onInterestClick(pet);
    }
  };

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onFavoriteToggle) {
      onFavoriteToggle(pet, !isFavorite);
    }
  };

  const formatAge = (age) => {
    if (!age) return 'Idade não informada';
    return age;
  };

  const formatSize = (size) => {
    const sizes = {
      SMALL: 'Pequeno',
      MEDIUM: 'Médio', 
      LARGE: 'Grande'
    };
    return sizes[size] || size;
  };

  const formatGender = (gender) => {
    const genders = {
      MALE: 'Macho',
      FEMALE: 'Fêmea'
    };
    return genders[gender] || gender;
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      AVAILABLE: { variant: 'success', label: 'Disponível' },
      PENDING: { variant: 'warning', label: 'Pendente' },
      ADOPTED: { variant: 'info', label: 'Adotado' },
      UNAVAILABLE: { variant: 'secondary', label: 'Indisponível' }
    };
    return statusConfig[status] || { variant: 'secondary', label: status };
  };

  const statusInfo = getStatusBadge(pet.status);

  return (
    <Card 
      className={clsx(
        styles.petCard,
        styles[variant],
        {
          [styles.unavailable]: !isAvailable,
          [styles.featured]: variant === 'featured'
        },
        className
      )}
      hover={true}
      {...props}
    >
      <Link href={`/pets/${pet.id}`} className={styles.cardLink}>
        <div className={styles.imageContainer}>
          <OptimizedImage
            src={primaryImage}
            alt={`${pet.name} - ${pet.breed}`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className={styles.petImage}
            priority={variant === 'featured'}
            quality={variant === 'featured' ? 90 : 85}
            zoomOnHover
            fadeIn
            fallbackSrc="/images/pet-placeholder.jpg"
          />
          
          <div className={styles.imageOverlay}>
            <Badge 
              variant={statusInfo.variant}
              className={styles.statusBadge}
            >
              {statusInfo.label}
            </Badge>
            
            {onFavoriteToggle && (
              <button 
                className={clsx(styles.favoriteButton, {
                  [styles.favorited]: isFavorite
                })}
                onClick={handleFavoriteClick}
                aria-label={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
              >
                <HeartIcon 
                  size={20}
                  fill={isFavorite ? 'currentColor' : 'none'}
                />
              </button>
            )}
          </div>

          {pet.images && pet.images.length > 1 && (
            <div className={styles.imageCount}>
              <span>{pet.images.length} fotos</span>
            </div>
          )}
        </div>

        <Card.Body className={styles.cardBody}>
          <div className={styles.petInfo}>
            <Card.Title as="h3" className={styles.petName}>
              {pet.name}
            </Card.Title>
            
            <div className={styles.petMeta}>
              <span className={styles.breed}>{pet.breed}</span>
              <span className={styles.separator}>•</span>
              <span className={styles.genderSize}>
                {formatGender(pet.gender)} • {formatSize(pet.size)}
              </span>
            </div>

            <div className={styles.petDetails}>
              <div className={styles.detail}>
                <CalendarIcon size={16} />
                <span>{formatAge(pet.age)}</span>
              </div>

              {pet.location && (
                <div className={styles.detail}>
                  <MapPinIcon size={16} />
                  <span>{pet.location}</span>
                </div>
              )}
            </div>

            {pet.personality && pet.personality.length > 0 && (
              <div className={styles.personality}>
                {pet.personality.slice(0, 3).map((trait, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary" 
                    size="small"
                    className={styles.personalityBadge}
                  >
                    {trait}
                  </Badge>
                ))}
                {pet.personality.length > 3 && (
                  <span className={styles.moreTraits}>
                    +{pet.personality.length - 3}
                  </span>
                )}
              </div>
            )}

            {pet.description && (
              <Card.Description className={styles.description}>
                {pet.description.length > 100 
                  ? `${pet.description.substring(0, 100)}...`
                  : pet.description
                }
              </Card.Description>
            )}
          </div>

          {showOwner && pet.owner && (
            <div className={styles.ownerInfo}>
              <UserIcon size={16} />
              <span>{pet.owner.name}</span>
              {pet.shelter && (
                <>
                  <span className={styles.separator}>•</span>
                  <span>{pet.shelter.name}</span>
                </>
              )}
            </div>
          )}
        </Card.Body>

        <Card.Footer className={styles.cardFooter}>
          <Button
            variant={isAvailable ? 'primary' : 'secondary'}
            size="medium"
            fullWidth
            disabled={!isAvailable}
            onClick={handleInterestClick}
            className={styles.interestButton}
          >
            {isAvailable ? 'Tenho interesse' : statusInfo.label}
          </Button>
        </Card.Footer>
      </Link>
    </Card>
  );
}

// Variants para diferentes contextos
PetCard.Featured = function PetCardFeatured(props) {
  return <PetCard {...props} variant="featured" />;
};

PetCard.Compact = function PetCardCompact(props) {
  return <PetCard {...props} variant="compact" showOwner={false} />;
};

PetCard.Admin = function PetCardAdmin({ pet, onEdit, onStatusChange, ...props }) {
  return (
    <PetCard {...props} pet={pet}>
      <Card.Actions className={styles.adminActions}>
        <Button
          variant="outline"
          size="small"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onEdit?.(pet);
          }}
        >
          Editar
        </Button>
        <Button
          variant="secondary" 
          size="small"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onStatusChange?.(pet);
          }}
        >
          Alterar Status
        </Button>
      </Card.Actions>
    </PetCard>
  );
};