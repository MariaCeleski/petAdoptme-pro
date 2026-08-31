'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Button, 
  Card, 
  Badge, 
  Modal,
  Avatar,
  OptimizedImage 
} from '@/components/ui';
import { ShelterInfo } from '@/components/shelter';
import { 
  HeartIcon, 
  MapPinIcon, 
  CalendarIcon, 
  UserIcon,
  PhoneIcon,
  MailIcon,
  CheckCircleIcon,
  XCircleIcon,
  InfoIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ShareIcon,
  FlagIcon,
  ImageIcon
} from 'lucide-react';
import styles from './PetDetails.module.css';
import { clsx } from 'clsx';

export default function PetDetails({ 
  pet,
  onInterestClick,
  onFavoriteToggle,
  isFavorite = false,
  showOwnerContact = false,
  successStories = [],
  relatedPets = []
}) {
  const { data: session } = useSession();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [imageError, setImageError] = useState({});
  const [isImageLoading, setIsImageLoading] = useState({});
  const [galleryZoom, setGalleryZoom] = useState(1);
  const [galleryPosition, setGalleryPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const isAvailable = pet.status === 'APPROVED';
  const isOwner = session?.user?.id === pet.ownerId;
  const canShowInterest = session && !isOwner && isAvailable;

  useEffect(() => {
    // Preload images
    if (pet.images?.length > 0) {
      pet.images.forEach((imageUrl, index) => {
        const img = new Image();
        img.onload = () => {
          setIsImageLoading(prev => ({ ...prev, [index]: false }));
        };
        img.onerror = () => {
          setImageError(prev => ({ ...prev, [index]: true }));
          setIsImageLoading(prev => ({ ...prev, [index]: false }));
        };
        setIsImageLoading(prev => ({ ...prev, [index]: true }));
        img.src = imageUrl;
      });
    }
  }, [pet.images]);

  const handlePrevImage = () => {
    setCurrentImageIndex(prev => 
      prev === 0 ? (pet.images?.length || 1) - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex(prev => 
      prev === (pet.images?.length || 1) - 1 ? 0 : prev + 1
    );
  };

  const handleImageClick = (index) => {
    setCurrentImageIndex(index);
    setShowGalleryModal(true);
    setGalleryZoom(1);
    setGalleryPosition({ x: 0, y: 0 });
  };

  const handleGalleryWheel = (e) => {
    if (showGalleryModal) {
      e.preventDefault();
      const newZoom = Math.min(Math.max(galleryZoom + (e.deltaY > 0 ? -0.1 : 0.1), 0.5), 3);
      setGalleryZoom(newZoom);
      
      // Reset position when zooming out completely
      if (newZoom === 1) {
        setGalleryPosition({ x: 0, y: 0 });
      }
    }
  };

  const handleGalleryMouseDown = (e) => {
    if (galleryZoom > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - galleryPosition.x,
        y: e.clientY - galleryPosition.y
      });
    }
  };

  const handleGalleryMouseMove = (e) => {
    if (isDragging && galleryZoom > 1) {
      setGalleryPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleGalleryMouseUp = () => {
    setIsDragging(false);
  };

  const handleInterest = () => {
    if (canShowInterest && onInterestClick) {
      onInterestClick(pet);
    }
  };

  const handleFavorite = () => {
    if (session && onFavoriteToggle) {
      onFavoriteToggle(pet, !isFavorite);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${pet.name} - Pet para adoção`,
          text: `Conheça ${pet.name}, um ${formatSpecies(pet.species)} em busca de um lar!`,
          url: window.location.href
        });
      } catch (error) {
        console.log('Sharing cancelled or failed:', error);
      }
    } else {
      // Fallback - copy URL to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        // You might want to show a toast here
      } catch (error) {
        console.log('Clipboard write failed:', error);
      }
    }
  };

  const formatSpecies = (species) => {
    const speciesMap = {
      DOG: 'cão',
      CAT: 'gato'
    };
    return speciesMap[species] || species.toLowerCase();
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

  const getStatusInfo = (status) => {
    const statusConfig = {
      AVAILABLE: { 
        variant: 'success', 
        label: 'Disponível para adoção',
        icon: CheckCircleIcon 
      },
      PENDING: { 
        variant: 'warning', 
        label: 'Adoção em processo',
        icon: InfoIcon 
      },
      ADOPTED: { 
        variant: 'info', 
        label: 'Já foi adotado',
        icon: HeartIcon 
      },
      UNAVAILABLE: { 
        variant: 'secondary', 
        label: 'Temporariamente indisponível',
        icon: XCircleIcon 
      }
    };
    return statusConfig[status] || { 
      variant: 'secondary', 
      label: status,
      icon: InfoIcon 
    };
  };

  const statusInfo = getStatusInfo(pet.status);
  const StatusIcon = statusInfo.icon;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className={styles.petDetails}>
      {/* Main Content */}
      <div className={styles.mainContent}>
        {/* Image Gallery */}
        <div className={styles.imageSection}>
          {pet.images && pet.images.length > 0 ? (
            <>
              <div className={styles.mainImageContainer}>
                {isImageLoading[currentImageIndex] && (
                  <div className={styles.imagePlaceholder}>
                    <div className={styles.loadingSkeleton} />
                  </div>
                )}
                
                <OptimizedImage
                  src={pet.images[currentImageIndex]}
                  alt={`${pet.name} - Foto ${currentImageIndex + 1}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 60vw"
                  className={styles.mainImage}
                  onClick={() => handleImageClick(currentImageIndex)}
                  priority
                  quality={90}
                  zoomOnHover
                  fadeIn
                  fallbackSrc="/images/pet-placeholder.jpg"
                />
                
                {/* Navigation arrows */}
                {pet.images.length > 1 && (
                  <>
                    <button
                      className={clsx(styles.navButton, styles.prevButton)}
                      onClick={handlePrevImage}
                      aria-label="Foto anterior"
                    >
                      <ChevronLeftIcon size={24} />
                    </button>
                    
                    <button
                      className={clsx(styles.navButton, styles.nextButton)}
                      onClick={handleNextImage}
                      aria-label="Próxima foto"
                    >
                      <ChevronRightIcon size={24} />
                    </button>
                  </>
                )}
                
                {/* Image counter */}
                <div className={styles.imageCounter}>
                  {currentImageIndex + 1} de {pet.images.length}
                </div>
                
                {/* Actions overlay */}
                <div className={styles.imageActions}>
                  <button
                    className={clsx(styles.actionButton, {
                      [styles.favorited]: isFavorite
                    })}
                    onClick={handleFavorite}
                    disabled={!session}
                    aria-label={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                  >
                    <HeartIcon 
                      size={20}
                      fill={isFavorite ? 'currentColor' : 'none'}
                    />
                  </button>
                  
                  <button
                    className={styles.actionButton}
                    onClick={handleShare}
                    aria-label="Compartilhar"
                  >
                    <ShareIcon size={20} />
                  </button>
                  
                  <button
                    className={styles.actionButton}
                    onClick={() => setShowReportModal(true)}
                    aria-label="Reportar problema"
                  >
                    <FlagIcon size={20} />
                  </button>
                </div>
              </div>
              
              {/* Thumbnail gallery */}
              {pet.images.length > 1 && (
                <div className={styles.thumbnailGallery}>
                  {pet.images.map((imageUrl, index) => (
                    <button
                      key={index}
                      className={clsx(styles.thumbnail, {
                        [styles.active]: index === currentImageIndex
                      })}
                      onClick={() => setCurrentImageIndex(index)}
                    >
                      <OptimizedImage
                        src={imageUrl}
                        alt={`${pet.name} - Miniatura ${index + 1}`}
                        fill
                        sizes="100px"
                        className={styles.thumbnailImage}
                        quality={75}
                        fallbackSrc="/images/pet-placeholder.jpg"
                      />
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className={styles.noImages}>
              <ImageIcon size={48} />
              <span>Nenhuma foto disponível</span>
            </div>
          )}
        </div>

        {/* Pet Information */}
        <div className={styles.infoSection}>
          <Card className={styles.petInfoCard}>
            <Card.Body>
              <div className={styles.petHeader}>
                <div className={styles.titleArea}>
                  <h1 className={styles.petName}>{pet.name}</h1>
                  
                  <div className={styles.petMeta}>
                    <span className={styles.breed}>{pet.breed}</span>
                    <Badge variant={statusInfo.variant} className={styles.statusBadge}>
                      <StatusIcon size={14} />
                      {statusInfo.label}
                    </Badge>
                  </div>
                </div>

                {/* Main action button */}
                {canShowInterest && (
                  <Button
                    variant="primary"
                    size="large"
                    onClick={handleInterest}
                    className={styles.interestButton}
                  >
                    <HeartIcon size={16} />
                    Tenho interesse
                  </Button>
                )}
              </div>

              {/* Basic details */}
              <div className={styles.basicDetails}>
                <div className={styles.detailItem}>
                  <CalendarIcon size={16} />
                  <span>{pet.age}</span>
                </div>
                
                <div className={styles.detailItem}>
                  <span className={styles.genderSize}>
                    {formatGender(pet.gender)} • {formatSize(pet.size)}
                  </span>
                </div>
                
                {pet.color && (
                  <div className={styles.detailItem}>
                    <span>Cor: {pet.color}</span>
                  </div>
                )}
                
                {pet.location && (
                  <div className={styles.detailItem}>
                    <MapPinIcon size={16} />
                    <span>{pet.location}</span>
                  </div>
                )}
              </div>

              {/* Health badges */}
              <div className={styles.healthBadges}>
                {pet.isNeutered && (
                  <Badge variant="success" size="small">
                    <CheckCircleIcon size={12} />
                    Castrado
                  </Badge>
                )}
                
                {pet.isVaccinated && (
                  <Badge variant="success" size="small">
                    <CheckCircleIcon size={12} />
                    Vacinado
                  </Badge>
                )}
              </div>

              {/* Personality traits */}
              {pet.personality && pet.personality.length > 0 && (
                <div className={styles.personality}>
                  <h3>Personalidade</h3>
                  <div className={styles.personalityTraits}>
                    {pet.personality.map((trait, index) => (
                      <Badge 
                        key={index} 
                        variant="secondary" 
                        size="small"
                        className={styles.personalityBadge}
                      >
                        {trait}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              <div className={styles.description}>
                <h3>Sobre {pet.name}</h3>
                <p>{pet.description}</p>
              </div>

              {/* Health information */}
              {pet.healthStatus && (
                <div className={styles.healthInfo}>
                  <h3>Informações de Saúde</h3>
                  <p>{pet.healthStatus}</p>
                </div>
              )}

              {/* Additional info */}
              <div className={styles.additionalInfo}>
                <span className={styles.publishDate}>
                  Publicado em {formatDate(pet.createdAt)}
                </span>
                
                {pet.updatedAt !== pet.createdAt && (
                  <span className={styles.updateDate}>
                    Atualizado em {formatDate(pet.updatedAt)}
                  </span>
                )}
              </div>
            </Card.Body>
          </Card>

          {/* Owner Information */}
          <Card className={styles.ownerCard}>
            <Card.Header>
              <Card.Title as="h3">
                {pet.shelter ? 'Abrigo Responsável' : 'Tutor Responsável'}
              </Card.Title>
            </Card.Header>
            
            <Card.Body>
              <div className={styles.ownerInfo}>
                <div className={styles.ownerDetails}>
                  <div className={styles.ownerIdentity}>
                    <Avatar 
                      src={pet.owner.avatar}
                      alt={pet.owner.name}
                      size="large"
                      fallback={pet.owner.name[0]}
                    />
                    
                    <div>
                      <h4>{pet.owner.name}</h4>
                      {pet.shelter && (
                        <div className={styles.shelterInfo}>
                          <span>{pet.shelter.name}</span>
                          <span className={styles.shelterLocation}>
                            {pet.shelter.city}, {pet.shelter.state}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {showOwnerContact && session && (
                    <div className={styles.contactInfo}>
                      <Button
                        variant="outline"
                        size="medium"
                        onClick={() => setShowContactModal(true)}
                      >
                        <MailIcon size={16} />
                        Ver Contato
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* Shelter Information with Adoption Stats */}
          {pet.shelter && (
            <ShelterInfo 
              shelter={{
                id: pet.shelter.id || '',
                name: pet.shelter.name,
                city: pet.shelter.city,
                state: pet.shelter.state,
                logo: pet.shelter.logo,
                images: pet.shelter.images,
                phone: pet.shelter.phone,
                email: pet.shelter.email,
                website: pet.shelter.website,
                description: pet.shelter.description,
                isVerified: pet.shelter.isVerified
              }}
            />
          )}

          {/* Success Stories */}
          {successStories && successStories.length > 0 && (
            <Card className={styles.successStoriesCard}>
              <Card.Header>
                <Card.Title as="h3">Outras Adoções de Sucesso</Card.Title>
                <Card.Description>
                  Pets que já encontraram um lar através deste tutor
                </Card.Description>
              </Card.Header>
              
              <Card.Body>
                <div className={styles.successStories}>
                  {successStories.map((story, index) => (
                    <div key={index} className={styles.successStory}>
                      <div className={styles.storyImage}>
                        <Image
                          src={story.petImage || '/images/pet-placeholder.jpg'}
                          alt={story.petName}
                          fill
                          sizes="80px"
                          className={styles.storyImg}
                        />
                      </div>
                      
                      <div className={styles.storyDetails}>
                        <h5>{story.petName}</h5>
                        <span>Adotado em {formatDate(story.adoptedAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card.Body>
            </Card>
          )}
        </div>
      </div>

      {/* Related Pets */}
      {relatedPets && relatedPets.length > 0 && (
        <Card className={styles.relatedPetsCard}>
          <Card.Header>
            <Card.Title as="h3">Outros Pets Disponíveis</Card.Title>
            <Card.Description>
              Talvez você se interesse por estes outros pets
            </Card.Description>
          </Card.Header>
          
          <Card.Body>
            <div className={styles.relatedPets}>
              {relatedPets.map((relatedPet) => (
                <Link 
                  key={relatedPet.id}
                  href={`/pets/${relatedPet.id}`}
                  className={styles.relatedPetCard}
                >
                  <div className={styles.relatedPetImage}>
                    <Image
                      src={relatedPet.images?.[0] || '/images/pet-placeholder.jpg'}
                      alt={relatedPet.name}
                      fill
                      sizes="120px"
                      className={styles.relatedImg}
                    />
                  </div>
                  
                  <div className={styles.relatedPetInfo}>
                    <h5>{relatedPet.name}</h5>
                    <span>{relatedPet.breed}</span>
                    <span className={styles.relatedMeta}>
                      {formatGender(relatedPet.gender)} • {relatedPet.age}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Gallery Modal */}
      <Modal
        isOpen={showGalleryModal}
        onClose={() => {
          setShowGalleryModal(false);
          setGalleryZoom(1);
          setGalleryPosition({ x: 0, y: 0 });
        }}
        title={`${pet.name} - Foto ${currentImageIndex + 1} de ${pet.images?.length || 0}`}
        size="full"
        className={styles.galleryModal}
      >
        {pet.images && pet.images[currentImageIndex] && (
          <div 
            className={styles.modalContent}
            onWheel={handleGalleryWheel}
            onMouseDown={handleGalleryMouseDown}
            onMouseMove={handleGalleryMouseMove}
            onMouseUp={handleGalleryMouseUp}
            onMouseLeave={handleGalleryMouseUp}
            style={{ 
              cursor: galleryZoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'
            }}
          >
            <div
              className={styles.zoomContainer}
              style={{
                transform: `scale(${galleryZoom}) translate(${galleryPosition.x / galleryZoom}px, ${galleryPosition.y / galleryZoom}px)`,
                transition: isDragging ? 'none' : 'transform 0.2s ease'
              }}
            >
              <Image
                src={imageError[currentImageIndex] 
                  ? '/images/pet-placeholder.jpg' 
                  : pet.images[currentImageIndex]
                }
                alt={`${pet.name} - Foto ${currentImageIndex + 1}`}
                fill
                sizes="100vw"
                className={styles.modalImage}
                priority
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+kXoiijm3zHmLiIcBOKhvpgRPrXHTnHIASZuoAJgPdv/X4k0l1KN/LJGYlM="
                quality={95}
              />
            </div>
            
            {pet.images.length > 1 && (
              <>
                <button
                  className={clsx(styles.modalNavButton, styles.modalPrevButton)}
                  onClick={handlePrevImage}
                  aria-label="Foto anterior"
                >
                  <ChevronLeftIcon size={32} />
                </button>
                
                <button
                  className={clsx(styles.modalNavButton, styles.modalNextButton)}
                  onClick={handleNextImage}
                  aria-label="Próxima foto"
                >
                  <ChevronRightIcon size={32} />
                </button>
              </>
            )}
            
            {/* Zoom controls */}
            <div className={styles.zoomControls}>
              <button
                className={styles.zoomButton}
                onClick={() => setGalleryZoom(Math.max(galleryZoom - 0.25, 0.5))}
                disabled={galleryZoom <= 0.5}
                aria-label="Diminuir zoom"
              >
                -
              </button>
              
              <span className={styles.zoomLevel}>{Math.round(galleryZoom * 100)}%</span>
              
              <button
                className={styles.zoomButton}
                onClick={() => setGalleryZoom(Math.min(galleryZoom + 0.25, 3))}
                disabled={galleryZoom >= 3}
                aria-label="Aumentar zoom"
              >
                +
              </button>
              
              <button
                className={styles.zoomButton}
                onClick={() => {
                  setGalleryZoom(1);
                  setGalleryPosition({ x: 0, y: 0 });
                }}
                aria-label="Resetar zoom"
              >
                Reset
              </button>
            </div>

            {/* Image thumbnails in modal */}
            {pet.images.length > 1 && (
              <div className={styles.modalThumbnails}>
                {pet.images.map((imageUrl, index) => (
                  <button
                    key={index}
                    className={clsx(styles.modalThumbnail, {
                      [styles.active]: index === currentImageIndex
                    })}
                    onClick={() => {
                      setCurrentImageIndex(index);
                      setGalleryZoom(1);
                      setGalleryPosition({ x: 0, y: 0 });
                    }}
                  >
                    <Image
                      src={imageError[index] ? '/images/pet-placeholder.jpg' : imageUrl}
                      alt={`${pet.name} - Miniatura ${index + 1}`}
                      fill
                      sizes="60px"
                      className={styles.modalThumbnailImage}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Contact Modal */}
      <Modal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        title="Informações de Contato"
        size="medium"
      >
        <div className={styles.contactModal}>
          <div className={styles.contactWarning}>
            <InfoIcon size={20} />
            <p>
              Entre em contato diretamente com o responsável para mais informações 
              sobre {pet.name} ou para agendar uma visita.
            </p>
          </div>
          
          <div className={styles.contactDetails}>
            <div className={styles.contactItem}>
              <UserIcon size={16} />
              <span>{pet.owner.name}</span>
            </div>
            
            {pet.owner.email && (
              <div className={styles.contactItem}>
                <MailIcon size={16} />
                <a href={`mailto:${pet.owner.email}`}>
                  {pet.owner.email}
                </a>
              </div>
            )}
            
            {pet.owner.phone && (
              <div className={styles.contactItem}>
                <PhoneIcon size={16} />
                <a href={`tel:${pet.owner.phone}`}>
                  {pet.owner.phone}
                </a>
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* Report Modal */}
      <Modal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        title="Reportar Problema"
        size="medium"
      >
        <div className={styles.reportModal}>
          <p>
            Se você encontrou algum problema com este anúncio, 
            por favor nos informe para que possamos tomar as medidas apropriadas.
          </p>
          
          <div className={styles.reportButtons}>
            <Button variant="outline">
              Informações incorretas
            </Button>
            <Button variant="outline">
              Conteúdo inapropriado
            </Button>
            <Button variant="outline">
              Possível golpe
            </Button>
            <Button variant="outline">
              Outro motivo
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}