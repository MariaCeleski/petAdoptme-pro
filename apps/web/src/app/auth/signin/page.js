'use client';

import SignInForm from '@/components/auth/SignInForm';
import styles from './signin.module.css';

export const metadata = {
  title: 'Fazer Login | PetAdopt',
  description: 'Entre em sua conta PetAdopt para cadastrar ou adotar pets',
};

export default function SignInPage() {
  return (
    <div className={styles.container}>
      {/* Floating circles for decoration */}
      <div className={styles.card}>
        <div className={styles.header}>
          <span className={styles.logo}>🔐</span>
          <h1 className={styles.title}>Bem-vindo</h1>
          <p className={styles.subtitle}>
            Entre em sua conta para cadastrar ou adotar seus pets favoritos
          </p>
        </div>

        <SignInForm callbackUrl="/tutores/cadastrar" />
      </div>
    </div>
  );
}
