'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getToken, isTokenValid } from '@/lib/authToken';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Layout from '@/components/common/Layout';
import PageNavigation from '@/components/common/PageNavigation/PageNavigation';
import styles from './pendente.module.css';

function PetPendenteContent({ petId }) {
  const router = useRouter();
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusCheck, setStatusCheck] = useState(0);
  const [autoRefreshActive, setAutoRefreshActive] = useState(true);

  const breadcrumbs = [
    { label: 'Início', href: '/' },
    { label: 'Tutores', href: '/tutores' },
    { label: 'Pet Pendente', href: `/tutores/${petId}/pendente` }
  ];

  useEffect(() => {
    const fetchPetData = async () => {
      try {
        const token = getToken();
        
        if (!token || !isTokenValid(token)) {
          setError('Sessão expirada. Redirecionando para login...');
          setTimeout(() => {
            router.push('/auth/login');
          }, 2000);
          return;
        }

        const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        const response = await fetch(`${backendUrl}/api/pets/${petId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          if (response.status === 404) {
            setError('Pet não encontrado.');
          } else if (response.status === 403) {
            setError('Você não tem permissão para acessar este pet.');
          } else {
            setError('Erro ao carregar dados do pet.');
          }
          setLoading(false);
          return;
        }

        const data = await response.json();
        setPet(data.data || data);
        setError(null);
        setStatusCheck(prev => prev + 1);

        // Stop auto-refresh if status is no longer PENDING
        if (data.data?.status !== 'PENDING' && data.status !== 'PENDING') {
          setAutoRefreshActive(false);
        }
      } catch (err) {
        console.error('Error fetching pet data:', err);
        setError('Erro ao conectar ao servidor.');
      } finally {
        setLoading(false);
      }
    };

    fetchPetData();

    // Set up auto-refresh polling every 30 seconds
    const interval = autoRefreshActive ? setInterval(fetchPetData, 30000) : null;

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [petId, router, autoRefreshActive]);

  const getTimelineStatus = () => {
    if (!pet) return [];

    return [
      {
        step: 1,
        label: 'Cadastrado',
        date: pet.created_at ? new Date(pet.created_at).toLocaleDateString('pt-BR') : 'Hoje',
        status: 'completed',
        icon: '✅'
      },
      {
        step: 2,
        label: 'Aguardando Aprovação',
        date: 'até 24h',
        status: pet.status === 'PENDING' ? 'current' : 'completed',
        icon: pet.status === 'PENDING' ? '⏳' : '✅'
      },
      {
        step: 3,
        label: 'Aprovado',
        date: pet.status === 'AVAILABLE' ? new Date(pet.updated_at).toLocaleDateString('pt-BR') : 'Em breve',
        status: pet.status === 'AVAILABLE' ? 'completed' : 'pending',
        icon: pet.status === 'AVAILABLE' ? '✅' : '⏳'
      }
    ];
  };

  const handleViewDetails = () => {
    router.push(`/pets/${petId}`);
  };

  const handleEditPet = () => {
    router.push(`/tutores/${petId}/editar`);
  };

  const handleRefresh = () => {
    setLoading(true);
    window.location.reload();
  };

  if (loading) {
    return (
      <Layout 
        title="Pet Pendente de Aprovação" 
        breadcrumbs={breadcrumbs}
        showBreadcrumbs={true}
        showNavigation={false}
      >
        <section className={styles.mainContent}>
          <div className={styles.mainContainer}>
            <div className={styles.loadingContainer}>
              <div className={styles.spinner}></div>
              <p className={styles.loadingText}>Carregando informações do pet...</p>
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout 
        title="Erro" 
        breadcrumbs={breadcrumbs}
        showBreadcrumbs={true}
        showNavigation={false}
      >
        <section className={styles.mainContent}>
          <div className={styles.mainContainer}>
            <div className={styles.errorContainer}>
              <div className={styles.errorIcon}>⚠️</div>
              <h2 className={styles.errorTitle}>Erro ao Carregar Pet</h2>
              <p className={styles.errorMessage}>{error}</p>
              <button onClick={handleRefresh} className={styles.retryButton}>
                Tentar Novamente
              </button>
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  const timeline = getTimelineStatus();

  return (
    <Layout 
      title="Pet Pendente de Aprovação" 
      breadcrumbs={breadcrumbs}
      showBreadcrumbs={true}
      showNavigation={false}
    >
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroContainer}>
          <div className={styles.heroIcon}>🎉</div>
          <h1 className={styles.heroTitle}>
            Pet Cadastrado com Sucesso!
          </h1>
          <p className={styles.heroDescription}>
            Seu pet foi registrado e está aguardando aprovação.
            {autoRefreshActive && <span className={styles.refreshIndicator}> Atualizando a cada 30s...</span>}
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className={styles.mainContent}>
        <div className={styles.mainContainer}>
          {/* Status Card */}
          <div className={styles.statusCard}>
            <div className={styles.statusBadge}>
              <span className={styles.statusIcon}>⏳</span>
              <span className={styles.statusText}>Pendente de Aprovação</span>
            </div>

            {/* Pet Info Box */}
            {pet && (
              <div className={styles.petInfoBox}>
                <div className={styles.petImageContainer}>
                  {pet.photos && pet.photos.length > 0 ? (
                    <img 
                      src={pet.photos[0]} 
                      alt={pet.name}
                      className={styles.petImage}
                    />
                  ) : (
                    <div className={styles.petImagePlaceholder}>
                      {pet.species === 'DOG' ? '🐕' : pet.species === 'CAT' ? '🐈' : '🐾'}
                    </div>
                  )}
                </div>

                <div className={styles.petDetails}>
                  <h2 className={styles.petName}>{pet.name}</h2>
                  <div className={styles.petMeta}>
                    <span className={styles.petMetaItem}>
                      <strong>Espécie:</strong> {mapSpecies(pet.species)}
                    </span>
                    <span className={styles.petMetaItem}>
                      <strong>Raça:</strong> {pet.breed}
                    </span>
                    <span className={styles.petMetaItem}>
                      <strong>Idade:</strong> {pet.age} ano{pet.age !== 1 ? 's' : ''}
                    </span>
                    <span className={styles.petMetaItem}>
                      <strong>Tamanho:</strong> {mapSize(pet.size)}
                    </span>
                  </div>

                  <div className={styles.messageBox}>
                    <div className={styles.messageIcon}>ℹ️</div>
                    <div>
                      <p className={styles.messageTitle}>Seu pet foi cadastrado!</p>
                      <p className={styles.messageText}>
                        Aguarde aprovação (até 24h). Você receberá um email de confirmação em breve.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Timeline */}
          <div className={styles.timelineContainer}>
            <h3 className={styles.timelineTitle}>📋 Histórico do Cadastro</h3>
            <div className={styles.timeline}>
              {timeline.map((item, index) => (
                <div key={index} className={`${styles.timelineItem} ${styles[item.status]}`}>
                  <div className={styles.timelineMarker}>
                    <div className={styles.timelineIcon}>{item.icon}</div>
                  </div>
                  <div className={styles.timelineContent}>
                    <h4 className={styles.timelineLabel}>{item.label}</h4>
                    <p className={styles.timelineDate}>{item.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className={styles.actionButtons}>
            <button 
              onClick={handleViewDetails}
              className={styles.primaryButton}
            >
              🔍 Ver Detalhes do Pet
            </button>
            <button 
              onClick={handleEditPet}
              className={styles.secondaryButton}
            >
              ✏️ Editar Pet
            </button>
            <button 
              onClick={handleRefresh}
              className={styles.tertiaryButton}
            >
              🔄 Atualizar Status
            </button>
          </div>

          {/* Info Section */}
          <div className={styles.infoSection}>
            <div className={styles.infoBox}>
              <div className={styles.infoIcon}>💡</div>
              <div className={styles.infoContent}>
                <h4 className={styles.infoTitle}>O que Acontece Agora?</h4>
                <ul className={styles.infoList}>
                  <li>Nosso time revisará seu cadastro em até 24 horas</li>
                  <li>Verificaremos todas as informações fornecidas</li>
                  <li>Se tudo estiver correto, seu pet será publicado na plataforma</li>
                  <li>Você receberá um email de confirmação</li>
                  <li>Interessados em adoção entrarão em contato direto com você</li>
                </ul>
              </div>
            </div>

            <div className={styles.infoBox}>
              <div className={styles.infoIcon}>❓</div>
              <div className={styles.infoContent}>
                <h4 className={styles.infoTitle}>Precisa de Ajuda?</h4>
                <p className={styles.infoText}>
                  Se tiver dúvidas ou precisar fazer alterações no cadastro, 
                  <strong> entre em contato conosco</strong>. Estamos aqui para ajudar!
                </p>
              </div>
            </div>
          </div>

          {/* Last Updated Info */}
          {statusCheck > 0 && (
            <div className={styles.lastUpdated}>
              Último check: {new Date().toLocaleTimeString('pt-BR')} 
              {statusCheck > 1 && ` (${statusCheck} atualizações)`}
            </div>
          )}
        </div>
      </section>

      {/* Page Navigation */}
      <PageNavigation 
        previousPage={{ label: 'Cadastrar Outro Pet', href: '/tutores/cadastrar' }}
        nextPage={{ label: 'Meus Pets', href: '/tutores' }}
      />
    </Layout>
  );
}

function mapSpecies(species) {
  const speciesMap = {
    'DOG': 'Cachorro',
    'CAT': 'Gato',
    'RABBIT': 'Coelho',
    'OTHER': 'Outro',
    'cachorro': 'Cachorro',
    'gato': 'Gato',
    'coelho': 'Coelho',
    'outro': 'Outro'
  };
  return speciesMap[species] || species;
}

function mapSize(size) {
  const sizeMap = {
    'SMALL': 'Pequeno',
    'MEDIUM': 'Médio',
    'LARGE': 'Grande',
    'XLARGE': 'Extra Grande',
    'pequeno': 'Pequeno',
    'medio': 'Médio',
    'grande': 'Grande',
    'extra-grande': 'Extra Grande'
  };
  return sizeMap[size] || size;
}

export default function PetPendentePage() {
  const params = useParams();
  const petId = params.id;

  return (
    <ProtectedRoute requiredUserTypes={['INDIVIDUAL_OWNER', 'SHELTER_ADMIN']}>
      <PetPendenteContent petId={petId} />
    </ProtectedRoute>
  );
}
