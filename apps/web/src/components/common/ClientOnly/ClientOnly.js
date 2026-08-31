'use client';

import { useEffect, useState } from 'react';

/**
 * Componente que garante renderização apenas no cliente
 * Previne erros de hidratação quando há diferenças servidor/cliente
 */
export default function ClientOnly({ children, fallback = null }) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return fallback;
  }

  return children;
}