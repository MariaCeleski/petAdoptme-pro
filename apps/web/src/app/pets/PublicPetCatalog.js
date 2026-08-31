'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { usePetFilters } from '@/hooks/useURLState';
import { usePetInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { PetList, PetFilters } from '@/components/pets';
import { Button, Card, LoadingSkeleton } from '@/components/ui';
import { 
  FilterIcon, 
  GridIcon, 
  ListIcon, 
  ShareIcon,
  BookmarkIcon,
  SlidersHorizontalIcon
} from 'lucide-react';
import styles from './PublicPetCatalog.module.css';
import { clsx } from 'clsx';

/**
 * PublicPetCatalog Client Component
 * Handles interactive filters, search, and pet browsing
 * Requirements: 4.1-4.9 (Complete public catalog functionality)
 */
export function PublicPetCatalog({
  initialPets = [],
  initialPagination = null,
  initialFilters = {},
  stats = {}
}) {
  const router = useRouter();
  const { data: session } = useSession();
  
  // URL state management for filters
  const {
    filters,
    applyFilters,
    clearFilters,
    setSearch,
    hasActiveFilters,
    getShareableURL
  } = usePetFilters(initialFilters);

  // UI state
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [favoritePetIds, setFavoritePetIds] = useState([]);

  // Infinite scroll for pets
  const {
    data: pets,
    pagination,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    isEmpty,
    refresh: refreshPets,
    triggerRef: loadMoreTriggerRef
  } = usePetInfiniteScroll({
    initialData: initialPets,
    initialPagination,
    filters,
    enabled: true
  });

  /**
   * Handle filter changes with real-time updates
   * Requirements: 4.7 (real-time filtering)
   */
  const handleFiltersChange = useCallback((newFilters) => {
    applyFilters(newFilters);
  }, [applyFilters]);

  /**
   * Handle search with debouncing
   * Requirements: 4.6 (text search), 4.7 (real-time search)
   */
  const handleSearch = useCallback((searchTerm) => {
    setSearch(searchTerm);
  }, [setSearch]);

  /**
   * Handle pet interest click
   * Navigate to pet details page
   */
  const handlePetInterest = useCallback((pet) => {
    router.push(`/pets/${pet.id}`);
  }, [router]);

  /**
   * Handle favorite toggle (requires authentication)
   */
  const handleFavoriteToggle = useCallback((pet, isFavorite) => {
    if (!session) {
      router.push('/auth/login');
      return;
    }

    // Toggle favorite in local state
    setFavoritePetIds(prev => {
      if (isFavorite) {
        return [...prev, pet.id];
      } else {
        return prev.filter(id => id !== pet.id);
      }
    });

    // TODO: Call API to persist favorite
    // This will be implemented in a later task
  }, [session, router]);

  /**
   * Handle share functionality
   */
  const handleShare = useCallback(async () => {
    const shareUrl = getShareableURL();
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Pets para Adoção',
          text: 'Veja estes pets incríveis disponíveis para adoção!',
          url: shareUrl
        });
      } catch (err) {
        // User cancelled share or share failed
        console.log('Share cancelled or failed:', err);
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(shareUrl);
        // TODO: Show toast notification
        alert('Link copiado para a área de transferência!');
      } catch (err) {
        console.error('Failed to copy to clipboard:', err);
        // Fallback: show URL in a modal or prompt
        prompt('Copie este link:', shareUrl);
      }
    }
  }, [getShareableURL]);

  /**
   * Handle view mode change
   */
  const handleViewModeChange = useCallback((mode) => {
    setViewMode(mode);
  }, []);

  /**
   * Handle clear all filters
   */
  const handleClearFilters = useCallback(() => {
    clearFilters();
  }, [clearFilters]);

  // Load favorites for authenticated users
  useEffect(() => {
    if (session) {
      // TODO: Load user favorites from API
      // This will be implemented in a later task
    }
  }, [session]);

  return (
    <div className={styles.publicCatalog}>
      {/* Catalog Header */}
      <div className={styles.catalogHeader}>
        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <h2 className={styles.catalogTitle}>
              {hasActiveFilters ? 'Resultados da busca' : 'Todos os pets'}
            </h2>
            
            {pagination && (
              <div className={styles.resultCount}>
                {pagination.total > 0 
                  ? `${pagination.total} pet${pagination.total !== 1 ? 's' : ''} encontrado${pagination.total !== 1 ? 's' : ''}`
                  : 'Nenhum pet encontrado'
                }
              </div>
            )}
          </div>

          <div className={styles.headerActions}>
            {/* View Mode Toggle */}
            <div className={styles.viewModeToggle}>
              <Button
                variant={viewMode === 'grid' ? 'primary' : 'outline'}
                size="small"
                onClick={() => handleViewModeChange('grid')}
                className={styles.viewModeButton}
              >
                <GridIcon size={16} />
                <span className={styles.viewModeText}>Grade</span>
              </Button>
              <Button
                variant={viewMode === 'list' ? 'primary' : 'outline'}
                size="small"
                onClick={() => handleViewModeChange('list')}
                className={styles.viewModeButton}
              >
                <ListIcon size={16} />
                <span className={styles.viewModeText}>Lista</span>
              </Button>
            </div>

            {/* Share Button */}
            <Button
              variant="outline"
              size="small"
              onClick={handleShare}
              className={styles.shareButton}
            >
              <ShareIcon size={16} />
              <span className="hidden sm:inline">Compartilhar</span>
            </Button>

            {/* Mobile Filters Toggle */}
            <Button
              variant="outline"
              size="small"
              onClick={() => setFiltersExpanded(!filtersExpanded)}
              className={clsx(styles.mobileFiltersToggle, {
                [styles.active]: filtersExpanded
              })}
            >
              <SlidersHorizontalIcon size={16} />
              {hasActiveFilters && <span className={styles.filterIndicator} />}
            </Button>
          </div>
        </div>

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className={styles.activeFiltersSummary}>
            <span className={styles.filtersLabel}>Filtros ativos:</span>
            <div className={styles.filtersPreview}>
              {filters.species && (
                <span className={styles.filterPreview}>
                  {filters.species === 'DOG' ? 'Cachorros' : 'Gatos'}
                </span>
              )}
              {filters.size && (
                <span className={styles.filterPreview}>
                  {filters.size === 'SMALL' ? 'Pequenos' : 
                   filters.size === 'MEDIUM' ? 'Médios' : 'Grandes'}
                </span>
              )}
              {filters.gender && (
                <span className={styles.filterPreview}>
                  {filters.gender === 'MALE' ? 'Machos' : 'Fêmeas'}
                </span>
              )}
              {filters.location && (
                <span className={styles.filterPreview}>📍 {filters.location}</span>
              )}
              {filters.search && (
                <span className={styles.filterPreview}>🔍 {filters.search}</span>
              )}
            </div>
            <Button
              variant="ghost"
              size="small"
              onClick={handleClearFilters}
              className={styles.clearAllButton}
            >
              Limpar todos
            </Button>
          </div>
        )}
      </div>

      {/* Filters Section */}
      <div className={clsx(styles.filtersSection, {
        [styles.expanded]: filtersExpanded
      })}>
        <Card>
          <Card.Body>
            <PetFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onSearch={handleSearch}
              isLoading={isLoading}
              resultCount={pagination?.total || 0}
              showResultCount={false} // We show it in header instead
              layout="horizontal"
              className={styles.petFilters}
            />
          </Card.Body>
        </Card>
      </div>

      {/* Pet List */}
      <div className={styles.petsSection}>
        {!error && (
          <PetList
            initialPets={pets}
            initialPagination={pagination}
            filters={filters}
            variant={viewMode}
            onInterestClick={handlePetInterest}
            onFavoriteToggle={session ? handleFavoriteToggle : undefined}
            favoritePetIds={favoritePetIds}
            enableInfiniteScroll={true}
            className={styles.petList}
          />
        )}
        
        {error && (
          <Card className={styles.errorCard}>
            <Card.Body className={styles.errorContent}>
              <div className={styles.errorIcon}>⚠️</div>
              <h3>{error.includes('timed out') ? 'Timeout na Busca' : 'Erro ao carregar pets'}</h3>
              <p>
                {error.includes('timed out') 
                  ? 'A requisição levou muito tempo. Verifique sua conexão e tente novamente.'
                  : error
                }
              </p>
              <Button onClick={refreshPets} variant="primary" className={styles.retryButton}>
                🔄 Tentar novamente
              </Button>
            </Card.Body>
          </Card>
        )}
      </div>

      {/* Stats Section (when no pets found) */}
      {isEmpty && !isLoading && !error && (
        <div className={styles.emptySection}>
          <Card>
            <Card.Body className={styles.emptyContent}>
              <h3>Nenhum pet encontrado</h3>
              <p>
                Não encontramos pets que correspondam aos filtros aplicados.
                Que tal tentar uma busca mais ampla?
              </p>
              
              {hasActiveFilters && (
                <Button
                  variant="primary"
                  onClick={handleClearFilters}
                  className={styles.clearFiltersButton}
                >
                  Ver todos os pets
                </Button>
              )}

              {stats.totalAvailable > 0 && (
                <div className={styles.suggestedStats}>
                  <p>Temos {stats.totalAvailable} pets esperando por um lar:</p>
                  <div className={styles.statsList}>
                    {stats.bySpecies.DOG && (
                      <Button
                        variant="outline"
                        onClick={() => applyFilters({ species: 'DOG' })}
                        className={styles.statButton}
                      >
                        {stats.bySpecies.DOG} Cachorros
                      </Button>
                    )}
                    {stats.bySpecies.CAT && (
                      <Button
                        variant="outline"
                        onClick={() => applyFilters({ species: 'CAT' })}
                        className={styles.statButton}
                      >
                        {stats.bySpecies.CAT} Gatos
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>
        </div>
      )}
    </div>
  );
}