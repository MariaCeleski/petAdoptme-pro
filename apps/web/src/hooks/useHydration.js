'use client';

import { useEffect, useState } from 'react';

/**
 * Hook para detectar se o componente foi hidratado no cliente
 * Útil para evitar erros de hidratação em componentes com estado dinâmico
 */
export function useHydration() {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return isHydrated;
}

/**
 * Hook para valores que podem diferir entre servidor e cliente
 * Retorna o valor padrão no servidor e o valor real após hidratação
 */
export function useSafeValue(value, defaultValue = null) {
  const isHydrated = useHydration();
  
  return isHydrated ? value : defaultValue;
}

/**
 * Hook para estados booleanos que devem ser falsos no servidor
 */
export function useSafeBoolean(value) {
  return useSafeValue(value, false);
}