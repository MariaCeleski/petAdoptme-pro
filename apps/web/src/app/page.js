import Layout from '@/components/common/Layout';
import Button from '@/components/ui/Button';
import SponsorsCarousel from '@/components/common/SponsorsCarousel/SponsorsCarousel';
import styles from './page.module.css';

export default function HomePage() {
  return (
    <Layout showNavigation={false}>
      <div>
        {/* Hero Section */}
        <section className={styles.heroSection}>
          <div className={styles.heroContainer}>
            <div className={styles.heroContent}>
              <h1 className={styles.heroTitle}>
                Encontre seu 
                <span className={styles.highlight}> Companheiro</span> 
                <br />
                Perfeito 🐾
              </h1>
              
              <p className={styles.heroDescription}>
                Conectamos corações. Milhares de cães e gatos estão esperando por uma família amorosa. 
                Que tal ser você a fazer a diferença na vida de um pet?
              </p>
              
              <div className={styles.buttonContainer}>
                <Button size="large" variant="success" href="/pets" as="link">
                  🐕 Adotar um Pet
                </Button>
                <Button size="large" variant="outline" href="/tutores/cadastrar" as="link">
                  💝 Cadastrar Pet
                </Button>
              </div>
              
              {/* Estatísticas */}
              <div className={styles.statsContainer}>
                <div className={styles.statItem}>
                  <span className={styles.statNumber}>2.847</span>
                  <span className={styles.statLabel}>Pets Adotados</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statNumber}>156</span>
                  <span className={styles.statLabel}>Famílias Felizes</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statNumber}>89</span>
                  <span className={styles.statLabel}>Pets Disponíveis</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pets em Destaque */}
        <section className={styles.petsSection}>
          <div className={styles.petsSectionContainer}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                Pets Esperando por 
                <span className={styles.highlight}> Você</span>
              </h2>
              <p className={styles.sectionDescription}>
                Conheça alguns dos nossos amigos peludos que estão prontos para encher sua casa de amor e alegria.
              </p>
            </div>
            
            {/* Grid de Pets Mockados */}
            <div className={styles.petsGrid}>
              {mockPets.map((pet, index) => (
                <PetCard key={index} pet={pet} />
              ))}
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <Button size="large" variant="primary">
                Ver Todos os Pets Disponíveis
              </Button>
            </div>
          </div>
        </section>

        {/* Sponsors Carousel */}
        <SponsorsCarousel />

        {/* Call to Action */}
        <section className={styles.ctaSection}>
          <div className={styles.ctaContainer}>
            <h2 className={styles.ctaTitle}>
              Pronto para Mudar uma Vida? 💚
            </h2>
            <p className={styles.ctaDescription}>
              O processo de adoção é simples, seguro e pensado no bem-estar dos animais. 
              Cadastre-se e comece sua jornada como tutor responsável hoje mesmo.
            </p>
            <Button size="large" variant="outline">
              Começar Processo de Adoção
            </Button>
          </div>
        </section>
      </div>
    </Layout>
  );
}

// Componente de Card do Pet (temporário)
function PetCard({ pet }) {
  const genderClass = pet.gender === 'Macho' ? 'male' : 'female';
  
  return (
    <div className={styles.petCard}>
      <div className={styles.petImageContainer}>
        <span>{pet.emoji}</span>
      </div>
      <div className={styles.petContent}>
        <h3 className={styles.petName}>
          {pet.name}
        </h3>
        <p className={styles.petInfo}>
          {pet.breed} • {pet.age}
        </p>
        <p className={styles.petDescription}>
          {pet.description}
        </p>
        <div className={styles.petFooter}>
          <span className={`${styles.petGender} ${styles[genderClass]}`}>
            {pet.gender}
          </span>
          <Button size="small" variant="outline">
            Ver Detalhes
          </Button>
        </div>
      </div>
    </div>
  );
}

// Dados mockados para demonstração
const mockPets = [
  {
    name: "Bella",
    breed: "Labrador",
    age: "2 anos",
    gender: "Fêmea",
    emoji: "🐕",
    description: "Uma cadela carinhosa e brincalhona, perfeita para famílias com crianças. Adora correr no parque!"
  },
  {
    name: "Milo",
    breed: "Vira-lata",
    age: "1 ano",
    gender: "Macho",
    emoji: "🐶",
    description: "Filhote cheio de energia, muito inteligente e fácil de treinar. Busca uma família ativa."
  },
  {
    name: "Luna",
    breed: "Siamês",
    age: "3 anos",
    gender: "Fêmea",
    emoji: "🐱",
    description: "Gata elegante e carinhosa, ideal para apartamentos. Adora carinho e tem um miado melodioso."
  },
  {
    name: "Thor",
    breed: "Pitbull",
    age: "4 anos",
    gender: "Macho",
    emoji: "🐕‍🦺",
    description: "Cão protetor e leal, excelente com crianças. Precisa de tutor experiente e espaço para brincar."
  },
  {
    name: "Nina",
    breed: "Persa",
    age: "2 anos",
    gender: "Fêmea",
    emoji: "😸",
    description: "Gata calma e companheira, perfeita para quem busca um pet tranquilo. Adora um cantinho no sol."
  },
  {
    name: "Rex",
    breed: "Pastor Alemão",
    age: "5 anos",
    gender: "Macho",
    emoji: "🐕‍🦺",
    description: "Cão inteligente e obediente, ideal para tutores que gostam de atividades ao ar livre."
  }
];