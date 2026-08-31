'use client';

import Layout from '@/components/common/Layout';
import PageNavigation from '@/components/common/PageNavigation/PageNavigation';
import Link from 'next/link';
import styles from './processo-adocao.module.css';

export default function ProcessoAdocaoPage() {
  const breadcrumbs = [
    { label: 'Início', href: '/' },
    { label: 'Adoção', href: '/pets' },
    { label: 'Como Adotar', href: '/processo-adocao' }
  ];

  const steps = [
    {
      number: 1,
      icon: '🔍',
      title: 'Explore & Escolha',
      description: 'Navegue pela nossa plataforma e encontre o pet perfeito para você.',
      points: [
        'Use filtros por espécie, tamanho e idade',
        'Leia as histórias e perfis completos dos pets',
        'Verifique compatibilidade com sua família'
      ],
      timeline: 'Tempo: A seu ritmo'
    },
    {
      number: 2,
      icon: '📝',
      title: 'Envie Solicitação',
      description: 'Complete o formulário de adoção com suas informações.',
      points: [
        'Preencha dados pessoais e de contato',
        'Responda perguntas sobre seu estilo de vida',
        'Conte sobre seu ambiente e experiência com pets'
      ],
      timeline: 'Tempo: ~10 minutos'
    },
    {
      number: 3,
      icon: '⏳',
      title: 'Aguarde Avaliação',
      description: 'O tutor atual analisará sua solicitação com cuidado.',
      points: [
        'O tutor revisará sua aplicação',
        'Você será notificado por email',
        'Seja honesto(a) e paciente'
      ],
      timeline: 'Tempo: 1-3 dias'
    },
    {
      number: 4,
      icon: '💬',
      title: 'Conheça o Pet',
      description: 'Converse com o tutor e agende um encontro pessoal.',
      points: [
        'O tutor entrará em contato por WhatsApp/telefone',
        'Agendaremos um encontro seguro',
        'Conheça o pet pessoalmente e tire dúvidas'
      ],
      timeline: 'Tempo: ~1-2 dias'
    },
    {
      number: 5,
      icon: '✅',
      title: 'Finalize a Adoção',
      description: 'Assine o contrato e inicie sua nova aventura juntos.',
      points: [
        'Assine o termo de adoção',
        'Receba documentos e histórico do pet',
        'Comece sua jornada com seu novo companheiro!'
      ],
      timeline: 'Tempo: Mesma semana'
    }
  ];

  const requirements = [
    'Ser maior de 18 anos',
    'Ter estabilidade financeira para cuidar do pet',
    'Dispor de espaço adequado para o tamanho do animal',
    'Oferecer atenção e interação diária',
    'Comprometer-se com cuidados veterinários',
    'Ter apoio da família (se aplicável)',
    'Concordar em cuidar do animal por toda sua vida'
  ];

  const benefits = [
    {
      icon: '❤️',
      title: 'Salve uma Vida',
      description: 'Cada adoção é um pet resgatado de uma situação difícil'
    },
    {
      icon: '🏠',
      title: 'Encontre Companhia',
      description: 'Ganhe um amigo leal e amoroso para a vida toda'
    },
    {
      icon: '💰',
      title: 'Custo Menor',
      description: 'Adotar é mais acessível que comprar de criadores'
    },
    {
      icon: '🎉',
      title: 'Pet Saudável',
      description: 'Geralmente já vacinados e avaliados veterinariamente'
    },
    {
      icon: '📚',
      title: 'Histórico Completo',
      description: 'Receba informações sobre a personalidade do seu novo pet'
    },
    {
      icon: '❤️‍🩹',
      title: 'Faça Diferença',
      description: 'Libere espaço para que outro pet seja resgatado'
    }
  ];

  const faqItems = [
    {
      question: 'Quanto tempo leva todo o processo?',
      answer: 'Em média, 3 a 7 dias do envio da solicitação até finalizar a adoção. Pode variar conforme a disponibilidade do tutor.'
    },
    {
      question: 'Posso devolver o pet se não der certo?',
      answer: 'Sim, entendemos que às vezes as coisas não funcionam como esperado. Entre em contato conosco e faremos o melhor para ajudar.'
    },
    {
      question: 'Qual é o valor da taxa de adoção?',
      answer: 'A plataforma é gratuita. Alguns tutores cobram taxa para cobrir cuidados veterinários e bem-estar do pet.'
    },
    {
      question: 'Como funciona a segurança da transação?',
      answer: 'Nunca compartilhamos dados pessoais sem consentimento. A comunicação pode ser feita pela plataforma até o encontro presencial.'
    }
  ];

  const testimonials = [
    {
      petName: 'Luna',
      petEmoji: '🐕',
      adopterName: 'Carlos M.',
      text: 'Encontrei minha companheira perfeita através da PetAdopt! Luna mudou minha vida completamente. O processo foi simples e seguro. Recomendo!',
      rating: 5
    },
    {
      petName: 'Whiskers',
      petEmoji: '🐱',
      adopterName: 'Ana Silva',
      text: 'Adotei Whiskers há 6 meses e é a melhor decisão que já tomei. A plataforma facilitou tudo. Um pet feliz, uma família feliz!',
      rating: 5
    },
    {
      petName: 'Rex',
      petEmoji: '🐕‍🦺',
      adopterName: 'Roberto K.',
      text: 'O atendimento foi excelente, o processo claro e transparente. Rex é parte da minha família agora. Obrigado, PetAdopt!',
      rating: 5
    }
  ];

  return (
    <Layout 
      title="Como Adotar um Pet" 
      breadcrumbs={breadcrumbs}
      showBreadcrumbs={true}
      showNavigation={false}
    >
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroContainer}>
          <h1 className={styles.heroTitle}>
            Como Adotar um Pet 🐾
          </h1>
          <p className={styles.heroDescription}>
            Descubra o processo simples e seguro para encontrar seu novo melhor amigo. 
            Guiaremos você a cada passo do caminho para garantir uma adoção feliz e responsável.
          </p>
        </div>
      </section>

      {/* Steps Section */}
      <section className={styles.stepsSection}>
        <div className={styles.stepsContainer}>
          <h2 className={styles.stepsTitle}>
            Os <span className={styles.highlight}>5 Passos</span> Simples
          </h2>

          <div className={`${styles.stepsGrid} ${styles.stepsTimeline}`}>
            {steps.map((step) => (
              <div key={step.number} className={styles.step}>
                <div className={styles.stepNumber}>{step.number}</div>
                <div className={styles.stepIcon}>{step.icon}</div>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepDescription}>{step.description}</p>
                <ul className={styles.stepPoints}>
                  {step.points.map((point, idx) => (
                    <li key={idx} className={styles.stepPoint}>{point}</li>
                  ))}
                </ul>
                <div className={styles.stepTimeline}>{step.timeline}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Requirements Section */}
      <section className={styles.requirementsSection}>
        <div className={styles.requirementsContainer}>
          <h2 className={styles.requirementsTitle}>
            O que Você <span className={styles.highlight}>Precisa?</span>
          </h2>

          <div className={styles.requirementsGrid}>
            <div>
              <ul className={styles.requirementsList}>
                {requirements.slice(0, Math.ceil(requirements.length / 2)).map((req, idx) => (
                  <li key={idx} className={styles.requirementItem}>{req}</li>
                ))}
              </ul>
            </div>
            <div>
              <ul className={styles.requirementsList}>
                {requirements.slice(Math.ceil(requirements.length / 2)).map((req, idx) => (
                  <li key={idx} className={styles.requirementItem}>{req}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className={styles.benefitsSection}>
        <div className={styles.benefitsContainer}>
          <h2 className={styles.benefitsTitle}>
            Por que <span className={styles.highlight}>Adotar?</span>
          </h2>

          <div className={styles.benefitsGrid}>
            {benefits.map((benefit, idx) => (
              <div key={idx} className={styles.benefitCard}>
                <span className={styles.benefitIcon}>{benefit.icon}</span>
                <h3 className={styles.benefitTitle}>{benefit.title}</h3>
                <p className={styles.benefitDescription}>{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Mini Section */}
      <section className={styles.faqMiniSection}>
        <div className={styles.faqMiniContainer}>
          <h2 className={styles.faqMiniTitle}>
            Perguntas <span className={styles.highlight}>Frequentes</span>
          </h2>

          <div className={styles.faqMiniGrid}>
            {faqItems.map((item, idx) => (
              <div key={idx} className={styles.faqItem}>
                <h4 className={styles.faqQuestion}>{item.question}</h4>
                <p className={styles.faqAnswer}>{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className={styles.testimonialSection}>
        <div className={styles.testimonialContainer}>
          <h2 className={styles.testimonialTitle}>
            Histórias de <span className={styles.highlight}>Sucesso</span>
          </h2>

          <div className={styles.testimonialGrid}>
            {testimonials.map((testimonial, idx) => (
              <div key={idx} className={styles.testimonialCard}>
                <div className={styles.testimonialPetInfo}>
                  <div className={styles.testimonialPetAvatar}>{testimonial.petEmoji}</div>
                  <div className={styles.testimonialPetContent}>
                    <div className={styles.testimonialPetName}>{testimonial.petName}</div>
                    <div className={styles.testimonialAdopterName}>adoptado(a) por {testimonial.adopterName}</div>
                  </div>
                </div>

                <p className={styles.testimonialText}>{testimonial.text}</p>

                <div className={styles.testimonialRating}>
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className={styles.star}>⭐</span>
                  ))}
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
            Pronto para Encontrar Seu Novo Melhor Amigo?
          </h2>
          <p className={styles.ctaDescription}>
            Comece a explorar os pets disponíveis para adoção agora. Cada passo está pronto para guiá-lo 
            em uma jornada de amor, companheirismo e segunda chances. Seu novo pet está esperando! 🐾
          </p>
          <Link href="/pets" className={styles.ctaButton}>
            Explorar Pets Disponíveis
          </Link>
        </div>
      </section>

      {/* Page Navigation */}
      <PageNavigation 
        previousPage={{ label: 'Adotar um Pet', href: '/pets' }}
        nextPage={{ label: 'FAQ', href: '/faq' }}
      />
    </Layout>
  );
}
