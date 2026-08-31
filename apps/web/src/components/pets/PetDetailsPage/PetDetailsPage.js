'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import PetDetails from '../PetDetails/PetDetails';
import { Modal, Button } from '@/components/ui';
import { HeartIcon } from 'lucide-react';
import styles from './PetDetailsPage.module.css';

/**
 * Client-side wrapper for Pet Details page
 * Handles interactive features like interest expression and favoriting
 */
export default function PetDetailsPage({ 
  pet, 
  successStories, 
  relatedPets, 
  showOwnerContact 
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const [showInterestModal, setShowInterestModal] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false); // TODO: Get from user preferences
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isOwner = session?.user?.id === pet.ownerId;
  const canShowInterest = session && !isOwner && pet.status === 'APPROVED';

  const handleInterestClick = () => {
    if (!session) {
      // Redirect to sign in
      router.push(`/auth/signin?callbackUrl=/pets/${pet.id}`);
      return;
    }

    if (!canShowInterest) {
      return;
    }

    setShowInterestModal(true);
  };

  const handleInterestConfirm = async () => {
    if (!canShowInterest || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // TODO: Implement adoption interest submission
      // This would typically redirect to an adoption form
      router.push(`/pets/${pet.id}/adopt`);
    } catch (error) {
      console.error('Error expressing interest:', error);
      // TODO: Show error toast
    } finally {
      setIsSubmitting(false);
      setShowInterestModal(false);
    }
  };

  const handleFavoriteToggle = async (pet, newFavoriteStatus) => {
    if (!session) {
      router.push(`/auth/signin?callbackUrl=/pets/${pet.id}`);
      return;
    }

    try {
      // TODO: Implement favorite toggle API call
      setIsFavorite(newFavoriteStatus);
      
      // Show success feedback
      // TODO: Show toast notification
      console.log(`Pet ${newFavoriteStatus ? 'added to' : 'removed from'} favorites`);
    } catch (error) {
      console.error('Error toggling favorite:', error);
      // Revert state on error
      setIsFavorite(!newFavoriteStatus);
      // TODO: Show error toast
    }
  };

  return (
    <>
      <PetDetails
        pet={pet}
        successStories={successStories}
        relatedPets={relatedPets}
        showOwnerContact={showOwnerContact}
        isFavorite={isFavorite}
        onInterestClick={handleInterestClick}
        onFavoriteToggle={handleFavoriteToggle}
      />

      {/* Interest Confirmation Modal */}
      <Modal
        isOpen={showInterestModal}
        onClose={() => setShowInterestModal(false)}
        title={`Interesse em adotar ${pet.name}`}
        size="medium"
      >
        <div className={styles.interestModal}>
          <div className={styles.petSummary}>
            <div className={styles.petImageSmall}>
              {pet.images && pet.images.length > 0 && (
                <img 
                  src={pet.images[0]} 
                  alt={pet.name}
                  className={styles.summaryImage}
                />
              )}
            </div>
            
            <div className={styles.petInfo}>
              <h4>{pet.name}</h4>
              <p>{pet.breed} • {pet.age}</p>
            </div>
          </div>

          <div className={styles.interestContent}>
            <p>
              Você está prestes a manifestar interesse em adotar <strong>{pet.name}</strong>.
            </p>
            
            <p>
              Você será direcionado para preencher um formulário com suas informações. 
              O responsável pelo pet receberá sua solicitação e entrará em contato.
            </p>

            <div className={styles.interestWarning}>
              <HeartIcon size={20} />
              <span>
                Lembre-se: adotar um pet é um compromisso de longo prazo. 
                Certifique-se de que está preparado para esta responsabilidade.
              </span>
            </div>
          </div>

          <div className={styles.modalActions}>
            <Button
              variant="outline"
              onClick={() => setShowInterestModal(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            
            <Button
              variant="primary"
              onClick={handleInterestConfirm}
              disabled={isSubmitting}
              loading={isSubmitting}
            >
              <HeartIcon size={16} />
              Continuar
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}