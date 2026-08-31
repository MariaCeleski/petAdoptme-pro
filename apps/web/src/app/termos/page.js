'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Layout from '@/components/common/Layout';
import PageNavigation from '@/components/common/PageNavigation/PageNavigation';
import styles from './termos.module.css';

export default function TermosPage() {
  const [activeSection, setActiveSection] = useState('1');
  const [isTocOpen, setIsTocOpen] = useState(false);

  const breadcrumbs = [
    { label: 'Início', href: '/' },
    { label: 'Termos de Serviço', href: '/termos' }
  ];

  const sections = [
    {
      id: '1',
      title: 'Aceitação dos Termos',
      content: [
        'Ao acessar e usar a plataforma PetAdopt, você concorda em estar vinculado por estes Termos de Serviço. Se você não concorda com qualquer parte destes termos, você não deve usar a plataforma. Estes termos constituem o acordo integral entre você e a PetAdopt e superam todos os acordos e entendimentos anteriores.',
        'Reservamo-nos o direito de modificar estes termos a qualquer momento. As mudanças entrarão em vigor imediatamente após a publicação na plataforma. Seu uso continuado da plataforma após tais modificações constitui sua aceitação dos termos atualizados.'
      ],
      highlights: [
        'Você deve ter pelo menos 18 anos para usar esta plataforma',
        'A PetAdopt se reserva o direito de recusar ou encerrar serviços',
        'Todos os usuários devem seguir estes termos em sua totalidade'
      ]
    },
    {
      id: '2',
      title: 'Uso da Plataforma',
      content: [
        'Você concorda em usar a plataforma PetAdopt apenas para fins legítimos e de acordo com estes Termos de Serviço. Você não deve usar a plataforma de uma forma que possa danificá-la, desabilitá-la ou prejudicar seu funcionamento.',
        'Especificamente, você concorda em não:'
      ],
      restrictions: [
        'Engajar-se em qualquer atividade ilegal ou que promova atividades ilegais',
        'Usar a plataforma para assédio, ameaças, difamação ou abuso de outros usuários',
        'Tentar obter acesso não autorizado aos sistemas de segurança da plataforma',
        'Enviar spam, phishing, malware ou qualquer conteúdo prejudicial',
        'Publicar conteúdo que viole direitos autorais, marcas registradas ou propriedade intelectual',
        'Usar bots automatizados ou scripts para extrair dados da plataforma',
        'Impersonar outra pessoa ou entidade'
      ],
      notice: 'A violação destas políticas pode resultar na suspensão ou encerramento imediato de sua conta, sem aviso prévio.'
    },
    {
      id: '3',
      title: 'Contas de Usuário',
      content: [
        'Para usar certos recursos da plataforma, você deve criar uma conta. Você é responsável por manter a confidencialidade de suas credenciais de login e por todas as atividades que ocorrem em sua conta.',
        'Você concorda em fornecer informações precisas, atuais e completas durante o registro. Qualquer informação falsa, desatualizada ou incompleta pode resultar na suspensão ou encerramento de sua conta.'
      ],
      subsections: [
        {
          title: 'Responsabilidades do Usuário',
          items: [
            'Manter a segurança de suas credenciais de login',
            'Notificar-nos imediatamente de qualquer acesso não autorizado',
            'Fornecer informações verdadeiras e precisas em seu perfil',
            'Aceitar total responsabilidade pelas atividades em sua conta'
          ]
        }
      ]
    },
    {
      id: '4',
      title: 'Direitos Autorais e Propriedade Intelectual',
      content: [
        'Todos os conteúdos na plataforma PetAdopt, incluindo textos, imagens, gráficos, logotipos e software, são propriedade da PetAdopt ou de seus fornecedores de conteúdo e estão protegidos por leis de direitos autorais internacionais.',
        'Você retém todos os direitos sobre conteúdo que você cria e publica na plataforma (como fotos e descrições de animais de estimação). Ao publicar conteúdo, você nos concede uma licença mundial, não exclusiva e livre de royalties para usar, modificar e exibir esse conteúdo em conexão com a operação da plataforma.'
      ],
      notice: 'O uso não autorizado de conteúdo protegido por direitos autorais é proibido. Violaremos os direitos autorais de terceiros. Denúncias de infração devem ser enviadas para legal@petadopt.com.'
    },
    {
      id: '5',
      title: 'Limitação de Responsabilidade',
      content: [
        'Na máxima extensão permitida por lei, a PetAdopt não será responsável por qualquer dano indireto, incidental, especial ou consequente resultante de ou relacionado ao seu uso ou incapacidade de usar a plataforma, mesmo que tenhamos sido informados da possibilidade de tais danos.',
        'A plataforma é fornecida "como está" sem garantias de qualquer tipo, expressas ou implícitas. A PetAdopt não garante que a plataforma será contínua, sem erros ou livre de vírus.'
      ],
      highlights: [
        'A responsabilidade total da PetAdopt não excede o valor que você pagou para usar a plataforma',
        'Alguns jurisdições não permitem a exclusão de certas garantias, portanto, essas exclusões podem não se aplicar a você'
      ]
    },
    {
      id: '6',
      title: 'Indenização',
      content: [
        'Você concorda em indenizar, defender e manter a PetAdopt, seus diretores, funcionários e agentes livres de qualquer reclamação, dano, perda, responsabilidade e despesa (incluindo honorários advocatícios) decorrentes de ou relacionados ao seu uso da plataforma ou violação destes Termos de Serviço.',
        'Isso inclui qualquer reclamação feita por terceiros sobre seu conteúdo, atividades ou violação de direitos de terceiros.'
      ]
    },
    {
      id: '7',
      title: 'Modificações dos Termos',
      content: [
        'A PetAdopt se reserva o direito de modificar estes Termos de Serviço a qualquer momento. Notificaremos os usuários sobre mudanças significativas através de um aviso na plataforma ou por email.',
        'Seu uso continuado da plataforma após a postagem de termos modificados constitui sua aceitação das mudanças. Se você não concorda com os termos modificados, você deve descontinuar o uso da plataforma.'
      ],
      notice: 'Recomendamos que você revise regularmente estes termos para permanecer informado sobre as políticas que regem o seu uso da plataforma.'
    },
    {
      id: '8',
      title: 'Encerramento de Conta',
      content: [
        'Você pode solicitar o encerramento de sua conta a qualquer momento entrando em contato conosco. A PetAdopt também pode encerrar sua conta a qualquer momento, por qualquer motivo, com ou sem aviso prévio.',
        'Após o encerramento da conta, sua conta não será mais acessível, mas podemos reter informações já publicadas (como fotos de animais de estimação) conforme permitido por lei.'
      ],
      highlights: [
        'A PetAdopt pode encerrar contas por violação dos Termos de Serviço',
        'O encerramento não isenta você de obrigações anteriores',
        'Dados pessoais serão mantidos conforme nossa Política de Privacidade'
      ]
    },
    {
      id: '9',
      title: 'Lei Aplicável',
      content: [
        'Estes Termos de Serviço são regidos pelas leis da República Federativa do Brasil, sem considerar seus princípios de conflito de leis. Qualquer ação legal ou procedimento decorrente de ou relacionado a estes termos será executado exclusivamente nos tribunais competentes do Brasil.',
        'Você concorda em se submeter à jurisdição pessoal e exclusiva desses tribunais e renuncia a qualquer objeção relacionada a foro impróprio ou inconveniente.'
      ]
    },
    {
      id: '10',
      title: 'Contato e Suporte',
      content: [
        'Se você tiver dúvidas sobre estes Termos de Serviço ou sobre a plataforma PetAdopt, entre em contato conosco através dos seguintes canais:'
      ],
      contact: {
        email: 'legal@petadopt.com',
        whatsapp: '(11) 99999-9999',
        website: 'www.petadopt.com'
      },
      contactLink: 'Para questões gerais de suporte, visite nossa página de Contato.'
    }
  ];

  // Handle navigation via TOC
  const handleTocClick = (sectionId) => {
    setActiveSection(sectionId);
    const element = document.getElementById(`section-${sectionId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsTocOpen(false);
  };

  // Update active section based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100;
      
      for (const section of sections) {
        const element = document.getElementById(`section-${section.id}`);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <Layout 
      title="Termos de Serviço" 
      breadcrumbs={breadcrumbs}
      showBreadcrumbs={true}
      showNavigation={false}
    >
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroContainer}>
          <h1 className={styles.heroTitle}>
            Termos de Serviço 📋
          </h1>
          <p className={styles.heroDescription}>
            Bem-vindo à PetAdopt! Estes termos descrevem os direitos, responsabilidades e políticas que regem o uso de nossa plataforma. 
            Pedimos que você leia atentamente antes de começar a usar nossos serviços.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className={styles.mainContent}>
        <div className={styles.mainContainer}>
          {/* Mobile TOC Toggle */}
          <button 
            className={styles.tocToggle}
            onClick={() => setIsTocOpen(!isTocOpen)}
          >
            {isTocOpen ? '✕ Fechar Índice' : '☰ Abrir Índice'}
          </button>

          <div className={styles.contentGrid}>
            {/* Table of Contents - Sidebar */}
            <aside className={`${styles.sidebar} ${isTocOpen ? styles.visible : styles.hidden}`}>
              <nav className={styles.tableOfContents}>
                <h3>Índice</h3>
                <ul className={styles.tocList}>
                  {sections.map((section) => (
                    <li 
                      key={section.id}
                      className={`${styles.tocItem} ${activeSection === section.id ? styles.active : ''}`}
                    >
                      <a href={`#section-${section.id}`} onClick={(e) => {
                        e.preventDefault();
                        handleTocClick(section.id);
                      }}>
                        {section.id}. {section.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </aside>

            {/* Terms Content */}
            <div className={styles.termsContent}>
              {sections.map((section) => (
                <div 
                  key={section.id}
                  className={styles.termSection}
                  id={`section-${section.id}`}
                >
                  <h2 className={styles.sectionTitle}>
                    <span className={styles.sectionNumber}>{section.id}</span>
                    {section.title}
                  </h2>

                  {/* Content Paragraphs */}
                  {section.content.map((paragraph, idx) => (
                    <p key={idx}>{paragraph}</p>
                  ))}

                  {/* Restrictions List (for section 2) */}
                  {section.restrictions && (
                    <>
                      <ul className={styles.termsList}>
                        {section.restrictions.map((item, idx) => (
                          <li key={idx} className={styles.termsItem}>
                            {item}
                          </li>
                        ))}
                      </ul>
                      {section.notice && (
                        <div className={styles.importantNotice}>
                          <strong>⚠️ Aviso Importante:</strong> {section.notice}
                        </div>
                      )}
                    </>
                  )}

                  {/* Highlights */}
                  {section.highlights && (
                    <ul className={styles.termsList}>
                      {section.highlights.map((item, idx) => (
                        <li key={idx} className={styles.termsItem}>
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Notice Box */}
                  {section.notice && !section.restrictions && (
                    <div className={styles.importantNotice}>
                      <strong>ℹ️ Informação Importante:</strong> {section.notice}
                    </div>
                  )}

                  {/* Subsections */}
                  {section.subsections && section.subsections.map((subsection, idx) => (
                    <div key={idx}>
                      <h3 className={styles.subsectionTitle}>{subsection.title}</h3>
                      <ul className={styles.termsList}>
                        {subsection.items.map((item, itemIdx) => (
                          <li key={itemIdx} className={styles.termsItem}>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}

                  {/* Contact Information */}
                  {section.contact && (
                    <div>
                      <ul className={styles.termsList}>
                        <li className={styles.termsItem}>
                          <strong>Email:</strong> {section.contact.email}
                        </li>
                        <li className={styles.termsItem}>
                          <strong>WhatsApp:</strong> {section.contact.whatsapp}
                        </li>
                        <li className={styles.termsItem}>
                          <strong>Website:</strong> {section.contact.website}
                        </li>
                      </ul>
                      <p><Link href="/contato">{section.contactLink}</Link></p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaContainer}>
          <h2 className={styles.ctaTitle}>
            Dúvidas sobre nossos Termos? 💬
          </h2>
          <p className={styles.ctaDescription}>
            Se você tiver perguntas ou preocupações sobre estes Termos de Serviço, não hesite em nos contatar. 
            Nosso time está pronto para ajudar e esclarecer qualquer dúvida. Também convidamos você a revisar nossa Política de Privacidade.
          </p>
          <Link href="/contato" className={styles.ctaButton}>
            Entre em Contato 📬
          </Link>
        </div>
      </section>

      {/* Page Navigation */}
      <PageNavigation 
        previousPage={{ label: 'Processo de Adoção', href: '/processo-adocao' }}
        nextPage={{ label: 'Cadastrar Pet', href: '/tutores/cadastrar' }}
      />
    </Layout>
  );
}
