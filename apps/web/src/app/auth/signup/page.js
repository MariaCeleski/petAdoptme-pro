import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import SignUpForm from '@/components/auth/SignUpForm';
import Link from 'next/link';
import styles from '../auth.module.css';

export const metadata = {
  title: 'Criar Conta - PetAdopt',
  description: 'Crie sua conta na PetAdopt para começar a adotar ou cadastrar pets.',
};

export default async function SignUpPage() {
  const session = await getServerSession(authOptions);
  
  // Se já está logado, redirecionar para dashboard
  if (session) {
    redirect('/dashboard');
  }

  return (
    <div className={`${styles.container} ${styles.containerSignUp}`}>
      <div className={styles.card}>
        {/* Icon */}
        <div className={styles.iconContainer}>
          <div className={styles.iconBadge}>
            <span className={styles.iconText}>🐾</span>
          </div>
        </div>

        {/* Header */}
        <h1 className={styles.title}>Criar Conta</h1>
        <p className={styles.description}>
          Cadastre-se para começar sua jornada adotando pets
        </p>

        {/* Form */}
        <div className={styles.formContainer}>
          <SignUpForm />
        </div>

        {/* Links */}
        <div className={styles.linksSection}>
          <div className={styles.linkText}>
            Já tem uma conta?{' '}
            <Link href="/auth/signin" className={styles.link}>
              Faça login aqui
            </Link>
          </div>
          <div className={`${styles.linkText} ${styles.linkSecondary}`}>
            Ao se cadastrar, você concorda com nossos{' '}
            <Link href="/terms" className={styles.link}>
              Termos de Serviço
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}