'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ProtectedRoute({ children, requiredUserTypes = null }) {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const [isAuthed, setIsAuthed] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          console.warn('⚠️ Nenhum token encontrado - redirecionando para login');
          setIsAuthed(false);
          return;
        }
        console.log('✅ Token encontrado');
        setIsAuthed(true);
      } catch (error) {
        console.error('Erro ao verificar token:', error);
        setIsAuthed(false);
      } finally {
        setIsReady(true);
      }
    };

    // Executar verificação após renderização
    setTimeout(checkAuth, 0);
  }, []);

  useEffect(() => {
    if (isReady && !isAuthed) {
      router.push('/auth/signin');
    }
  }, [isReady, isAuthed, router]);

  if (!isReady) {
    return <div>Verificando...</div>;
  }

  if (!isAuthed) {
    return null;
  }

  return children;
}
