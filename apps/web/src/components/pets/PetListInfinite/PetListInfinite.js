'use client';

import { useMemo, useCallback } from 'react';
import { usePetInfiniteScroll } from '@/hooks/useInfiniteScroll';
import PetCard from '@/components/pets/PetCard/PetCard';
import { Button, Card } from '@/components/ui';
import { ChevronDownIcon, AlertCircleIcon, WifiOffIcon } from 'lucide-react';
import styles from './PetListInfinite.module.css';
import { clsx } from 'clsx';

/**
 * PetListInfinite Component
 * 
 * Componente otimizado para listagem de pets com infinite scroll
 * Implementa carregamento incremental para melhorar performance
 * 
 * Features:
 * - Infinite scroll automático
 * - Carregamento incremental de dados
 * - Retry automático com backoff exponencial
 * - Indicadores de loading otimizados
 * - Estados de erro e vazio
 * - Responsivo em todos os dispositivos
 * 
 * Requirements: 16.3 (Infinite scroll and pagination optimization)
 */
export default function PetListInfinite({
  filters = {},
  apiEndpoint = '/api/pets',
  variant = 'grid', // 'grid' | 'list'
  onPetClick,
  onFavoriteToggle,
  favoritePetIds = [],
  pageSize = 12,
  className,
}) {
  
  // Infinite scroll hook com otimizações
  const {
    data: pets,
    pagination,
    isLoading,
    isLoadingMore,
    error,
    isEmpty,
    hasMore,
    canLoadMore,
    triggerRef,
    refresh,
  } = usePetInfiniteScroll({
    filters,
    apiEndpoint,
    pageSize,
    maxRetries: 3,
    retryDelay: 1000,
    enableAutoCleanup: true,
    maxItems: 500, // Manter máximo 500 pets em memória
    onError: (err) => {
      console.error('[PetListInfinite] Erro ao carregar:', err);
    },
  });

  /**
   * Memoize as favorites para evitar re-renders desnecessários
   */
  const favoritesSet = useMemo(
    () => new Set(favoritePetIds),
    [favoritePetIds]
  );

  /**
   * Handler para clique em um pet
   */
  const handlePetClick = useCallback((pet) => {
    onPetClick?.(pet);
  }, [onPetClick]);

  /**
   * Handler para favoritar
   */
  const handleFavorite = useCallback((pet, isFavorited) => {
    onFavoriteToggle?.(pet, isFavorited);
  }, [onFavoriteToggle]);

  /**
   * Renderizar lista de pets em grid ou list
   */
  const petItems = useMemo(() => {
    return pets.map((pet) => (
      <div
        key={pet.id}
        className={clsx(styles.petItem, {
          [styles.listVariant]: variant === 'list',
        })}
      >
        <PetCard
          pet={pet}
          onClick={() => handlePetClick(pet)}
          onFavoriteToggle={(isFavorited) => handleFavorite(pet, isFavorited)}
          isFavorited={favoritesSet.has(pet.id)}
          variant={variant}
        />
      </div>
    ));
  }, [pets, variant, favoritesSet, handlePetClick, handleFavorite]);

  /**
   * Renderizar loading skeletons
   */
  const loadingSkeletons = useMemo(() => {
    return Array.from({ length: 3 }).map((_, i) => (
      <div key={`skeleton-${i}`} className={styles.petItem}>
        <Card className={styles.skeletonCard}>
          <div className={styles.skeletonImage} />
          <div className={styles.skeletonContent}>
            <div className={styles.skeletonText} />
            <div className={styles.skeletonText} style={{ width: '70%' }} />
            <div className={styles.skeletonText} style={{ width: '50%' }} />
          </div>
        </Card>
      </div>
    ));
  }, []);

  // Estado de erro de rede
  if (error && error.includes('offline')) {
    return (
      <div className={clsx(styles.petListInfinite, className)}>
        <Card className={styles.errorCard}>
          <Card.Body className={styles.errorContent}>
            <WifiOffIcon size={32} className={styles.errorIcon} />
            <h3>Conexão perdida</h3>
            <p>Verifique sua conexão com a internet e tente novamente.</p>
            <Button onClick={refresh} variant="primary">
              Tentar novamente
            </Button>
          </Card.Body>
        </Card>
      </div>
    );
  }

  // Estado de erro genérico
  if (error && !isEmpty) {
    return (
      <div className={clsx(styles.petListInfinite, className)}>
        <Card className={styles.errorCard}>
          <Card.Body className={styles.errorContent}>
            <AlertCircleIcon size={32} className={styles.errorIcon} />
            <h3>Erro ao carregar pets</h3>
            <p>{error}</p>
            <Button onClick={refresh} variant="primary">
              Tentar novamente
            </Button>
          </Card.Body>
        </Card>
      </div>
    );
  }

  return (
    <div className={clsx(styles.petListInfinite, className)}>
      {/* Pets Grid/List */}
      <div className={clsx(styles.petGrid, {
        [styles.listLayout]: variant === 'list',
        [styles.gridLayout]: variant === 'grid',
      })}>
        {petItems}
        
        {/* Loading skeletons enquanto carrega mais */}
        {isLoadingMore && loadingSkeletons}
      </div>

      {/* Empty State */}
      {isEmpty && !isLoading && (
        <Card className={styles.emptyCard}>
          <Card.Body className={styles.emptyContent}>
            <h3>Nenhum pet encontrado</h3>
            <p>Que tal ajustar os filtros e tentar novamente?</p>
          </Card.Body>
        </Card>
      )}

      {/* Initial Loading */}
      {isLoading && pets.length === 0 && (
        <div className={styles.petGrid}>
          {loadingSkeletons}
        </div>
      )}

      {/* Infinite scroll trigger elemento */}
      {hasMore && !isEmpty && (
        <div ref={triggerRef} className={styles.trigger} />
      )}

      {/* Load more button (fallback para casos onde intersection não funciona) */}
      {hasMore && !isLoadingMore && !isLoading && pets.length > 0 && (
        <div className={styles.loadMoreContainer}>
          <Button
            onClick={() => {
              // Manualmente disparar loadMore se necessário
              triggerRef.current?.scrollIntoView({ behavior: 'smooth' });
            }}
            variant="outline"
            className={styles.loadMoreButton}
            disabled={isLoadingMore}
          >
            <ChevronDownIcon size={16} />
            Carregar mais
          </Button>
        </div>
      )}

      {/* Status message */}
      {pagination && pagination.total > 0 && (
        <div className={styles.statusMessage}>
          <small>
            Mostrando {Math.min(pets.length, pagination.total)} de {pagination.total} pets
          </small>
        </div>
      )}

      {/* Carregando mais indicator */}
      {isLoadingMore && (
        <div className={styles.loadingMoreIndicator}>
          <div className={styles.spinner} />
          <span>Carregando mais pets...</span>
        </div>
      )}

      {/* Fim da lista */}
      {!hasMore && pets.length > 0 && (
        <div className={styles.endMessage}>
          <p>Você chegou ao final da lista</p>
        </div>
      )}
    </div>
  );
}
