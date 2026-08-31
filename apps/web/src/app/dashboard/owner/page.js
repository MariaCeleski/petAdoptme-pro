'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { StatsCard } from '@/components/dashboard/StatsCard';
import styles from './owner.module.css';

/**
 * Owner Dashboard - Tutor Doador
 * Displays list of owner's pets with statistics
 * Requirements: 2.1, 2.3, 2.4, 2.6
 */
export default function OwnerDashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    adopted: 0,
    total: 0
  });
  const [filter, setFilter] = useState('all');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Check authentication server-side
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/dashboard/owner');
    }
  }, [status, router]);

  // Fetch owner's pets
  useEffect(() => {
    if (!session?.user?.id) return;

    const fetchPets = async () => {
      try {
        setLoading(true);
        setError(null);

        // Try to load from cache first
        const cached = JSON.parse(
          localStorage.getItem('userPets') || 'null'
        );

        // Set cached data while fetching
        if (cached && Array.isArray(cached)) {
          setPets(cached);
          calculateStats(cached);
        }

        // Fetch from server
        const response = await fetch(
          `/api/pets?ownerId=${session.user.id}&limit=100`,
          {
            headers: { 'Accept': 'application/json' }
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch pets');
        }

        const data = await response.json();

        if (data.pets && Array.isArray(data.pets)) {
          setPets(data.pets);
          calculateStats(data.pets);

          // Update cache
          localStorage.setItem('userPets', JSON.stringify(data.pets));
        }
      } catch (err) {
        console.error('Error fetching pets:', err);
        setError(err.message || 'Failed to load your pets');
        
        // Use cache data if available
        const cached = JSON.parse(
          localStorage.getItem('userPets') || 'null'
        );
        if (cached && Array.isArray(cached)) {
          setPets(cached);
          calculateStats(cached);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPets();
  }, [session?.user?.id, refreshTrigger]);

  // Calculate statistics from pets
  const calculateStats = (petsList) => {
    const stats = {
      total: petsList.length,
      pending: petsList.filter(p => p.status === 'PENDING').length,
      approved: petsList.filter(p => p.status === 'APPROVED').length,
      adopted: petsList.filter(p => p.status === 'ADOPTED').length
    };
    setStats(stats);
  };

  // Filter pets based on selected filter
  const filteredPets = filter === 'all'
    ? pets
    : pets.filter(pet => {
        if (filter === 'pending') return pet.status === 'PENDING';
        if (filter === 'approved') return pet.status === 'APPROVED';
        if (filter === 'adopted') return pet.status === 'ADOPTED';
        return true;
      });

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // Loading state
  if (status === 'loading' || (loading && pets.length === 0)) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}>
          <div className={styles.spinner}></div>
          <p>Carregando seus pets...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (status === 'unauthenticated' || !session?.user) {
    return null;
  }

  return (
    <div className={styles.ownerDashboard}>
      {/* Header with refresh button */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Meus Pets</h1>
          <p className={styles.subtitle}>Gerencie seus pets e solicitações de adoção</p>
        </div>
        <div className={styles.headerActions}>
          <button
            onClick={handleRefresh}
            className={styles.refreshButton}
            disabled={loading}
            title="Atualizar lista"
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {loading ? 'Atualizando...' : 'Atualizar'}
          </button>
          <Link href="/tutores/cadastrar" className={styles.addButton}>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Novo Pet
          </Link>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className={styles.errorAlert}>
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p>{error}</p>
        </div>
      )}

      {/* Statistics Cards */}
      <div className={styles.statsSection}>
        <h2 className={styles.sectionTitle}>Resumo</h2>
        <div className={styles.statsGrid}>
          <StatsCard
            title="Total de Pets"
            value={stats.total}
            icon={
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            variant="primary"
          />
          <StatsCard
            title="Aguardando Aprovação"
            value={stats.pending}
            icon={
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            variant="warning"
          />
          <StatsCard
            title="Aprovados"
            value={stats.approved}
            icon={
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            variant="success"
          />
          <StatsCard
            title="Adotados"
            value={stats.adopted}
            icon={
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M14 10h-2m2 0H6m8 0a4 4 0 11-8 0 4 4 0 018 0zm-8 8c0 1.657.895 3.495 2.37 4.71C5.22 22.08 3 20.08 3 18c0-2.21 1.12-4.14 2.81-5.26M8 22v-4m-6-6c0 1.657 1.343 3 3 3s3-1.343 3-3-1.343-3-3-3-3 1.343-3 3z" />
              </svg>
            }
            variant="info"
          />
        </div>
      </div>

      {/* Filters Section */}
      <div className={styles.filtersSection}>
        <h2 className={styles.sectionTitle}>Meus Pets</h2>
        <div className={styles.filterButtons}>
          <button
            onClick={() => setFilter('all')}
            className={`${styles.filterButton} ${filter === 'all' ? styles.active : ''}`}
          >
            Todos ({stats.total})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`${styles.filterButton} ${filter === 'pending' ? styles.active : ''}`}
          >
            Pendentes ({stats.pending})
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`${styles.filterButton} ${filter === 'approved' ? styles.active : ''}`}
          >
            Aprovados ({stats.approved})
          </button>
          <button
            onClick={() => setFilter('adopted')}
            className={`${styles.filterButton} ${filter === 'adopted' ? styles.active : ''}`}
          >
            Adotados ({stats.adopted})
          </button>
        </div>
      </div>

      {/* Pets Grid */}
      {filteredPets.length === 0 ? (
        <div className={styles.emptyState}>
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <p>
            {filter === 'all'
              ? 'Você ainda não cadastrou nenhum pet.'
              : `Você não tem pets ${
                  filter === 'pending' ? 'aguardando aprovação' :
                  filter === 'approved' ? 'aprovados' :
                  'adotados'
                }.`
            }
          </p>
          <Link href="/tutores/cadastrar" className={styles.emptyStateButton}>
            Cadastre seu primeiro pet
          </Link>
        </div>
      ) : (
        <div className={styles.petsGrid}>
          {filteredPets.map((pet) => (
            <PetCard
              key={pet.id}
              pet={pet}
              onRefresh={handleRefresh}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Pet Card Component for Owner Dashboard
 */
function PetCard({ pet, onRefresh }) {
  const router = useRouter();
  const [updating, setUpdating] = useState(false);

  const getStatusBadge = (status) => {
    const statusConfig = {
      PENDING: { bg: 'pending', label: '⏳ Aguardando Aprovação', color: '#F59E0B' },
      APPROVED: { bg: 'approved', label: '✅ Aprovado', color: '#10B981' },
      ADOPTED: { bg: 'adopted', label: '🎉 Adotado', color: '#8B5CF6' },
      UNAVAILABLE: { bg: 'unavailable', label: '📦 Arquivado', color: '#6B7280' }
    };
    return statusConfig[status] || statusConfig.PENDING;
  };

  const handleArchive = async () => {
    if (!window.confirm('Tem certeza que deseja arquivar este pet? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      setUpdating(true);
      const response = await fetch(`/api/pets/${pet.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error('Failed to archive pet');
      }

      onRefresh();
    } catch (error) {
      console.error('Error archiving pet:', error);
      alert('Erro ao arquivar pet: ' + error.message);
    } finally {
      setUpdating(false);
    }
  };

  const statusBadge = getStatusBadge(pet.status);

  return (
    <div className={styles.petCard}>
      {/* Image */}
      <div className={styles.petImageContainer}>
        {pet.images && pet.images.length > 0 ? (
          <Image
            src={pet.images[0]}
            alt={pet.name}
            fill
            className={styles.petImage}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              const sibling = e.currentTarget.nextElementSibling;
              if (sibling) sibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div className={styles.petImagePlaceholder}>
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <div
          className={styles.statusBadge}
          style={{ backgroundColor: statusBadge.color }}
        >
          {statusBadge.label}
        </div>
      </div>

      {/* Content */}
      <div className={styles.petCardContent}>
        <h3 className={styles.petName}>{pet.name}</h3>
        <p className={styles.petBreed}>{pet.breed}</p>

        {/* Info grid */}
        <div className={styles.petInfoGrid}>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Espécie</span>
            <span className={styles.infoValue}>
              {pet.species === 'DOG' ? '🐕 Cão' : '🐱 Gato'}
            </span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Tamanho</span>
            <span className={styles.infoValue}>
              {pet.size === 'SMALL' ? 'Pequeno' : pet.size === 'MEDIUM' ? 'Médio' : pet.size === 'LARGE' ? 'Grande' : 'Extra Grande'}
            </span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Idade</span>
            <span className={styles.infoValue}>{pet.age}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Gênero</span>
            <span className={styles.infoValue}>
              {pet.gender === 'MALE' ? '♂ Macho' : '♀ Fêmea'}
            </span>
          </div>
        </div>

        {/* Status alert for PENDING */}
        {pet.status === 'PENDING' && (
          <div className={styles.infoBox}>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>Seu pet está sendo analisado por nosso time. Você receberá um email quando for aprovado.</p>
          </div>
        )}

        {/* Tags */}
        {(pet.isVaccinated || pet.isNeutered) && (
          <div className={styles.tags}>
            {pet.isVaccinated && (
              <span className={styles.tag}>💉 Vacinado</span>
            )}
            {pet.isNeutered && (
              <span className={styles.tag}>♣ Castrado</span>
            )}
          </div>
        )}

        {/* Actions */}
        <div className={styles.petCardActions}>
          <button
            onClick={() => {}}
            className={styles.viewDetailsButton}
            title="Ver detalhes completos"
          >
            Ver Detalhes
          </button>
          <button
            onClick={() => {}}
            className={styles.editButton}
            disabled={updating}
            title="Editar informações do pet"
          >
            ✏️ Editar
          </button>
          <button
            onClick={handleArchive}
            className={styles.archiveButton}
            disabled={updating}
            title="Arquivar este pet"
          >
            {updating ? 'Arquivando...' : '📦'}
          </button>
        </div>
      </div>
    </div>
  );
}
