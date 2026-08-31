'use client';

import Layout from '@/components/common/Layout';
import Button from '@/components/ui/Button';
import PageNavigation from '@/components/common/PageNavigation/PageNavigation';
import styles from './sobre.module.css';

export default function SobrePage() {
  const breadcrumbs = [
    { label: 'Início', href: '/' },
    { label: 'Sobre Nós', href: '/sobre' }
  ];

  const teamMembers = [
    {
      name: 'Maria Silva',
      role: 'Fundadora & Diretora',
      bio: 'Apaixonada por animais desde criança, Maria dedica sua vida a conectar pets com famílias amorosas.',
      avatar: '👩‍💼'
    },
    {
      name: 'João Santos',
      role: 'Coordenador Operacional',
      bio: 'Com 10 anos de experiência em resgate animal, João garante o bem-estar de cada pet.',
      avatar: '👨‍💼'
    },
    {
      name: 'Ana Costa',
      role: 'Especialista em Bem-estar',
      bio: 'Veterinária dedicada a garantir que cada adoção seja um sucesso para pet e tutor.',
      avatar: '👩‍⚕️'
    },
    {
      name: 'Carlos Oliveira',
      role: 'Dev Lead & Tecnologia',
      bio: 'Desenvolve as soluções tecnológicas que fazem PetAdopt conectar pessoas e pets.',
      avatar: '👨‍💻'
    }
  ];

  const values = [
    {
      icon: '❤️',
      title: 'Bem-estar Animal',
      description: 'O bem-estar dos animais é nossa prioridade número 1. Cada adoção é avaliada com cuidado.'
    },
    {
      icon: '🤝',
      title: 'Transparência',
      description: 'Acreditamos em comunicação clara e honesta em todas as interações com nossa comunidade.'
    },
    {
      icon: '🌱',
      title: 'Responsabilidade Social',
      description: 'Promovemos a adoção responsável e educação sobre cuidados com animais domésticos.'
    },
    {
      icon: '✨',
      title: 'Inovação',
      description: 'Usamos tecnologia para tornar o processo de adoção simples, seguro e acessível a todos.'
    },
    {
      icon: '🌍',
      title: 'Comunidade',
      description: 'Acreditamos no poder de uma comunidade unida pelos animais para fazer a diferença.'
    },
    {
      icon: '💚',
      title: 'Inclusão',
      description: 'Todos merecem uma chance de encontrar seu companheiro perfeito, sem barreiras ou preconceitos.'
    }
  ];

  return (
    <Layout 
      title="Sobre Nós" 
      breadcrumbs={breadcrumbs}
      showBreadcrumbs={true}
      showNavigation={false}
    >
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroContainer}>
          <h1 className={styles.heroTitle}>
            Sobre a <span className={styles.highlight}>PetAdopt</span>
          </h1>
          <p className={styles.heroDescription}>
            Acreditamos que cada pet merece uma segunda chance e cada família merece encontrar seu companheiro perfeito. 
            Somos uma comunidade dedicada a transformar vidas através da adoção responsável. 🐾
          </p>
        </div>
      </section>

      {/* Mission, Vision, Values */}
      <section className={styles.missionSection}>
        <div className={styles.missionContainer}>
          <div className={styles.missionGrid}>
            <div className={`${styles.missionCard} ${styles.mission}`}>
              <span className={styles.missionIcon}>🎯</span>
              <h3 className={styles.missionTitle}>Nossa Missão</h3>
              <p className={styles.missionText}>
                Conectar corações e transformar vidas através da adoção responsável. 
                Queremos ser a ponte entre pets em busca de lar e famílias ansiosas por companhia.
              </p>
            </div>

            <div className={`${styles.missionCard} ${styles.vision}`}>
              <span className={styles.missionIcon}>🚀</span>
              <h3 className={styles.missionTitle}>Nossa Visão</h3>
              <p className={styles.missionText}>
                Um mundo onde cada animal de estimação encontra o lar perfeito. 
                Onde a adoção é segura, fácil e acessível a todos os que desejam fazer diferença.
              </p>
            </div>

            <div className={`${styles.missionCard} ${styles.values}`}>
              <span className={styles.missionIcon}>💎</span>
              <h3 className={styles.missionTitle}>Nossos Valores</h3>
              <p className={styles.missionText}>
                Bem-estar animal, transparência, responsabilidade social, inovação, 
                comunidade e inclusão guiam todas as nossas ações e decisões.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className={styles.storySection}>
        <div className={styles.storyContainer}>
          <h2 className={styles.storyTitle}>
            Nossa <span className={styles.highlight}>História</span>
          </h2>

          <div className={styles.storyGrid}>
            <div className={styles.storyImage}>
              📖
            </div>

            <div className={styles.storyContent}>
              <p className={styles.storyText}>
                <strong>PetAdopt</strong> nasceu de uma paixão simples: conectar corações. 
                Em 2023, nossa fundadora Maria Silva viu a frustração de amigos que queriam adotar mas não sabiam por onde começar.
              </p>

              <p className={styles.storyText}>
                Ao mesmo tempo, conhecia várias organizações de resgate que tinham dificuldade em encontrar lares responsáveis 
                para seus animais. Surgiu então a ideia de criar uma plataforma que unisse essas duas realidades.
              </p>

              <p className={styles.storyText}>
                Hoje, <strong>PetAdopt</strong> é mais que uma plataforma — somos uma comunidade comprometida com o bem-estar animal, 
                a educação responsável e a transformação de vidas. Cada adoção bem-sucedida é uma história de amor que celebramos.
              </p>

              <p className={styles.storyText}>
                <strong>Junte-se a nós</strong> nessa missão de dar uma segunda chance a milhares de pets que só desejam amor e um lar seguro.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Numbers */}
      <section className={styles.impactSection}>
        <div className={styles.impactContainer}>
          <h2 className={styles.impactTitle}>Nosso Impacto 🌟</h2>

          <div className={styles.impactGrid}>
            <div className={styles.impactCard}>
              <span className={styles.impactNumber}>2,847</span>
              <span className={styles.impactLabel}>Pets Adotados</span>
            </div>

            <div className={styles.impactCard}>
              <span className={styles.impactNumber}>156</span>
              <span className={styles.impactLabel}>Famílias Felizes</span>
            </div>

            <div className={styles.impactCard}>
              <span className={styles.impactNumber}>45</span>
              <span className={styles.impactLabel}>Organizações Parceiras</span>
            </div>

            <div className={styles.impactCard}>
              <span className={styles.impactNumber}>89%</span>
              <span className={styles.impactLabel}>Taxa de Sucesso</span>
            </div>
          </div>
        </div>
      </section>

      {/* Our Team */}
      <section className={styles.teamSection}>
        <div className={styles.teamContainer}>
          <h2 className={styles.teamTitle}>
            Conheca Nosso <span className={styles.highlight}>Time</span>
          </h2>

          <div className={styles.teamGrid}>
            {teamMembers.map((member, index) => (
              <div key={index} className={styles.teamMember}>
                <div className={styles.teamMemberAvatar}>
                  {member.avatar}
                </div>
                <div className={styles.teamMemberInfo}>
                  <h3 className={styles.teamMemberName}>{member.name}</h3>
                  <p className={styles.teamMemberRole}>{member.role}</p>
                  <p className={styles.teamMemberBio}>{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className={styles.valuesSection}>
        <div className={styles.valuesContainer}>
          <h2 className={styles.valuesTitle}>
            Nossos <span className={styles.highlight}>Valores</span>
          </h2>

          <div className={styles.valuesList}>
            {values.map((value, index) => (
              <div key={index} className={styles.valueItem}>
                <span className={styles.valueIcon}>{value.icon}</span>
                <div className={styles.valueContent}>
                  <h4 className={styles.valueTitle}>{value.title}</h4>
                  <p className={styles.valueDescription}>{value.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaContainer}>
          <h2 className={styles.ctaTitle}>
            Quer Fazer Parte de Nossa Comunidade?
          </h2>
          <p className={styles.ctaDescription}>
            Seja adotando um novo membro da família, cadastrando um pet ou simplesmente compartilhando nossa missão, 
            você pode fazer a diferença na vida de um animal. Comece hoje mesmo!
          </p>
          <Button size="large" variant="outline">
            Explorar Pets Disponíveis 🐾
          </Button>
        </div>
      </section>

      {/* Page Navigation */}
      <PageNavigation 
        previousPage={{ label: 'FAQ', href: '/faq' }}
        nextPage={{ label: 'Contato', href: '/contato' }}
      />
    </Layout>
  );
}
