'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

/**
 * Custom hook for managing URL state with query parameters
 * Enables users to bookmark/share searches with filters
 * Requirements: 4.7 (URL state management), 8.1 (search bookmarking)
 */
export function useURLState(initialState = {}, options = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const {
    shallow = true,           // Use shallow routing
    scroll = false,           // Disable scroll to top on navigation
    replace = false,          // Use replace instead of push
    encode = true,            // URL encode values
    debounce = 300           // Debounce URL updates (ms)
  } = options;

  // Parse current URL params into state
  const parseURLParams = useCallback(() => {
    const params = {};
    for (const [key, value] of searchParams.entries()) {
      if (value && value !== 'undefined' && value !== 'null') {
        // Try to parse as JSON for complex values, fallback to string
        try {
          params[key] = JSON.parse(decodeURIComponent(value));
        } catch {
          params[key] = decodeURIComponent(value);
        }
      }
    }
    return { ...initialState, ...params };
  }, [searchParams, initialState]);

  const [state, setState] = useState(parseURLParams);

  // Debounce timer ref
  const debounceRef = useRef(null);
  const prevSearchParamsRef = useRef(searchParams.toString());

  /**
   * Update URL with current state
   */
  const updateURL = useCallback((newState) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams();
      
      Object.entries(newState).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '' && 
            !(Array.isArray(value) && value.length === 0)) {
          
          let encodedValue = value;
          
          // Handle complex values (objects, arrays)
          if (typeof value === 'object') {
            encodedValue = JSON.stringify(value);
          }
          
          // URL encode if requested
          if (encode && typeof encodedValue === 'string') {
            encodedValue = encodeURIComponent(encodedValue);
          }
          
          params.set(key, encodedValue);
        }
      });

      const queryString = params.toString();
      const newURL = queryString ? `${pathname}?${queryString}` : pathname;
      
      if (replace) {
        router.replace(newURL, { shallow, scroll });
      } else {
        router.push(newURL, { shallow, scroll });
      }
    }, debounce);
  }, [pathname, router, shallow, scroll, replace, encode, debounce]);

  /**
   * Update state and URL
   */
  const updateState = useCallback((updates) => {
    const newState = typeof updates === 'function' 
      ? updates(state)
      : { ...state, ...updates };
    
    setState(newState);
    updateURL(newState);
  }, [state, updateURL]);

  /**
   * Set a single value
   */
  const setValue = useCallback((key, value) => {
    updateState({ [key]: value });
  }, [updateState]);

  /**
   * Remove a key from state and URL
   */
  const removeKey = useCallback((key) => {
    const newState = { ...state };
    delete newState[key];
    setState(newState);
    updateURL(newState);
  }, [state, updateURL]);

  /**
   * Clear all state (except initial state)
   */
  const clearState = useCallback(() => {
    setState(initialState);
    updateURL(initialState);
  }, [initialState, updateURL]);

  /**
   * Get query string for current state
   */
  const getQueryString = useCallback(() => {
    const params = new URLSearchParams();
    Object.entries(state).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        params.set(key, typeof value === 'object' ? JSON.stringify(value) : value);
      }
    });
    return params.toString();
  }, [state]);

  /**
   * Get shareable URL
   */
  const getShareableURL = useCallback(() => {
    const queryString = getQueryString();
    const baseURL = typeof window !== 'undefined' 
      ? window.location.origin 
      : '';
    return queryString 
      ? `${baseURL}${pathname}?${queryString}`
      : `${baseURL}${pathname}`;
  }, [pathname, getQueryString]);

  // Update state when URL changes (back/forward navigation)
  useEffect(() => {
    const currentSearchParamsStr = searchParams.toString();
    
    // Only update if search params actually changed
    if (currentSearchParamsStr !== prevSearchParamsRef.current) {
      prevSearchParamsRef.current = currentSearchParamsStr;
      const newState = parseURLParams();
      setState(newState);
    }
  }, [searchParams]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return {
    state,
    setState: updateState,
    setValue,
    removeKey,
    clearState,
    getQueryString,
    getShareableURL,
    
    // Helper getters
    hasFilters: Object.keys(state).some(key => 
      state[key] !== null && 
      state[key] !== undefined && 
      state[key] !== '' &&
      state[key] !== initialState[key]
    ),
    
    // Raw search params for server-side access
    searchParams
  };
}

/**
 * Specialized hook for pet catalog filters
 */
export function usePetFilters(initialFilters = {}) {
  const defaultFilters = {
    species: '',
    size: '',
    gender: '',
    location: '',
    search: '',
    page: 1,
    limit: 12
  };

  const urlState = useURLState(
    { ...defaultFilters, ...initialFilters },
    { 
      replace: true,  // Use replace to avoid cluttering browser history
      debounce: 500   // Longer debounce for search inputs
    }
  );

  /**
   * Apply filters (resets page to 1)
   */
  const applyFilters = useCallback((newFilters) => {
    urlState.setState({
      ...urlState.state,
      ...newFilters,
      page: 1  // Reset to first page when filters change
    });
  }, [urlState]);

  /**
   * Clear all filters
   */
  const clearFilters = useCallback(() => {
    urlState.setState(defaultFilters);
  }, [urlState, defaultFilters]);

  /**
   * Update page (for pagination)
   */
  const setPage = useCallback((page) => {
    urlState.setValue('page', page);
  }, [urlState]);

  /**
   * Update search term
   */
  const setSearch = useCallback((search) => {
    urlState.setState({
      ...urlState.state,
      search,
      page: 1  // Reset page on search
    });
  }, [urlState]);

  return {
    filters: urlState.state,
    applyFilters,
    clearFilters,
    setPage,
    setSearch,
    hasActiveFilters: urlState.hasFilters,
    getShareableURL: urlState.getShareableURL,
    
    // Individual filter setters
    setSpecies: (species) => applyFilters({ species }),
    setSize: (size) => applyFilters({ size }),
    setGender: (gender) => applyFilters({ gender }),
    setLocation: (location) => applyFilters({ location })
  };
}

export default useURLState;