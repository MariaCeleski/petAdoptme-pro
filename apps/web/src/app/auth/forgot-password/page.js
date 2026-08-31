import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';
import Link from 'next/link';
import styles from '../auth.module.css';

export const metadata = {
  title: 'Esqueci a Senha - PetAdopt',
  description: 'Solicite a redefinição de sua senha na PetAdopt.',
};

export default async function ForgotPasswordPage() {
  const session = await getServerSession(authOptions);
  
  // Se já está logado, redirecionar para dashboard
  if (session) {
    redirect('/dashboard');
  }

  return (
    <div className={`${styles.container} ${styles.containerForgot}`}>
      <div className={styles.card}>
        {/* Icon */}
        <div className={styles.iconContainer}>
          <div className={styles.iconBadge}>
            <span className={styles.iconText}>🔑</span>
          </div>
        </div>

        {/* Header */}
        <h1 className={styles.title}>Recuperar Acesso</h1>
        <p className={styles.description}>
          Digite seu email para receber as instruções de redefinição de senha
        </p>

        {/* Form */}
        <div className={styles.formContainer}>
          <ForgotPasswordForm />
        </div>

        {/* Links */}
        <div className={styles.linksSection}>
          <div className={styles.linkText}>
            Lembrou a senha?{' '}
            <Link href="/auth/signin" className={styles.link}>
              Fazer login
            </Link>
          </div>
          <div className={`${styles.linkText} ${styles.linkSecondary}`}>
            Não tem uma conta?{' '}
            <Link href="/auth/signup" className={styles.link}>
              Cadastre-se aqui
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}