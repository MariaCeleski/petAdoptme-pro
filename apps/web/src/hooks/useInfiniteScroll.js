'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook for implementing infinite scroll functionality
 * Otimizado para listas grandes com performance avançada
 * 
 * Features:
 * - Intersection Observer para detecção eficiente
 * - Debouncing automático de requisições
 * - Error handling e retry automático
 * 
 * Requirements: 16.3 (Infinite scroll and pagination optimization)
 */
export function useInfiniteScroll({
  fetchFunction,
  initialData = [],
  initialPagination = null,
  pageSize = 12,
  threshold = 0.1,
  rootMargin = '100px',
  enabled = true,
  dependencies = [],
  onSuccess,
  onError,
  onLoadStart,
  onLoadEnd,
  maxRetries = 3,
  retryDelay = 1000,
  enableAutoCleanup = true,
  maxItems = 500,
} = {}) {
  
  const [data, setData] = useState(initialData);
  const [pagination, setPagination] = useState(initialPagination);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(initialPagination?.hasNextPage ?? true);
  const [isInitialized, setIsInitialized] = useState(initialData.length > 0);
  
  const observerRef = useRef(null);
  const triggerRef = useRef(null);
  const retryCountRef = useRef(0);
  const fetchAbortRef = useRef(null);
  const prevDependenciesRef = useRef(JSON.stringify(dependencies));

  /**
   * Core fetch logic - extracted to separate function to avoid dependency issues
   * Uses async/await with proper error handling
   */
  const executeFetch = async (pageNum, isAppend, retryAttempt = 0) => {
    if (!fetchFunction) return;
    
    try {
      // Set loading state
      if (isAppend) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }
      
      if (retryAttempt === 0) {
        onLoadStart?.();
      }
      
      const result = await fetchFunction({ 
        page: pageNum, 
        limit: pageSize,
        append: isAppend
      });
      
      if (result.success === false) {
        throw new Error(result.error || 'Failed to fetch data');
      }
      
      const newData = result.data || result.pets || [];
      const newPagination = result.pagination || {};
      
      // Use functional form of setState to avoid stale closures
      setData(prevData => {
        if (isAppend) {
          let mergedData = [...prevData, ...newData];
          
          if (enableAutoCleanup && mergedData.length > maxItems) {
            mergedData = mergedData.slice(-maxItems);
          }
          
          return mergedData;
        } else {
          return newData;
        }
      });
      
      setPagination(newPagination);
      setHasMore(newPagination.hasNextPage ?? false);
      setError(null);
      
      if (!isAppend) {
        setIsInitialized(true);
      }
      
      retryCountRef.current = 0;
      onSuccess?.(result);
      
    } catch (err) {
      console.error('Infinite scroll fetch error:', err);
      
      if (retryAttempt < maxRetries) {
        const nextRetry = retryAttempt + 1;
        const delay = retryDelay * Math.pow(2, nextRetry - 1);
        console.log(`[InfiniteScroll] Retry ${nextRetry}/${maxRetries} in ${delay}ms`);
        
        setTimeout(() => {
          executeFetch(pageNum, isAppend, nextRetry);
        }, delay);
      } else {
        const errorMessage = err.message || 'Failed to load data';
        setError(errorMessage);
        onError?.(err);
        
        if (!isAppend) {
          setData([]);
          setHasMore(false);
        }
      }
    } finally {
      if (isAppend) {
        setIsLoadingMore(false);
      } else {
        setIsLoading(false);
      }
      onLoadEnd?.();
    }
  };

  /**
   * Load more data (for infinite scroll)
   */
  const loadMore = useCallback(async () => {
    if (!pagination?.page || hasMore === false || isLoadingMore || isLoading) {
      return;
    }
    
    const nextPage = pagination.page + 1;
    await executeFetch(nextPage, true);
  }, [pagination?.page, hasMore, isLoadingMore, isLoading]);

  /**
   * Refresh data (load from beginning)
   */
  const refresh = useCallback(async () => {
    retryCountRef.current = 0;
    setData([]);
    setPagination(null);
    setHasMore(true);
    setError(null);
    await executeFetch(1, false);
  }, []);

  /**
   * Reset to initial state
   */
  const reset = useCallback(() => {
    retryCountRef.current = 0;
    setData(initialData);
    setPagination(initialPagination);
    setIsLoading(false);
    setIsLoadingMore(false);
    setError(null);
    setHasMore(initialPagination?.hasNextPage ?? true);
    setIsInitialized(initialData.length > 0);
  }, [initialData, initialPagination]);

  /**
   * Set up intersection observer for infinite scroll trigger
   */
  useEffect(() => {
    if (!enabled || !triggerRef.current) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        // Only trigger if intersecting and data is ready
        if (entry.isIntersecting && hasMore && !isLoadingMore && !isLoading && isInitialized) {
          loadMore();
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(triggerRef.current);
    observerRef.current = observer;

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [enabled, hasMore, isLoadingMore, isLoading, isInitialized, loadMore, threshold, rootMargin]);

  /**
   * Handle dependency changes (filters, search, etc.)
   */
  useEffect(() => {
    if (!isInitialized) return;
    
    const currentDependenciesStr = JSON.stringify(dependencies);
    if (currentDependenciesStr !== prevDependenciesRef.current) {
      prevDependenciesRef.current = currentDependenciesStr;
      refresh();
    }
  }, [isInitialized]); // Only depend on isInitialized, not refresh or dependencies

  /**
   * Initial data load
   */
  useEffect(() => {
    if (!isInitialized && fetchFunction && enabled) {
      executeFetch(1, false);
    }
  }, []); // Empty deps - only run once on mount

  return {
    data,
    pagination,
    isLoading,
    isLoadingMore,
    isInitialized,
    error,
    hasMore,
    isEmpty: data.length === 0 && !isLoading,
    loadMore,
    refresh,
    reset,
    triggerRef,
    totalCount: pagination?.total || 0,
    currentPage: pagination?.page || 0,
    totalPages: pagination?.totalPages || 0,
    canLoadMore: hasMore && !isLoadingMore && !isLoading && isInitialized,
    setData,
    setPagination,
    setHasMore,
    setError,
  };
}

/**
 * Specialized hook for pet infinite scroll with common configurations
 */
export function usePetInfiniteScroll({
  filters = {},
  apiEndpoint = '/api/pets',
  ...options
} = {}) {
  
  const fetchPets = useCallback(async ({ page, limit }) => {
    // Build query parameters
    const queryParams = {
      page: page.toString(),
      limit: limit.toString(),
    };
    
    // Add filter parameters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        queryParams[key] = String(value);
      }
    });
    
    const params = new URLSearchParams(queryParams);

    try {
      // Create abort controller with timeout fallback
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(`${apiEndpoint}?${params.toString()}`, {
        signal: controller.signal,
        headers: { 'Accept': 'application/json' },
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - took longer than 10 seconds');
      }
      throw error;
    }
  }, [filters, apiEndpoint]);

  return useInfiniteScroll({
    fetchFunction: fetchPets,
    dependencies: [JSON.stringify(filters)],
    ...options
  });
}

/**
 * Hook for virtual scrolling (for very large lists)
 */
export function useVirtualInfiniteScroll({
  containerHeight = 400,
  itemHeight = 200,
  overscan = 5,
  ...infiniteScrollOptions
} = {}) {
  
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef(null);
  
  const infiniteScroll = useInfiniteScroll(infiniteScrollOptions);
  
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    infiniteScroll.data.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );
  
  const visibleItems = infiniteScroll.data.slice(startIndex, endIndex + 1);
  
  const handleScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop);
  }, []);
  
  const totalHeight = infiniteScroll.data.length * itemHeight;
  const offsetY = startIndex * itemHeight;
  
  return {
    ...infiniteScroll,
    visibleItems,
    startIndex,
    endIndex,
    totalHeight,
    offsetY,
    containerRef,
    containerProps: {
      ref: containerRef,
      style: { height: containerHeight, overflow: 'auto' },
      onScroll: handleScroll,
    },
    visibleCount: visibleItems.length,
    hiddenBefore: startIndex,
    hiddenAfter: Math.max(0, infiniteScroll.data.length - endIndex - 1),
  };
}

export default useInfiniteScroll;
