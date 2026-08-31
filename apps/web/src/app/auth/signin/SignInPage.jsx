'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './signin.module.css';

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Email ou senha incorretos');
      } else if (result?.ok) {
        router.push('/dashboard');
      }
    } catch (err) {
      setError('Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    signIn('google', { redirect: true, callbackUrl: '/dashboard' });
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>🐾 PetAdopt</h1>
        <h2 className={styles.subtitle}>Fazer Login</h2>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              disabled={loading}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="password">Senha</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={loading}
            />
          </div>

          <button type="submit" disabled={loading} className={styles.button}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className={styles.divider}>ou</div>

        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className={styles.googleButton}
        >
          Login com Google
        </button>

        <p className={styles.footer}>
          Não tem conta? <Link href="/auth/signup">Criar conta</Link>
        </p>
      </div>
    </div>
  );
}
