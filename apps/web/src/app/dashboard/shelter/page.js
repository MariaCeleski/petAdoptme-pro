'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShelterForm } from '@/components/shelter';
import { ShelterStats } from '@/components/dashboard/ShelterStats';
import Button from '@/components/ui/Button/Button';
import Card from '@/components/ui/Card/Card';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton/LoadingSkeleton';
import styles from './page.module.css';

/**
 * Shelter Management Dashboard
 * URL: /dashboard/shelter
 * 
 * Allows SHELTER_ADMIN users to manage their shelter profile and view adoption stats
 * Displays:
 * - Shelter profile management
 * - Statistics (pets, adoptions, success rate)
 * - Recent adoption requests
 * - Links to related management pages
 * Validates Requirements: 11.1, 11.2, 11.4, 11.5
 */

export default function ShelterDashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [shelter, setShelter] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [recentPets, setRecentPets] = useState([]);
  const [adoptionRequests, setAdoptionRequests] = useState([]);

  useEffect(() => {
    // Redirect if not authenticated
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    // Redirect if not a shelter admin
    if (status === 'authenticated' && session?.user?.type !== 'SHELTER_ADMIN') {
      router.push('/dashboard');
      return;
    }

    // Fetch shelter data if authenticated
    if (status === 'authenticated' && session?.user?.id) {
      fetchShelter();
    }
  }, [status, session, router]);

  const fetchShelter = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // First, try to get the shelter for this admin
      const response = await fetch(`/api/shelters?adminId=${session.user.id}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.data && data.data.length > 0) {
          const shelterData = data.data[0];
          setShelter(shelterData);
          
          // Fetch stats for this shelter
          const statsResponse = await fetch(`/api/shelters/${shelterData.id}/stats`);
          if (statsResponse.ok) {
            const statsData = await statsResponse.json();
            setStats(statsData);
          }

          // Fetch recent pets for this shelter
          const petsResponse = await fetch(`/api/pets?shelterId=${shelterData.id}&limit=5`);
          if (petsResponse.ok) {
            const petsData = await petsResponse.json();
            setRecentPets(petsData.pets || []);
          }

          // Fetch adoption requests for pets in this shelter
          const adoptionsResponse = await fetch(`/api/adoptions?limit=10`);
          if (adoptionsResponse.ok) {
            const adoptionsData = await adoptionsResponse.json();
            setAdoptionRequests(adoptionsData.adoptions || []);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching shelter:', err);
      setError('Erro ao carregar dados do abrigo');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShelterSuccess = (result) => {
    setShelter(result);
    fetchShelter();
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className={styles.container}>
        <LoadingSkeleton height={400} />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>Gerenciamento do Abrigo</h1>
        <p className={styles.subtitle}>
          {shelter 
            ? `Abrigo: ${shelter.name}`
            : 'Crie e gerencie o perfil do seu abrigo'}
        </p>
      </div>

      {error && (
        <div className={styles.errorMessage}>
          {error}
        </div>
      )}

      {/* Navigation Tabs */}
      {shelter && (
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'overview' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Visão Geral
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'pets' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('pets')}
          >
            Pets ({recentPets.length})
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'adoptions' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('adoptions')}
          >
            Solicitações ({adoptionRequests.length})
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'profile' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            Perfil
          </button>
        </div>
      )}

      {/* Tab Content */}
      <div className={styles.tabContent}>
        {/* Overview Tab */}
        {activeTab === 'overview' && shelter && (
          <div className={styles.tabPane}>
            {/* Stats */}
            {stats && (
              <div className={styles.statsSection}>
                <h2 className={styles.sectionTitle}>Estatísticas do Abrigo</h2>
                <ShelterStats stats={stats} />
              </div>
            )}

            {/* Quick Links */}
            <div className={styles.quickLinksSection}>
              <h2 className={styles.sectionTitle}>Ações Rápidas</h2>
              <div className={styles.quickLinks}>
                <Link href="/dashboard/owner/pets" className={styles.quickLink}>
                  <div className={styles.quickLinkIcon}>📝</div>
                  <div className={styles.quickLinkContent}>
                    <h3 className={styles.quickLinkTitle}>Gerenciar Pets</h3>
                    <p className={styles.quickLinkDesc}>Adicione e edite pets do abrigo</p>
                  </div>
                </Link>
                <Link href="/dashboard/adoptions" className={styles.quickLink}>
                  <div className={styles.quickLinkIcon}>✓</div>
                  <div className={styles.quickLinkContent}>
                    <h3 className={styles.quickLinkTitle}>Solicitações de Adoção</h3>
                    <p className={styles.quickLinkDesc}>Aprove ou rejeite solicitações</p>
                  </div>
                </Link>
                <Link href={`/shelters/${shelter.id}`} className={styles.quickLink}>
                  <div className={styles.quickLinkIcon}>🌐</div>
                  <div className={styles.quickLinkContent}>
                    <h3 className={styles.quickLinkTitle}>Página Pública</h3>
                    <p className={styles.quickLinkDesc}>Visualize seu perfil público</p>
                  </div>
                </Link>
              </div>
            </div>

            {/* Recent Pets */}
            {recentPets.length > 0 && (
              <div className={styles.recentSection}>
                <h2 className={styles.sectionTitle}>Pets Recentes</h2>
                <div className={styles.petsList}>
                  {recentPets.map((pet) => (
                    <Link 
                      key={pet.id} 
                      href={`/pets/${pet.id}`}
                      className={styles.petListItem}
                    >
                      {pet.images?.[0] && (
                        <img 
                          src={pet.images[0]} 
                          alt={pet.name}
                          className={styles.petListImage}
                        />
                      )}
                      <div className={styles.petListInfo}>
                        <h4 className={styles.petListName}>{pet.name}</h4>
                        <p className={styles.petListBreed}>{pet.breed} • {pet.species}</p>
                        <span className={styles.petListStatus} data-status={pet.status.toLowerCase()}>
                          {pet.status === 'APPROVED' && 'Disponível'}
                          {pet.status === 'PENDING' && 'Com Solicitação'}
                          {pet.status === 'ADOPTED' && 'Adotado'}
                          {pet.status === 'UNAVAILABLE' && 'Indisponível'}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Pets Tab */}
        {activeTab === 'pets' && (
          <div className={styles.tabPane}>
            <div className={styles.emptyState}>
              <svg className={styles.emptyIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <p className={styles.emptyText}>Acesse o gerenciador de pets para adicionar e editar</p>
              <Link href="/dashboard/owner/pets" className={styles.emptyLink}>
                Ir para Gerenciador de Pets
              </Link>
            </div>
          </div>
        )}

        {/* Adoptions Tab */}
        {activeTab === 'adoptions' && (
          <div className={styles.tabPane}>
            {adoptionRequests.length === 0 ? (
              <div className={styles.emptyState}>
                <svg className={styles.emptyIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className={styles.emptyText}>Nenhuma solicitação de adoção no momento</p>
              </div>
            ) : (
              <div className={styles.adoptionsList}>
                {adoptionRequests.map((adoption) => (
                  <Link
                    key={adoption.id}
                    href={`/dashboard/adoptions?id=${adoption.id}`}
                    className={styles.adoptionItem}
                  >
                    <div className={styles.adoptionPetImage}>
                      {adoption.pet?.images?.[0] ? (
                        <img
                          src={adoption.pet.images[0]}
                          alt={adoption.pet?.name}
                          className={styles.adoptionImage}
                        />
                      ) : (
                        <div className={styles.adoptionImagePlaceholder}>📷</div>
                      )}
                    </div>
                    <div className={styles.adoptionInfo}>
                      <h4 className={styles.adoptionTitle}>
                        {adoption.pet?.name || 'Pet'} - {adoption.adopter?.name || 'Adotante'}
                      </h4>
                      <p className={styles.adoptionDate}>
                        Enviada em {new Date(adoption.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                      <span className={styles.adoptionStatus} data-status={adoption.status.toLowerCase()}>
                        {adoption.status === 'PENDING' && 'Aguardando'}
                        {adoption.status === 'APPROVED' && 'Aprovada'}
                        {adoption.status === 'REJECTED' && 'Rejeitada'}
                        {adoption.status === 'COMPLETED' && 'Completa'}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className={styles.tabPane}>
            <ShelterForm
              shelter={shelter}
              onSuccess={(result) => {
                setShelter(result);
                fetchShelter();
              }}
            />
          </div>
        )}
      </div>

      {/* Form Section - Only show if not already in tab */}
      {!shelter && (
        <div className={styles.formSection}>
          <h2 className={styles.formTitle}>Criar Perfil do Abrigo</h2>
          <ShelterForm
            shelter={null}
            onSuccess={handleShelterSuccess}
          />
        </div>
      )}
    </div>
  );
}
