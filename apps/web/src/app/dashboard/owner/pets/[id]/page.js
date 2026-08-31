'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import styles from './petDetails.module.css';

/**
 * Owner Pet Details Page
 * Displays complete pet information with adoption requests
 * Requirements: 2.1, 2.3, 2.6, 6.8
 */
export default function OwnerPetDetails() {
  const router = useRouter();
  const params = useParams();
  const { data: session } = useSession();
  const [pet, setPet] = useState(null);
  const [adoptions, setAdoptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageIndex, setImageIndex] = useState(0);

  // Fetch pet details
  useEffect(() => {
    if (!params.id || !session?.user?.id) return;

    const fetchPetAndAdoptions = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch pet details
        const petResponse = await fetch(`/api/pets/${params.id}`);
        if (!petResponse.ok) {
          throw new Error('Pet not found');
        }

        const petData = await petResponse.json();

        if (!petData.pet) {
          throw new Error('Pet data is missing');
        }

        // Check if user is the owner
        if (petData.pet.owner?.id !== session.user.id) {
          throw new Error('You do not have access to this pet');
        }

        setPet(petData.pet);

        // Fetch adoption requests for this pet
        try {
          const adoptionsResponse = await fetch(
            `/api/adoptions?petId=${params.id}&limit=100`
          );
          if (adoptionsResponse.ok) {
            const adoptionsData = await adoptionsResponse.json();
            setAdoptions(adoptionsData.adoptions || []);
          }
        } catch (err) {
          console.log('Could not fetch adoptions:', err);
        }
      } catch (err) {
        console.error('Error fetching pet details:', err);
        setError(err.message || 'Failed to load pet details');
      } finally {
        setLoading(false);
      }
    };

    fetchPetAndAdoptions();
  }, [params.id, session?.user?.id]);

  const handleArchivePet = async () => {
    if (!window.confirm('Tem certeza que deseja arquivar este pet? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/pets/${params.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error('Failed to archive pet');
      }

      router.push('/dashboard/owner?success=archived');
    } catch (error) {
      console.error('Error archiving pet:', error);
      setError(error.message || 'Failed to archive pet');
      setLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}>
          <div className={styles.spinner}></div>
          <p>Carregando detalhes do pet...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !pet) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorContent}>
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 9v2m0 4v2m0 0v1m0-1h-1m1 0h1" />
          </svg>
          <h2>Erro ao carregar pet</h2>
          <p>{error || 'O pet não foi encontrado'}</p>
          <Link href="/dashboard/owner" className={styles.backButton}>
            ← Voltar para Meus Pets
          </Link>
        </div>
      </div>
    );
  }

  const statusInfo = {
    PENDING: {
      icon: '⏳',
      label: 'Aguardando Aprovação',
      color: '#F59E0B',
      description: 'Seu pet está sendo analisado por nosso time. Você receberá um email quando for aprovado.'
    },
    APPROVED: {
      icon: '✅',
      label: 'Aprovado',
      color: '#10B981',
      description: 'Seu pet foi aprovado e já aparece no catálogo para adoção!'
    },
    ADOPTED: {
      icon: '🎉',
      label: 'Adotado',
      color: '#8B5CF6',
      description: 'Que alegria! Seu pet encontrou uma nova família.'
    },
    UNAVAILABLE: {
      icon: '📦',
      label: 'Arquivado',
      color: '#6B7280',
      description: 'Este pet foi arquivado.'
    }
  };

  const currentStatus = statusInfo[pet.status] || statusInfo.PENDING;

  return (
    <div className={styles.petDetailsPage}>
      {/* Header with back button */}
      <div className={styles.header}>
        <Link href="/dashboard/owner" className={styles.backLink}>
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Voltar para Meus Pets
        </Link>
        <div className={styles.headerActions}>
          <Link href={`/dashboard/owner/pets/${pet.id}/edit`} className={styles.editButton}>
            ✏️ Editar
          </Link>
          <button
            onClick={handleArchivePet}
            className={styles.archiveButton}
            disabled={loading}
          >
            {loading ? 'Arquivando...' : '📦 Arquivar'}
          </button>
        </div>
      </div>

      {/* Status Badge and Alert */}
      <div className={styles.statusSection}>
        <div className={styles.statusBadge} style={{ backgroundColor: currentStatus.color }}>
          <span className={styles.statusIcon}>{currentStatus.icon}</span>
          <span className={styles.statusLabel}>{currentStatus.label}</span>
        </div>
        {pet.status === 'PENDING' && (
          <div className={styles.infoAlert}>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>{currentStatus.description}</p>
          </div>
        )}
      </div>

      <div className={styles.contentGrid}>
        {/* Left Column - Images and Gallery */}
        <div className={styles.leftColumn}>
          {/* Main Image */}
          <div className={styles.mainImageContainer}>
            {pet.images && pet.images.length > 0 ? (
              <Image
                src={pet.images[imageIndex] || pet.images[0]}
                alt={pet.name}
                fill
                className={styles.mainImage}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const sibling = e.currentTarget.nextElementSibling;
                  if (sibling) sibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div className={styles.imagePlaceholder}>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>

          {/* Thumbnail Gallery */}
          {pet.images && pet.images.length > 1 && (
            <div className={styles.thumbnailGallery}>
              {pet.images.map((image, idx) => (
                <button
                  key={idx}
                  onClick={() => setImageIndex(idx)}
                  className={`${styles.thumbnail} ${imageIndex === idx ? styles.active : ''}`}
                >
                  <Image
                    src={image}
                    alt={`${pet.name} - foto ${idx + 1}`}
                    fill
                    className={styles.thumbnailImage}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column - Information */}
        <div className={styles.rightColumn}>
          {/* Pet Name and Breed */}
          <div className={styles.petHeader}>
            <h1 className={styles.petName}>{pet.name}</h1>
            <p className={styles.petBreed}>{pet.breed}</p>
          </div>

          {/* Info Sections */}
          <div className={styles.infoSection}>
            <h3 className={styles.sectionTitle}>Informações Básicas</h3>
            <div className={styles.infoGrid}>
              <InfoCard label="Espécie" value={pet.species === 'DOG' ? '🐕 Cão' : '🐱 Gato'} />
              <InfoCard label="Idade" value={pet.age} />
              <InfoCard label="Tamanho" value={
                pet.size === 'SMALL' ? 'Pequeno' :
                pet.size === 'MEDIUM' ? 'Médio' :
                pet.size === 'LARGE' ? 'Grande' :
                'Extra Grande'
              } />
              <InfoCard label="Gênero" value={pet.gender === 'MALE' ? '♂ Macho' : '♀ Fêmea'} />
              <InfoCard label="Cor" value={pet.color || 'Não informada'} />
              <InfoCard label="Localização" value={pet.location || 'Não informada'} />
            </div>
          </div>

          {/* Health Info */}
          <div className={styles.infoSection}>
            <h3 className={styles.sectionTitle}>Saúde</h3>
            <div className={styles.healthGrid}>
              <HealthItem
                label="Vacinado"
                value={pet.isVaccinated}
                icon="💉"
              />
              <HealthItem
                label="Castrado"
                value={pet.isNeutered}
                icon="♣"
              />
              {pet.microchip && (
                <HealthItem
                  label="Microchip"
                  value={pet.microchip}
                  icon="📍"
                />
              )}
            </div>
            {pet.healthStatus && (
              <div className={styles.healthStatus}>
                <p><strong>Status de Saúde:</strong> {pet.healthStatus}</p>
              </div>
            )}
          </div>

          {/* Personality */}
          {pet.personality && pet.personality.length > 0 && (
            <div className={styles.infoSection}>
              <h3 className={styles.sectionTitle}>Personalidade</h3>
              <div className={styles.traits}>
                {pet.personality.map((trait, idx) => (
                  <span key={idx} className={styles.trait}>{trait}</span>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          {pet.description && (
            <div className={styles.infoSection}>
              <h3 className={styles.sectionTitle}>Sobre {pet.name}</h3>
              <p className={styles.description}>{pet.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* Adoption Requests Section */}
      {pet.status === 'APPROVED' && (
        <div className={styles.adoptionRequestsSection}>
          <h2 className={styles.sectionTitle}>Solicitações de Adoção ({adoptions.length})</h2>

          {adoptions.length === 0 ? (
            <div className={styles.emptyRequests}>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              <p>Nenhuma solicitação de adoção recebida ainda.</p>
            </div>
          ) : (
            <div className={styles.requestsList}>
              {adoptions.map((adoption) => (
                <AdoptionRequestCard
                  key={adoption.id}
                  adoption={adoption}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Additional Info */}
      {(pet.compatibilityChildren || pet.compatibilityAnimals) && (
        <div className={styles.compatibilitySection}>
          <h3 className={styles.sectionTitle}>Compatibilidade</h3>
          <div className={styles.compatibilityGrid}>
            {pet.compatibilityChildren && (
              <CompatibilityItem
                label="Com Crianças"
                value={pet.compatibilityChildren}
              />
            )}
            {pet.compatibilityAnimals && (
              <CompatibilityItem
                label="Com Outros Animais"
                value={pet.compatibilityAnimals}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Info Card Component
 */
function InfoCard({ label, value }) {
  return (
    <div className={styles.infoCard}>
      <p className={styles.infoLabel}>{label}</p>
      <p className={styles.infoValue}>{value}</p>
    </div>
  );
}

/**
 * Health Item Component
 */
function HealthItem({ label, value, icon }) {
  return (
    <div className={`${styles.healthItem} ${value ? styles.active : ''}`}>
      <span className={styles.icon}>{icon}</span>
      <span className={styles.label}>{label}</span>
      <span className={styles.status}>{value ? '✓' : '✗'}</span>
    </div>
  );
}

/**
 * Adoption Request Card Component
 */
function AdoptionRequestCard({ adoption }) {
  const getStatusColor = (status) => {
    const colors = {
      PENDING: '#F59E0B',
      APPROVED: '#10B981',
      REJECTED: '#EF4444',
      COMPLETED: '#8B5CF6'
    };
    return colors[status] || '#6B7280';
  };

  return (
    <div className={styles.requestCard}>
      <div className={styles.requestHeader}>
        <div>
          <h4 className={styles.requestTitle}>{adoption.adopter?.name || 'Adotante'}</h4>
          <p className={styles.requestEmail}>{adoption.adopter?.email}</p>
        </div>
        <div
          className={styles.requestStatus}
          style={{ backgroundColor: getStatusColor(adoption.status) }}
        >
          {adoption.status === 'PENDING' && '⏳ Pendente'}
          {adoption.status === 'APPROVED' && '✅ Aprovada'}
          {adoption.status === 'REJECTED' && '❌ Rejeitada'}
          {adoption.status === 'COMPLETED' && '🎉 Completa'}
        </div>
      </div>

      {adoption.message && (
        <p className={styles.requestMessage}>{adoption.message}</p>
      )}

      {adoption.status === 'PENDING' && (
        <div className={styles.requestActions}>
          <button className={styles.approveBtn}>Aprovar</button>
          <button className={styles.rejectBtn}>Rejeitar</button>
        </div>
      )}
    </div>
  );
}

/**
 * Compatibility Item Component
 */
function CompatibilityItem({ label, value }) {
  const getColor = (val) => {
    if (val === 'SIM' || val === true) return '#10B981';
    if (val === 'NÃO' || val === false) return '#EF4444';
    return '#F59E0B';
  };

  return (
    <div className={styles.compatibilityItem}>
      <p className={styles.compatLabel}>{label}</p>
      <span
        className={styles.compatValue}
        style={{ backgroundColor: getColor(value) }}
      >
        {value === 'SIM' || value === true ? '✓ Sim' :
         value === 'NÃO' || value === false ? '✗ Não' :
         'Talvez'}
      </span>
    </div>
  );
}
