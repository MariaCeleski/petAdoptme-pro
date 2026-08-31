import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.footerContent}>
          {/* Logo e Descrição */}
          <div className={styles.brand}>
            <Link href="/" className={styles.logo}>
              <span className={styles.logoEmoji}>🐾</span>
              <span className={styles.logoText}>PetAdopt</span>
            </Link>
            <p className={styles.description}>
              Conectando corações e transformando vidas. Encontre seu melhor amigo ou ajude um pet a encontrar uma nova família.
            </p>
            <div className={styles.socialLinks}>
              <a href="#" className={styles.socialLink} aria-label="Facebook">
                📘
              </a>
              <a href="#" className={styles.socialLink} aria-label="Instagram">
                📷
              </a>
              <a href="#" className={styles.socialLink} aria-label="Twitter">
                🐦
              </a>
              <a href="#" className={styles.socialLink} aria-label="YouTube">
                📺
              </a>
            </div>
          </div>

          {/* Links Rápidos */}
          <div className={styles.linkGroup}>
            <h3 className={styles.linkTitle}>Adoção</h3>
            <ul className={styles.linkList}>
              <li><Link href="/pets" className={styles.link}>Ver Pets</Link></li>
              <li><Link href="/pets/caes" className={styles.link}>Cães</Link></li>
              <li><Link href="/pets/gatos" className={styles.link}>Gatos</Link></li>
              <li><Link href="/processo-adocao" className={styles.link}>Como Adotar</Link></li>
            </ul>
          </div>

          {/* Para Tutores */}
          <div className={styles.linkGroup}>
            <h3 className={styles.linkTitle}>Para Tutores</h3>
            <ul className={styles.linkList}>
              <li><Link href="/tutores/cadastrar" className={styles.link}>Cadastrar Pet</Link></li>
              <li><Link href="/dashboard" className={styles.link}>Meus Pets</Link></li>
              <li><Link href="/solicitacoes" className={styles.link}>Solicitações</Link></li>
              <li><Link href="/dicas" className={styles.link}>Dicas de Cuidado</Link></li>
            </ul>
          </div>

          {/* Suporte */}
          <div className={styles.linkGroup}>
            <h3 className={styles.linkTitle}>Suporte</h3>
            <ul className={styles.linkList}>
              <li><Link href="/sobre" className={styles.link}>Sobre Nós</Link></li>
              <li><Link href="/contato" className={styles.link}>Contato</Link></li>
              <li><Link href="/faq" className={styles.link}>FAQ</Link></li>
              <li><Link href="/termos" className={styles.link}>Termos de Uso</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className={styles.newsletter}>
            <h3 className={styles.linkTitle}>Newsletter</h3>
            <p className={styles.newsletterText}>
              Receba novidades sobre pets disponíveis e dicas de cuidados.
            </p>
            <form className={styles.newsletterForm}>
              <input 
                type="email" 
                placeholder="Seu e-mail"
                className={styles.newsletterInput}
              />
              <button type="submit" className={styles.newsletterBtn}>
                Inscrever-se
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className={styles.bottomBar}>
          <div className={styles.copyright}>
            <p>&copy; {currentYear} PetAdopt. Todos os direitos reservados.</p>
          </div>
          <div className={styles.bottomLinks}>
            <Link href="/privacidade" className={styles.bottomLink}>
              Privacidade
            </Link>
            <Link href="/cookies" className={styles.bottomLink}>
              Cookies
            </Link>
            <Link href="/acessibilidade" className={styles.bottomLink}>
              Acessibilidade
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
