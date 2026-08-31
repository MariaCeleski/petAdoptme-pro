'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { AdoptionRequestList, FavoritePetCard } from '@/components/adoption';
import { LoadingSkeleton } from '@/components/ui';
import { AdoptionStats } from '@/components/dashboard/AdoptionStats';
import { ActivityHistory } from '@/components/dashboard/ActivityHistory';
import { EmailPreferences } from '@/components/dashboard/EmailPreferences';
import { SavedSearches } from '@/components/dashboard/SavedSearches';
import styles from './page.module.css';

/**
 * Adopter Dashboard Page
 * Displays:
 * - Favorite pets
 * - Adoption requests with status and filtering
 * - Activity/adoption history
 * - Email preferences
 * - Statistics
 * Requirements: 7.1 (display favorite pets and adoption requests), 7.5 (adoption history)
 */
export default function AdopterDashboardPage() {
  const { data: session, status } = useSession();
  const [adoptions, setAdoptions] = useState([]);
  const [favoritePets, setFavoritePets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Redirect if not authenticated
  if (status === 'unauthenticated') {
    redirect('/auth/signin');
  }

  // Redirect if not an adopter
  if (status === 'authenticated' && session?.user?.type !== 'ADOPTER') {
    redirect('/dashboard');
  }

  // Fetch adoption requests and favorite pets for adopter
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch adoptions
        const adoptionsResponse = await fetch('/api/adoptions?limit=50', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!adoptionsResponse.ok) {
          throw new Error('Falha ao carregar solicitações de adoção');
        }

        const adoptionsData = await adoptionsResponse.json();
        setAdoptions(adoptionsData.adoptions || []);

        // Try to fetch favorite pets from localStorage
        const savedFavorites = localStorage.getItem('favoritePets');
        if (savedFavorites) {
          try {
            const favoriteIds = JSON.parse(savedFavorites);
            if (Array.isArray(favoriteIds) && favoriteIds.length > 0) {
              // Fetch details for favorite pets
              const favoritesResponse = await fetch(
                `/api/pets?ids=${favoriteIds.join(',')}`,
                {
                  method: 'GET',
                  headers: {
                    'Content-Type': 'application/json'
                  }
                }
              );
              if (favoritesResponse.ok) {
                const favoritesData = await favoritesResponse.json();
                setFavoritePets(favoritesData.pets || []);
              }
            }
          } catch (err) {
            console.error('Error parsing favorites:', err);
          }
        }
      } catch (err) {
        setError(err.message);
        console.error('Error fetching data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (status === 'authenticated') {
      fetchData();
    }
  }, [status]);

  // Calculate adoption statistics
  const stats = {
    total: adoptions.length,
    pending: adoptions.filter(a => a.status === 'PENDING').length,
    approved: adoptions.filter(a => a.status === 'APPROVED').length,
    completed: adoptions.filter(a => a.status === 'COMPLETED').length,
    rejected: adoptions.filter(a => a.status === 'REJECTED').length
  };

  // Filter adoptions by status
  const filteredAdoptions = statusFilter === 'ALL' 
    ? adoptions 
    : adoptions.filter(a => a.status === statusFilter);

  const handleUnfavoritePet = (petId) => {
    setFavoritePets(prev => prev.filter(p => p.id !== petId));
    const savedFavorites = localStorage.getItem('favoritePets');
    if (savedFavorites) {
      const favoriteIds = JSON.parse(savedFavorites).filter(id => id !== petId);
      localStorage.setItem('favoritePets', JSON.stringify(favoriteIds));
    }
  };

  const handleAdoptPet = (petId) => {
    window.location.href = `/pets/${petId}?action=adopt`;
  };

  if (status === 'loading') {
    return (
      <div className={styles.page}>
        <div className={styles.skeleton}>
          <LoadingSkeleton height="40px" width="300px" marginBottom="2rem" />
          <LoadingSkeleton height="300px" marginBottom="1.5rem" />
          <LoadingSkeleton height="300px" marginBottom="1.5rem" />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.pageTitle}>
              Meu Dashboard
            </h1>
            <p className={styles.pageSubtitle}>
              Acompanhe suas solicitações de adoção e preferências
            </p>
          </div>
        </div>

        {error && (
          <div className={styles.errorAlert}>
            <svg className={styles.errorIcon} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div>
              <strong>Erro ao carregar solicitações:</strong>
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className={styles.statsGrid}>
          <AdoptionStats stats={stats} />
        </div>

        {/* Navigation Tabs */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'overview' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Visão Geral
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'favorites' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('favorites')}
          >
            Favoritos ({favoritePets.length})
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'requests' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('requests')}
          >
            Solicitações ({adoptions.length})
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'activity' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('activity')}
          >
            Histórico
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'preferences' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('preferences')}
          >
            Preferências
          </button>
        </div>

        {/* Tab Content */}
        <div className={styles.tabContent}>
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className={styles.tabPane}>
              <div className={styles.twoColumnLayout}>
                <div className={styles.column}>
                  <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>Minhas Solicitações Recentes</h2>
                    {adoptions.length === 0 ? (
                      <div className={styles.emptyState}>
                        <svg className={styles.emptyIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className={styles.emptyText}>Você ainda não tem solicitações de adoção</p>
                        <a href="/pets" className={styles.emptyLink}>Buscar Pets</a>
                      </div>
                    ) : (
                      <div className={styles.adoptionsList}>
                        {adoptions.slice(0, 3).map((adoption) => (
                          <div key={adoption.id} className={styles.adoptionCard}>
                            <div className={styles.petImage}>
                              {adoption.pet?.images?.[0] ? (
                                <img
                                  src={adoption.pet.images[0]}
                                  alt={adoption.pet.name}
                                  className={styles.petImageImg}
                                />
                              ) : (
                                <div className={styles.petImagePlaceholder}>
                                  <svg fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" />
                                  </svg>
                                </div>
                              )}
                            </div>
                            <div className={styles.adoptionInfo}>
                              <h3 className={styles.petName}>{adoption.pet?.name}</h3>
                              <p className={styles.petBreed}>{adoption.pet?.breed} • {adoption.pet?.species}</p>
                              <div className={styles.statusBadge} data-status={adoption.status.toLowerCase()}>
                                {adoption.status === 'PENDING' && 'Aguardando'}
                                {adoption.status === 'APPROVED' && 'Aprovado'}
                                {adoption.status === 'REJECTED' && 'Rejeitado'}
                                {adoption.status === 'COMPLETED' && 'Completo'}
                                {adoption.status === 'CANCELLED' && 'Cancelado'}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className={styles.column}>
                  <SavedSearches />
                </div>
              </div>
            </div>
          )}

          {/* Requests Tab */}
          {activeTab === 'requests' && (
            <div className={styles.tabPane}>
              <div className={styles.filterContainer}>
                <label htmlFor="statusFilter" className={styles.filterLabel}>
                  Filtrar por Status:
                </label>
                <select
                  id="statusFilter"
                  className={styles.filterSelect}
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="ALL">Todas as Solicitações</option>
                  <option value="PENDING">Aguardando ({adoptions.filter(a => a.status === 'PENDING').length})</option>
                  <option value="APPROVED">Aprovadas ({adoptions.filter(a => a.status === 'APPROVED').length})</option>
                  <option value="COMPLETED">Completas ({adoptions.filter(a => a.status === 'COMPLETED').length})</option>
                  <option value="REJECTED">Rejeitadas ({adoptions.filter(a => a.status === 'REJECTED').length})</option>
                  <option value="CANCELLED">Canceladas ({adoptions.filter(a => a.status === 'CANCELLED').length})</option>
                </select>
              </div>
              <AdoptionRequestList
                adoptions={filteredAdoptions}
                isLoading={isLoading}
                showStatusFilter={false}
                canApprove={false}
                userType="ADOPTER"
              />
            </div>
          )}

          {/* Favorites Tab */}
          {activeTab === 'favorites' && (
            <div className={styles.tabPane}>
              {favoritePets.length === 0 ? (
                <div className={styles.emptyState}>
                  <svg className={styles.emptyIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <p className={styles.emptyText}>Você ainda não tem pets favoritados</p>
                  <Link href="/pets" className={styles.emptyLink}>Explorar Pets</Link>
                </div>
              ) : (
                <div className={styles.favoritesGrid}>
                  {favoritePets.map((pet) => (
                    <FavoritePetCard
                      key={pet.id}
                      pet={pet}
                      onUnfavorite={handleUnfavoritePet}
                      onAdoptClick={() => handleAdoptPet(pet.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Activity Tab */}
          {activeTab === 'activity' && (
            <div className={styles.tabPane}>
              <ActivityHistory adoptions={adoptions} />
            </div>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <div className={styles.tabPane}>
              <EmailPreferences />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
