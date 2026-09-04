'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import SignUpForm from '@/components/auth/SignUpForm';
import styles from './signup.module.css';

export default function SignUpPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <span className={styles.logo}>🐾</span>
          <h1 className={styles.title}>Junte-se a Nós</h1>
          <p className={styles.subtitle}>
            Crie sua conta e comece a adotar seus pets favoritos
          </p>
        </div>

        <SignUpForm onSuccess={() => router.push('/auth/signin')} />
      </div>
    </div>
  );
}
