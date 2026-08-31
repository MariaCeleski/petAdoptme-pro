import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import styles from './page.module.css';

export const metadata = {
  title: 'Dashboard - PetAdopt',
  description: 'Gerencie seus pets e adoções na PetAdopt.',
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  // Verificar autenticação no servidor
  if (!session) {
    redirect('/auth/signin');
  }

  // Redirect adopters to their specific dashboard
  if (session.user.type === 'ADOPTER') {
    redirect('/dashboard/adopter');
  }

  const userTypeLabels = {
    'ADOPTER': 'Adotante',
    'INDIVIDUAL_OWNER': 'Pessoa Física',
    'SHELTER_ADMIN': 'Administrador de Abrigo',
  };

  return (
    <div className={styles.dashboardPage}>
      <div className={styles.container}>
        
        {/* Welcome Section */}
        <div className={styles.welcomeSection}>
          <div>
            <h1 className={styles.title}>
              Bem-vindo, {session.user.name}! 👋
            </h1>
            <p className={styles.subtitle}>
              Tipo de conta: {userTypeLabels[session.user.type]}
            </p>
          </div>
        </div>

        {/* Stats Section */}
        <div className={styles.statsSection}>
          <h2 className={styles.sectionTitle}>Resumo</h2>
          <div className={styles.statsGrid}>
            {/* Card de estatísticas - exemplo */}
            <div className={styles.statCard}>
              <div className={styles.statCardHeader}>
                <div className={styles.statIcon} style={{ backgroundColor: '#DBEAFE' }}>
                  <svg fill="none" stroke="#3B82F6" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className={styles.statTitle}>Seus Pets</h3>
              </div>
              <div className={styles.statValue}>0</div>
              <p className={styles.statLabel}>Cadastrados</p>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statCardHeader}>
                <div className={styles.statIcon} style={{ backgroundColor: '#DCFCE7' }}>
                  <svg fill="none" stroke="#16A34A" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className={styles.statTitle}>Adoções</h3>
              </div>
              <div className={styles.statValue}>0</div>
              <p className={styles.statLabel}>Realizadas</p>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statCardHeader}>
                <div className={styles.statIcon} style={{ backgroundColor: '#FEF3C7' }}>
                  <svg fill="none" stroke="#FBBF24" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className={styles.statTitle}>Pendentes</h3>
              </div>
              <div className={styles.statValue}>0</div>
              <p className={styles.statLabel}>Em análise</p>
            </div>
          </div>
        </div>

        {/* Actions Section */}
        <div className={styles.actionsSection}>
          <h2 className={styles.sectionTitle}>Ações Rápidas</h2>
          <div className={styles.actionsGrid}>
            {session.user.type !== 'ADOPTER' && (
              <a href="/tutores/cadastrar" className={styles.actionButton}>
                <div className={styles.actionIcon}>
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div className={styles.actionText}>
                  <h4>Cadastrar Pet</h4>
                  <p>Adicione um novo pet</p>
                </div>
              </a>
            )}
            
            <a href="/pets" className={styles.actionButton}>
              <div className={styles.actionIcon}>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div className={styles.actionText}>
                <h4>Buscar Pets</h4>
                <p>Explore o catálogo</p>
              </div>
            </a>
            
            <a href="/dashboard/profile" className={styles.actionButton}>
              <div className={styles.actionIcon}>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className={styles.actionText}>
                <h4>Meu Perfil</h4>
                <p>Edite seus dados</p>
              </div>
            </a>
            
            <a href="/contato" className={styles.actionButton}>
              <div className={styles.actionIcon}>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div className={styles.actionText}>
                <h4>Suporte</h4>
                <p>Fale conosco</p>
              </div>
            </a>
          </div>
        </div>


      </div>
    </div>
  );
}
