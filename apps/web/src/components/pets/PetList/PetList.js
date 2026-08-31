'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { usePetInfiniteScroll } from '@/hooks';
import { PetCard } from '@/components/pets';
import { Button, LoadingSkeleton } from '@/components/ui';
import { 
  RefreshCwIcon, 
  FilterIcon,
  SlidersHorizontalIcon,
  AlertCircleIcon 
} from 'lucide-react';
import styles from './PetList.module.css';
import { clsx } from 'clsx';

export default function PetList({ 
  initialPets = [],
  initialPagination = null,
  filters = {},
  variant = 'grid', // 'grid' | 'list' | 'masonry'
  showFilters = false,
  onInterestClick,
  onFavoriteToggle,
  favoritePetIds = [],
  className,
  enableInfiniteScroll = true,
  pageSize = 12,
  apiEndpoint = '/api/pets'
}) {
  const router = useRouter();
  const { data: session } = useSession();
  
  // Use the specialized pet infinite scroll hook
  const {
    data: pets,
    pagination,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    isEmpty,
    refresh: refreshPets,
    triggerRef: loadMoreTriggerRef,
    canLoadMore
  } = usePetInfiniteScroll({
    initialData: initialPets,
    initialPagination,
    filters,
    pageSize,
    apiEndpoint,
    enabled: enableInfiniteScroll
  });

  // Handle pet interest click
  const handleInterestClick = useCallback((pet) => {
    if (onInterestClick) {
      onInterestClick(pet);
    } else {
      // Default behavior - navigate to pet details
      router.push(`/pets/${pet.id}`);
    }
  }, [onInterestClick, router]);

  // Handle favorite toggle
  const handleFavoriteToggle = useCallback((pet, isFavorite) => {
    if (onFavoriteToggle) {
      onFavoriteToggle(pet, isFavorite);
    }
  }, [onFavoriteToggle]);

  // Check if pet is favorite
  const isPetFavorite = useCallback((petId) => {
    return favoritePetIds.includes(petId);
  }, [favoritePetIds]);

  // Render empty state
  const renderEmptyState = () => (
    <div className={styles.emptyState}>
      <div className={styles.emptyStateContent}>
        <AlertCircleIcon size={48} />
        <h3>Nenhum pet encontrado</h3>
        <p>
          Não encontramos pets que correspondam aos filtros aplicados. 
          Tente ajustar os critérios de busca.
        </p>
        <Button 
          variant="outline" 
          onClick={refreshPets}
          className={styles.refreshButton}
        >
          <RefreshCwIcon size={16} />
          Tentar novamente
        </Button>
      </div>
    </div>
  );

  // Render error state
  const renderErrorState = () => (
    <div className={styles.errorState}>
      <div className={styles.errorStateContent}>
        <AlertCircleIcon size={48} />
        <h3>Erro ao carregar pets</h3>
        <p>{error}</p>
        <Button 
          variant="primary" 
          onClick={refreshPets}
          className={styles.refreshButton}
        >
          <RefreshCwIcon size={16} />
          Tentar novamente
        </Button>
      </div>
    </div>
  );

  // Render loading skeletons
  const renderLoadingSkeletons = (count = pageSize) => (
    <div className={clsx(styles.petsGrid, styles[variant])}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={`skeleton-${index}`} className={styles.skeletonCard}>
          <LoadingSkeleton 
            height="200px"
            className={styles.skeletonImage}
          />
          <div className={styles.skeletonContent}>
            <LoadingSkeleton 
              height="24px" 
              width="70%"
              className={styles.skeletonTitle}
            />
            <LoadingSkeleton 
              height="16px" 
              width="50%"
              className={styles.skeletonMeta}
            />
            <LoadingSkeleton 
              height="32px" 
              width="100%"
              className={styles.skeletonButton}
            />
          </div>
        </div>
      ))}
    </div>
  );

  // Show loading state for initial load
  if (isLoading && pets.length === 0) {
    return (
      <div className={clsx(styles.petList, className)}>
        {renderLoadingSkeletons()}
      </div>
    );
  }

  // Show error state
  if (error && pets.length === 0) {
    return (
      <div className={clsx(styles.petList, className)}>
        {renderErrorState()}
      </div>
    );
  }

  // Show empty state
  if (isEmpty) {
    return (
      <div className={clsx(styles.petList, className)}>
        {renderEmptyState()}
      </div>
    );
  }

  return (
    <div className={clsx(styles.petList, className)}>
      {/* List Header */}
      <div className={styles.listHeader}>
        <div className={styles.listInfo}>
          <h2 className={styles.listTitle}>
            {pagination?.total 
              ? `${pagination.total} pet${pagination.total !== 1 ? 's' : ''} encontrado${pagination.total !== 1 ? 's' : ''}`
              : 'Pets disponíveis'
            }
          </h2>
          
          {pagination && (
            <span className={styles.listMeta}>
              Página {pagination.page} de {pagination.totalPages}
            </span>
          )}
        </div>

        <div className={styles.listActions}>
          {showFilters && (
            <Button
              variant="outline"
              size="medium"
              className={styles.filtersButton}
            >
              <FilterIcon size={16} />
              Filtros
            </Button>
          )}

          <Button
            variant="outline"
            size="medium"
            onClick={refreshPets}
            disabled={isLoading}
            className={styles.refreshButton}
          >
            <RefreshCwIcon size={16} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Pets Grid */}
      <div className={clsx(styles.petsGrid, styles[variant])}>
        {pets.map((pet) => (
          <PetCard
            key={pet.id}
            pet={pet}
            onInterestClick={handleInterestClick}
            onFavoriteToggle={session ? handleFavoriteToggle : undefined}
            isFavorite={isPetFavorite(pet.id)}
            variant={variant === 'list' ? 'compact' : 'default'}
            className={styles.petCard}
          />
        ))}
      </div>

      {/* Loading More Indicator */}
      {isLoadingMore && (
        <div className={styles.loadingMore}>
          {renderLoadingSkeletons(4)}
        </div>
      )}

      {/* Infinite Scroll Trigger */}
      {enableInfiniteScroll && canLoadMore && (
        <div 
          ref={loadMoreTriggerRef}
          className={styles.infiniteScrollTrigger}
        />
      )}

      {/* Load More Button (fallback) */}
      {!enableInfiniteScroll && hasMore && (
        <div className={styles.loadMoreSection}>
          <Button
            variant="outline"
            size="large"
            onClick={refreshPets} // This will be handled by the hook
            disabled={isLoadingMore}
            loading={isLoadingMore}
            className={styles.loadMoreButton}
          >
            Carregar mais pets
          </Button>
        </div>
      )}

      {/* End of List */}
      {!hasMore && pets.length > 0 && (
        <div className={styles.endOfList}>
          <p>Você viu todos os pets disponíveis</p>
        </div>
      )}
    </div>
  );
}

// Preset variants
PetList.Grid = function PetListGrid(props) {
  return <PetList {...props} variant="grid" />;
};

PetList.List = function PetListList(props) {
  return <PetList {...props} variant="list" />;
};

PetList.Masonry = function PetListMasonry(props) {
  return <PetList {...props} variant="masonry" />;
};

PetList.Infinite = function PetListInfinite(props) {
  return <PetList {...props} enableInfiniteScroll={true} />;
};