'use client';

import { useState } from 'react';
import Layout from '@/components/common/Layout';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import PageNavigation from '@/components/common/PageNavigation/PageNavigation';
import styles from './contato.module.css';

export default function ContatoPage() {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    assunto: '',
    mensagem: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const breadcrumbs = [
    { label: 'Início', href: '/' },
    { label: 'Contato', href: '/contato' }
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simular envio
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    alert('Mensagem enviada com sucesso! Retornaremos em breve.');
    setFormData({ nome: '', email: '', telefone: '', assunto: '', mensagem: '' });
    setIsSubmitting(false);
  };

  return (
    <Layout 
      title="Entre em Contato" 
      breadcrumbs={breadcrumbs}
      showBreadcrumbs={true}
      showNavigation={false}
    >
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroContainer}>
          <h1 className={styles.heroTitle}>
            Vamos Conversar? 💬
          </h1>
          <p className={styles.heroDescription}>
            Tem dúvidas sobre adoção, quer cadastrar um pet ou sugerir melhorias? 
            Estamos aqui para ouvir você. Entre em contato e vamos juntos fazer a diferença! 🐾
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className={styles.mainContent}>
        <div className={styles.mainContainer}>
          <div className={styles.contentGrid}>
            {/* Contact Info */}
            <div className={styles.contactInfoSection}>
              <div className={`${styles.contactCard} ${styles.email}`}>
                <div className={styles.contactIcon}>📧</div>
                <div className={styles.contactContent}>
                  <p className={styles.contactLabel}>Email</p>
                  <p className={styles.contactValue}>contato@petadopt.com</p>
                </div>
              </div>

              <div className={`${styles.contactCard} ${styles.whatsapp}`}>
                <div className={styles.contactIcon}>💬</div>
                <div className={styles.contactContent}>
                  <p className={styles.contactLabel}>WhatsApp</p>
                  <p className={styles.contactValue}>(11) 99999-9999</p>
                </div>
              </div>

              <div className={`${styles.contactCard} ${styles.schedule}`}>
                <div className={styles.contactIcon}>🕒</div>
                <div className={styles.contactContent}>
                  <p className={styles.contactLabel}>Horário de Atendimento</p>
                  <p className={styles.contactValue}>Segunda à Sexta, 8h às 18h</p>
                </div>
              </div>

              {/* Tips Section */}
              <div className={styles.tipsSection}>
                <h3 className={styles.tipsSectionTitle}>💡 Dicas Importantes</h3>
                <ul className={styles.tipsList}>
                  <li className={styles.tipItem}>Seja específico sobre o tipo de pet que busca</li>
                  <li className={styles.tipItem}>Mencione se tem experiência com animais</li>
                  <li className={styles.tipItem}>Informe o espaço disponível em sua casa</li>
                  <li className={styles.tipItem}>Conte sobre sua rotina diária</li>
                </ul>
              </div>
            </div>

            {/* Form Section */}
            <div className={styles.formSection}>
              <h2 className={styles.formTitle}>📝 Envie sua Mensagem</h2>
              
              <form onSubmit={handleSubmit}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Nome Completo <span className={styles.required}>*</span>
                  </label>
                  <input
                    className={styles.formInput}
                    type="text"
                    name="nome"
                    value={formData.nome}
                    onChange={handleChange}
                    placeholder="Como podemos te chamar?"
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    E-mail <span className={styles.required}>*</span>
                  </label>
                  <input
                    className={styles.formInput}
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="seu@email.com"
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Telefone / WhatsApp
                  </label>
                  <input
                    className={styles.formInput}
                    type="tel"
                    name="telefone"
                    value={formData.telefone}
                    onChange={handleChange}
                    placeholder="(11) 99999-9999"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Assunto <span className={styles.required}>*</span>
                  </label>
                  <input
                    className={styles.formInput}
                    type="text"
                    name="assunto"
                    value={formData.assunto}
                    onChange={handleChange}
                    placeholder="Sobre o que você gostaria de falar?"
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Mensagem <span className={styles.required}>*</span>
                  </label>
                  <textarea
                    className={styles.formTextarea}
                    name="mensagem"
                    value={formData.mensagem}
                    onChange={handleChange}
                    placeholder="Conte-nos mais detalhes..."
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  size="large" 
                  fullWidth 
                  loading={isSubmitting}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Enviando...' : 'Enviar Mensagem 🚀'}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className={styles.benefitsSection}>
        <div className={styles.benefitsContainer}>
          <h2 className={styles.benefitsTitle}>
            Por que nos <span className={styles.highlight}>Contactar?</span>
          </h2>
          
          <div className={styles.benefitsGrid}>
            <div className={styles.benefitCard}>
              <span className={styles.benefitIcon}>⚡</span>
              <h3 className={styles.benefitTitle}>Resposta Rápida</h3>
              <p className={styles.benefitDescription}>
                Respondemos mensagens em até 24h. Queremos ajudar você rápido!
              </p>
            </div>

            <div className={styles.benefitCard}>
              <span className={styles.benefitIcon}>🤝</span>
              <h3 className={styles.benefitTitle}>Atendimento Personalizado</h3>
              <p className={styles.benefitDescription}>
                Entendemos sua situação específica e oferecemos orientação customizada.
              </p>
            </div>

            <div className={styles.benefitCard}>
              <span className={styles.benefitIcon}>💚</span>
              <h3 className={styles.benefitTitle}>Foco no Bem-estar</h3>
              <p className={styles.benefitDescription}>
                Priorizamos sempre o bem-estar dos animais e a segurança das famílias.
              </p>
            </div>

            <div className={styles.benefitCard}>
              <span className={styles.benefitIcon}>📞</span>
              <h3 className={styles.benefitTitle}>Multi-canal</h3>
              <p className={styles.benefitDescription}>
                Entre em contato por email, WhatsApp ou telefone. Escolha o melhor para você!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className={styles.faqSection}>
        <div className={styles.faqContainer}>
          <h2 className={styles.faqTitle}>
            Perguntas Frequentes 🤔
          </h2>
          
          <div className={styles.faqGrid}>
            <div className={styles.faqItem}>
              <h4 className={styles.faqQuestion}>Como adotar um pet?</h4>
              <p className={styles.faqAnswer}>
                Navegue pelos pets disponíveis, escolha um que combine com você, envie uma solicitação de adoção e nosso time entrará em contato.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4 className={styles.faqQuestion}>Posso cadastrar meu pet?</h4>
              <p className={styles.faqAnswer}>
                Sim! Crie uma conta, vá até sua dashboard e cadastre pets para adoção de forma gratuita e segura.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4 className={styles.faqQuestion}>A adoção tem custo?</h4>
              <p className={styles.faqAnswer}>
                A plataforma é gratuita. Alguns pets podem ter taxa de adoção para cobrir cuidados veterinários.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4 className={styles.faqQuestion}>Como funciona a aprovação?</h4>
              <p className={styles.faqAnswer}>
                O tutor atual avalia seu perfil e decide sobre a adoção baseado no bem-estar do animal. Você será notificado.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4 className={styles.faqQuestion}>Quanto tempo leva o processo?</h4>
              <p className={styles.faqAnswer}>
                Geralmente de 3 a 7 dias. Você pode contatar o tutor direto pelo WhatsApp para agilizar.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4 className={styles.faqQuestion}>E se tiver mais dúvidas?</h4>
              <p className={styles.faqAnswer}>
                Não deixe de nos contactar! Estamos sempre prontos para ajudar. Use o formulário acima! 😊
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaContainer}>
          <h2 className={styles.ctaTitle}>
            Pronto para Fazer Parte de Nossa Comunidade? 💚
          </h2>
          <p className={styles.ctaDescription}>
            Seja para adotar, cadastrar um pet ou apenas conversar sobre nossas iniciativas, 
            estamos aqui para ajudar. Vamos juntos dar uma segunda chance aos nossos amigos peludos!
          </p>
          <Button size="large" variant="outline">
            Enviar Mensagem Agora 📬
          </Button>
        </div>
      </section>

      {/* Page Navigation */}
      <PageNavigation 
        previousPage={{ label: 'Sobre Nós', href: '/sobre' }}
        nextPage={{ label: 'Termos de Serviço', href: '/termos' }}
      />
    </Layout>
  );
}
