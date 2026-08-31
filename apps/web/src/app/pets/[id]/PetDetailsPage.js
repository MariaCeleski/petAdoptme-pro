'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { PetGallery, PetInfo, OwnerInfo, SuccessStories } from '@/components/pets';
import { Button, Card, Badge, LoadingSkeleton } from '@/components/ui';
import { 
  ArrowLeftIcon,
  HeartIcon,
  ShareIcon,
  MapPinIcon,
  CalendarIcon,
  UserIcon,
  PawPrintIcon
} from 'lucide-react';
import styles from './PetDetailsPage.module.css';
import { clsx } from 'clsx';

/**
 * PetDetailsPage Client Component
 * Detailed pet information with gallery, owner info, and interest button
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7
 */
export function PetDetailsPage({ pet }) {
  const router = useRouter();
  const { data: session } = useSession();
  
  // State for interactions
  const [isFavorite, setIsFavorite] = useState(false);
  const [isInterested, setIsInterested] = useState(false);
  const [showInterestModal, setShowInterestModal] = useState(false);

  // Check if user can express interest
  const canExpressInterest = pet.status === 'APPROVED' && 
                           session && 
                           session.user.id !== pet.owner.id;

  /**
   * Handle back navigation
   */
  const handleGoBack = useCallback(() => {
    router.back();
  }, [router]);

  /**
   * Handle share functionality
   */
  const handleShare = useCallback(async () => {
    const shareData = {
      title: `${pet.name} - ${pet.breed} para Adoção`,
      text: `Conheça ${pet.name}, um ${pet.breed} incrível disponível para adoção!`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Share cancelled or failed:', err);
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        // TODO: Show toast notification
        alert('Link copiado para a área de transferência!');
      } catch (err) {
        console.error('Failed to copy to clipboard:', err);
        prompt('Copie este link:', window.location.href);
      }
    }
  }, [pet.name, pet.breed]);

  /**
   * Handle favorite toggle
   */
  const handleFavoriteToggle = useCallback(() => {
    if (!session) {
      router.push('/auth/login');
      return;
    }

    setIsFavorite(!isFavorite);
    // TODO: Call API to persist favorite
  }, [session, router, isFavorite]);

  /**
   * Handle express interest
   * Requirements: 5.5, 5.6
   */
  const handleExpressInterest = useCallback(() => {
    if (!session) {
      router.push('/auth/login');
      return;
    }

    if (pet.status !== 'APPROVED') {
      alert('Este pet não está mais disponível para adoção.');
      return;
    }

    // Navigate to adoption form
    router.push(`/adopt/${pet.id}`);
  }, [session, router, pet.id, pet.status]);

  /**
   * Get status badge variant
   */
  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'APPROVED':
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'ADOPTED':
        return 'info';
      case 'UNAVAILABLE':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  /**
   * Get status label
   */
  const getStatusLabel = (status) => {
    switch (status) {
      case 'APPROVED':
        return 'Disponível';
      case 'PENDING':
        return 'Adoção em Andamento';
      case 'ADOPTED':
        return 'Adotado';
      case 'UNAVAILABLE':
        return 'Indisponível';
      default:
        return status;
    }
  };

  return (
    <div className={styles.petDetailsPage}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <Button
            variant="ghost"
            onClick={handleGoBack}
            className={styles.backButton}
          >
            <ArrowLeftIcon size={20} />
            <span className="hidden sm:inline">Voltar</span>
          </Button>

          <div className={styles.headerActions}>
            <Button
              variant="ghost"
              onClick={handleFavoriteToggle}
              className={clsx(styles.favoriteButton, {
                [styles.active]: isFavorite
              })}
            >
              <HeartIcon size={20} fill={isFavorite ? 'currentColor' : 'none'} />
            </Button>

            <Button
              variant="ghost"
              onClick={handleShare}
              className={styles.shareButton}
            >
              <ShareIcon size={20} />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.mainContent}>
        <div className={styles.contentGrid}>
          
          {/* Left Column - Gallery */}
          <div className={styles.gallerySection}>
            <PetGallery
              images={pet.images || []}
              petName={pet.name}
              className={styles.petGallery}
            />
          </div>

          {/* Right Column - Pet Info */}
          <div className={styles.infoSection}>
            {/* Pet Basic Info */}
            <Card className={styles.basicInfoCard}>
              <Card.Body>
                <div className={styles.petHeader}>
                  <div className={styles.petTitle}>
                    <h1 className={styles.petName}>{pet.name}</h1>
                    <Badge 
                      variant={getStatusBadgeVariant(pet.status)}
                      className={styles.statusBadge}
                    >
                      {getStatusLabel(pet.status)}
                    </Badge>
                  </div>
                  
                  <div className={styles.petSubtitle}>
                    <span className={styles.breed}>{pet.breed}</span>
                    <span className={styles.separator}>•</span>
                    <span className={styles.species}>
                      {pet.species === 'DOG' ? 'Cachorro' : 'Gato'}
                    </span>
                  </div>
                </div>

                {/* Quick Info */}
                <div className={styles.quickInfo}>
                  <div className={styles.infoItem}>
                    <CalendarIcon size={16} className={styles.infoIcon} />
                    <span>{pet.age} {pet.age === 1 ? 'ano' : 'anos'}</span>
                  </div>
                  
                  <div className={styles.infoItem}>
                    <PawPrintIcon size={16} className={styles.infoIcon} />
                    <span>{pet.gender === 'MALE' ? 'Macho' : 'Fêmea'}</span>
                  </div>
                  
                  <div className={styles.infoItem}>
                    <UserIcon size={16} className={styles.infoIcon} />
                    <span>Porte {pet.size.toLowerCase()}</span>
                  </div>
                  
                  {pet.location && (
                    <div className={styles.infoItem}>
                      <MapPinIcon size={16} className={styles.infoIcon} />
                      <span>{pet.location}</span>
                    </div>
                  )}
                </div>

                {/* Interest Button */}
                {canExpressInterest && (
                  <Button
                    variant="primary"
                    size="large"
                    onClick={handleExpressInterest}
                    className={styles.interestButton}
                  >
                    <HeartIcon size={20} />
                    Manifestar Interesse
                  </Button>
                )}

                {pet.status !== 'APPROVED' && (
                  <div className={styles.unavailableMessage}>
                    {pet.status === 'ADOPTED' && (
                      <p>🎉 Este pet já foi adotado! Que tal conhecer outros pets disponíveis?</p>
                    )}
                    {pet.status === 'PENDING' && (
                      <p>⏳ Este pet tem um processo de adoção em andamento.</p>
                    )}
                    {pet.status === 'UNAVAILABLE' && (
                      <p>😔 Este pet não está disponível para adoção no momento.</p>
                    )}
                  </div>
                )}

                {!session && pet.status === 'APPROVED' && (
                  <div className={styles.loginMessage}>
                    <p>Para manifestar interesse, você precisa estar logado.</p>
                    <Button
                      variant="outline"
                      onClick={() => router.push('/auth/login')}
                      className={styles.loginButton}
                    >
                      Fazer Login
                    </Button>
                  </div>
                )}
              </Card.Body>
            </Card>

            {/* Detailed Pet Information */}
            <PetInfo pet={pet} />

            {/* Owner/Shelter Information */}
            <OwnerInfo 
              owner={pet.owner} 
              shelter={pet.shelter}
            />
          </div>
        </div>

        {/* Success Stories Section */}
        {pet.successStories && pet.successStories.length > 0 && (
          <div className={styles.successStoriesSection}>
            <SuccessStories 
              stories={pet.successStories}
              ownerName={pet.owner.name}
            />
          </div>
        )}

        {/* Related Pets Section */}
        <div className={styles.relatedPetsSection}>
          <Card>
            <Card.Body>
              <h3 className={styles.sectionTitle}>
                Outros pets de {pet.owner.name}
              </h3>
              <p className={styles.sectionSubtitle}>
                Conheça outros pets disponíveis do mesmo proprietário
              </p>
              {/* TODO: Implement RelatedPetsList component */}
              <div className={styles.relatedPetsPlaceholder}>
                <p>Carregando pets relacionados...</p>
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
}