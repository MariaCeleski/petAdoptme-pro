'use client';

import { useState, useMemo } from 'react';
import Layout from '@/components/common/Layout';
import PageNavigation from '@/components/common/PageNavigation/PageNavigation';
import styles from './faq.module.css';

const FAQ_DATA = {
  'Adoção': [
    {
      id: 'adocao-1',
      question: 'Como começo o processo de adoção?',
      answer: 'Para adotar um pet, primeiro navegue pela galeria de animais disponíveis no site. Quando encontrar um que combine com você, clique no perfil do pet e envie uma solicitação de adoção. O tutor atual receberá sua candidatura e poderá entrar em contato com você pelo WhatsApp ou email para discutir detalhes.'
    },
    {
      id: 'adocao-2',
      question: 'Existe limite de idade para adotar?',
      answer: 'Não há um limite de idade rígido, mas como responsável legal, você precisa ser maior de 18 anos. Alguns tutores podem ter preferências específicas sobre a idade do adotante dependendo do temperamento e necessidades do animal. Recomendamos conversar diretamente com o tutor sobre suas expectativas.'
    },
    {
      id: 'adocao-3',
      question: 'Posso adotar mais de um pet?',
      answer: 'Sim, você pode adotar quantos pets quiser! Desde que tenha espaço suficiente e recursos para cuidar de todos. Alguns tutores podem fazer perguntas sobre como você planejará cuidar de múltiplos animais para garantir o bem-estar de cada um. Seja honesto sobre sua capacidade.'
    },
    {
      id: 'adocao-4',
      question: 'E se não der certo a adoção?',
      answer: 'Entendemos que às vezes as circunstâncias mudam. Você pode devolver o animal ao tutor original ou contatar nossa equipe para ajudar a encontrar um novo lar. Recomendamos sempre tentar resolver qualquer dificuldade antes de devolver, e nós podemos oferecer aconselhamento.'
    },
    {
      id: 'adocao-5',
      question: 'A adoção tem algum custo?',
      answer: 'A plataforma PetAdopt é gratuita! Porém, alguns tutores podem solicitar uma taxa de adoção para cobrir despesas veterinárias, vacinações e cuidados do animal. Essa informação estará clara no perfil do pet. Não há comissão nossa envolvida.'
    },
    {
      id: 'adocao-6',
      question: 'Como funciona a entrega do animal?',
      answer: 'Você e o tutor combinam o melhor local e horário para o encontro. Pode ser na casa do tutor, em um local público como um parque, ou em uma clínica veterinária. Nós recomendamos sempre encontrar em locais seguros. Você também pode solicitar um contrato de adoção para proteger ambas as partes.'
    }
  ],
  'Cadastro': [
    {
      id: 'cadastro-1',
      question: 'Como criar uma conta no PetAdopt?',
      answer: 'Clique em "Criar Conta" na página inicial. Você precisará fornecer: nome completo, email válido, telefone com WhatsApp e senha forte. Confirme seu email clicando no link enviado. Pronto! Sua conta está criada e você pode começar a procurar pets ou cadastrar os seus.'
    },
    {
      id: 'cadastro-2',
      question: 'Como verifico minha conta?',
      answer: 'A verificação é automática quando você confirma seu email. Para maior segurança, você pode fazer verificação em duas etapas nas configurações de segurança. Isso protege sua conta com um código que você receberá via SMS ou aplicativo autenticador.'
    },
    {
      id: 'cadastro-3',
      question: 'Posso editar meu perfil?',
      answer: 'Sim! Vá para Configurações > Meu Perfil para atualizar suas informações. Você pode mudar foto, bio, localização e preferências. As mudanças são salvas automaticamente. Se quiser cadastrar fotos dos seus pets, acesse a seção "Meus Pets".'
    },
    {
      id: 'cadastro-4',
      question: 'Como faço para deletar minha conta?',
      answer: 'Em Configurações > Privacidade > Deletar Conta. Você precisará confirmar sua senha. Aviso: essa ação é irreversível e removerá todos os seus dados, solicitações de adoção e pets cadastrados. Nós recomendamos contato prévio com o suporte se tiver dúvidas.'
    },
    {
      id: 'cadastro-5',
      question: 'Posso ter múltiplas contas?',
      answer: 'Uma pessoa pode ter apenas uma conta pessoal no PetAdopt. Se você tiver necessidades especiais (como gerenciar múltiplos refúgios), entre em contato conosco para opções de conta empresarial ou organizacional.'
    }
  ],
  'Geral': [
    {
      id: 'geral-1',
      question: 'O que é o PetAdopt?',
      answer: 'PetAdopt é uma plataforma digital que conecta pessoas dispostas a adotar com tutores que buscam um novo lar para seus pets. Nossa missão é facilitar adoções seguras, responsáveis e cheias de amor, dando uma segunda chance aos animais. Acreditamos que cada pet merece uma família amorosa.'
    },
    {
      id: 'geral-2',
      question: 'Em quantas cidades o PetAdopt está disponível?',
      answer: 'Começamos em São Paulo e estamos expandindo rapidamente para outras cidades. Você pode verificar na página inicial se o PetAdopt está disponível na sua região. Inscreva-se em nossa newsletter para ser notificado quando chegarmos em sua cidade!'
    },
    {
      id: 'geral-3',
      question: 'Existe um aplicativo móvel?',
      answer: 'Sim! O PetAdopt está disponível para iOS e Android. Você pode fazer download através da App Store ou Google Play. O app tem todas as funcionalidades do site e notificações em tempo real para novas solicitações de adoção.'
    },
    {
      id: 'geral-4',
      question: 'O PetAdopt está disponível em outros idiomas?',
      answer: 'Atualmente, o PetAdopt está disponível em Português (Brasil). Estamos trabalhando em suporte para Espanhol e Inglês em futuras versões. Se você gostaria de ajudar com tradução, entre em contato conosco!'
    },
    {
      id: 'geral-5',
      question: 'Como posso reportar um problema técnico?',
      answer: 'Se encontrar algum bug ou problema técnico, use a opção "Reportar um Problema" no menu principal ou envie um email para suporte@petadopt.com com detalhes e prints. Nós valorizamos seu feedback e resolvemos rapidamente!'
    }
  ],
  'Segurança': [
    {
      id: 'seguranca-1',
      question: 'Como meus dados são protegidos?',
      answer: 'Usamos criptografia SSL/TLS em todas as comunicações e armazenamos dados sensíveis com as práticas mais rigorosas de segurança. Seus dados pessoais nunca são vendidos a terceiros. Leia nossa Política de Privacidade completa para detalhes técnicos e direitos que você possui.'
    },
    {
      id: 'seguranca-2',
      question: 'Como funcionam os pagamentos de forma segura?',
      answer: 'Não armazenamos dados de cartão de crédito. Usamos gateways de pagamento certificados (PCI DSS Level 1) como Stripe e PayPal. Suas informações de pagamento são criptografadas e processadas apenas no servidor de pagamento seguro.'
    },
    {
      id: 'seguranca-3',
      question: 'Como reporto um perfil suspeito ou abuso?',
      answer: 'Se encontrar um perfil ou mensagem suspeita, clique em "Reportar" no perfil do usuário ou mensagem. Nosso time de moderação investiga todos os reports em até 24 horas. Você também pode enviar um email detalhado para seguranca@petadopt.com. Sua privacidade é mantida.'
    },
    {
      id: 'seguranca-4',
      question: 'E se eu for bloqueado por algum motivo?',
      answer: 'Se sua conta foi bloqueada, você receberá um email explicando o motivo. Geralmente é por violação dos termos de serviço. Você tem direito a contestar o bloqueio. Entre em contato com seguranca@petadopt.com e nós analisaremos seu caso em até 5 dias úteis.'
    }
  ]
};

