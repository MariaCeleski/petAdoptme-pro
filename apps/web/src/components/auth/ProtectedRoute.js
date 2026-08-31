'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProtectedRoute({ 
  children, 
  allowedTypes = [], // ['ADOPTER', 'SHELTER_ADMIN', 'INDIVIDUAL_OWNER']
  redirectTo = '/auth/signin',
  loadingComponent = null 
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return; // Ainda carregando

    if (status === 'unauthenticated') {
      router.push(redirectTo);
      return;
    }

    if (session?.user && allowedTypes.length > 0) {
      if (!allowedTypes.includes(session.user.type)) {
        // Redirecionar baseado no tipo do usuário
        const redirectMap = {
          'ADOPTER': '/dashboard',
          'INDIVIDUAL_OWNER': '/dashboard',
          'SHELTER_ADMIN': '/admin',
        };
        router.push(redirectMap[session.user.type] || '/dashboard');
        return;
      }
    }
  }, [session, status, router, allowedTypes, redirectTo]);

  if (status === 'loading') {
    return loadingComponent || (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex items-center space-x-2">
          <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-gray-600">Carregando...</span>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null; // Será redirecionado
  }

  if (session?.user && allowedTypes.length > 0 && !allowedTypes.includes(session.user.type)) {
    return null; // Será redirecionado
  }

  return children;
}