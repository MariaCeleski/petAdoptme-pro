import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import SignInForm from '@/components/auth/SignInForm';
import Link from 'next/link';
import styles from '../auth.module.css';

export const metadata = {
  title: 'Fazer Login - PetAdopt',
  description: 'Faça login na PetAdopt para acessar sua conta e gerenciar pets.',
};

export default async function SignInPage({ searchParams }) {
  const session = await getServerSession(authOptions);
  
  // Se já está logado, redirecionar baseado no tipo de usuário
  if (session?.user) {
    const userType = session.user.type;
    let dashboardUrl = '/dashboard';
    
    if (userType === 'ADOPTER') {
      dashboardUrl = '/dashboard/adopter';
    } else if (userType === 'INDIVIDUAL_OWNER') {
      dashboardUrl = '/dashboard/owner';
    } else if (userType === 'SHELTER_ADMIN') {
      dashboardUrl = '/dashboard/shelter';
    }
    
    redirect(dashboardUrl);
  }

  // Await searchParams (Promise in Next.js 16)
  const params = await searchParams;
  
  // Para usuários não logados, permitir callback URL customizado ou dashboard padrão
  const callbackUrl = params?.callbackUrl || '/dashboard';
  const error = params?.error;
  const message = params?.message;

  return (
    <div className={`${styles.container} ${styles.containerSignIn}`}>
      <div className={styles.card}>
        {/* Icon */}
        <div className={styles.iconContainer}>
          <div className={styles.iconBadge}>
            <span className={styles.iconText}>🐕</span>
          </div>
        </div>

        {/* Header */}
        <h1 className={styles.title}>Fazer Login</h1>
        <p className={styles.description}>
          Entre na sua conta para acessar sua comunidade de pets
        </p>

        {/* Form */}
        <div className={styles.formContainer}>
          <SignInForm callbackUrl={callbackUrl} error={error} message={message} />
        </div>

        {/* Links */}
        <div className={styles.linksSection}>
          <div className={styles.linkText}>
            Não tem uma conta?{' '}
            <Link href="/auth/signup" className={styles.link}>
              Cadastre-se aqui
            </Link>
          </div>
          <div className={`${styles.linkText} ${styles.linkSecondary}`}>
            Esqueceu a senha?{' '}
            <Link href="/auth/forgot-password" className={styles.link}>
              Recuperar acesso
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}