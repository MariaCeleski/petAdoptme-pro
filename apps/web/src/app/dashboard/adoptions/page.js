'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { AdoptionRequestList } from '@/components/adoption';
import { LoadingSkeleton } from '@/components/ui';
import styles from './page.module.css';

export default function AdoptionsPage() {
  const { data: session, status } = useSession();
  const [adoptions, setAdoptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Redirect if not authenticated
  if (status === 'unauthenticated') {
    redirect('/auth/signin');
  }

  // Redirect if not a pet owner
  if (status === 'authenticated' && session?.user?.type === 'ADOPTER') {
    redirect('/dashboard');
  }

  // Fetch adoption requests
  useEffect(() => {
    const fetchAdoptions = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch('/api/adoptions?limit=100', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Falha ao carregar solicitações de adoção');
        }

        const data = await response.json();
        setAdoptions(data.adoptions || []);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching adoptions:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (status === 'authenticated') {
      fetchAdoptions();
    }
  }, [status]);

  const handleRefresh = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/adoptions?limit=100', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Falha ao atualizar solicitações');
      }

      const data = await response.json();
      setAdoptions(data.adoptions || []);
    } catch (err) {
      setError(err.message);
      console.error('Error refreshing adoptions:', err);
    } finally {
      setIsLoading(false);
    }
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
              Solicitações de Adoção
            </h1>
            <p className={styles.pageSubtitle}>
              Gerencie as solicitações de adoção para seus pets
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

        <AdoptionRequestList
          adoptions={adoptions}
          isLoading={isLoading}
          onRefresh={handleRefresh}
          showStatusFilter={true}
          canApprove={true}
        />
      </div>
    </div>
  );
}