const CATEGORY_EMOJIS = {
  'Adoção': '🐾',
  'Cadastro': '📝',
  'Geral': '❓',
  'Segurança': '🔐'
};

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState('Adoção');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedFAQ, setExpandedFAQ] = useState({});

  const breadcrumbs = [
    { label: 'Início', href: '/' },
    { label: 'FAQ', href: '/faq' }
  ];

  const categories = ['Adoção', 'Cadastro', 'Geral', 'Segurança'];

  // Filter FAQs by search term (case-insensitive)
  const filteredFAQs = useMemo(() => {
    if (!searchTerm.trim()) {
      return FAQ_DATA[activeCategory];
    }

    const lowerSearchTerm = searchTerm.toLowerCase();
    return FAQ_DATA[activeCategory].filter(faq =>
      faq.question.toLowerCase().includes(lowerSearchTerm) ||
      faq.answer.toLowerCase().includes(lowerSearchTerm)
    );
  }, [activeCategory, searchTerm]);

  const handleToggleFAQ = (faqId) => {
    setExpandedFAQ(prev => ({
      ...prev,
      [faqId]: !prev[faqId]
    }));
  };

  const handleCategoryChange = (category) => {
    setActiveCategory(category);
    setSearchTerm('');
    setExpandedFAQ({});
  };

  return (
    <Layout
      title="Perguntas Frequentes"
      breadcrumbs={breadcrumbs}
      showBreadcrumbs={true}
      showNavigation={false}
    >
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroContainer}>
          <h1 className={styles.heroTitle}>
            Perguntas Frequentes 🤔
          </h1>
          <p className={styles.heroDescription}>
            Encontre respostas para as dúvidas mais comuns sobre adoção, cadastro, 
            segurança e como usar a plataforma PetAdopt. Não encontrou sua resposta? 
            Entre em contato conosco!
          </p>
        </div>
      </section>

      {/* Search Section */}
      <section className={styles.searchSection}>
        <div className={styles.searchContainer}>
          {/* Search Box */}
          <div className={styles.searchBox}>
            <span className={styles.searchIcon}>🔍</span>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Busque sua pergunta..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Buscar perguntas frequentes"
            />
          </div>

          {/* Categories */}
          <div className={styles.categoriesSection}>
            {categories.map(category => (
              <button
                key={category}
                className={`${styles.categoryButton} ${activeCategory === category ? styles.active : ''}`}
                onClick={() => handleCategoryChange(category)}
                aria-pressed={activeCategory === category}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className={styles.mainContent}>
        <div className={styles.mainContainer}>
          {/* Category Title */}
          <h2 className={styles.categoryTitle}>
            <span className={styles.icon}>{CATEGORY_EMOJIS[activeCategory]}</span>
            {activeCategory}
          </h2>

          {/* FAQ Items or No Results */}
          {filteredFAQs.length > 0 ? (
            <div className={styles.faqList}>
              {filteredFAQs.map(faq => (
                <div
                  key={faq.id}
                  className={`${styles.faqItem} ${expandedFAQ[faq.id] ? styles.open : ''}`}
                >
                  <div
                    className={styles.faqQuestion}
                    onClick={() => handleToggleFAQ(faq.id)}
                    role="button"
                    tabIndex={0}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        handleToggleFAQ(faq.id);
                      }
                    }}
                    aria-expanded={expandedFAQ[faq.id]}
                  >
                    <h3 className={styles.faqQuestionText}>{faq.question}</h3>
                    <span className={styles.faqIcon}>▼</span>
                  </div>

                  <div className={styles.faqAnswer}>
                    <p className={styles.faqAnswerText}>{faq.answer}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.noResults}>
              <div className={styles.noResultsIcon}>😢</div>
              <h3 className={styles.noResultsTitle}>Nenhum resultado encontrado</h3>
              <p className={styles.noResultsText}>
                Não encontramos nenhuma pergunta correspondente. 
                Tente uma busca diferente ou entre em contato conosco para ajuda!
              </p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaContainer}>
          <h2 className={styles.ctaTitle}>
            Ainda tem dúvidas? 💚
          </h2>
          <p className={styles.ctaDescription}>
            Nossa equipe está pronta para ajudar. Entre em contato conosco via email, 
            WhatsApp ou telefone. Responderemos em até 24 horas!
          </p>
          <a href="/contato" className={styles.ctaButton}>
            Enviar uma Mensagem 📬
          </a>
        </div>
      </section>

      {/* Page Navigation */}
      <PageNavigation 
        previousPage={{ label: 'Contato', href: '/contato' }}
        nextPage={{ label: 'Como Adotar', href: '/processo-adocao' }}
      />
    </Layout>
  );
}
