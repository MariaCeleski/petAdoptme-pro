'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './SignInForm.module.css';

export default function SignInForm({ callbackUrl = '/dashboard' }) {
  const [email, setEmail] = useState('maria1788227391@example.com');
  const [password, setPassword] = useState('Test123456');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    setError('');

    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      
      setMessage('🔄 Conectando...');
      
      const response = await fetch(`${backendUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao fazer login');
      }

      setMessage('💾 Salvando dados...');
      
      if (result.token) {
        localStorage.setItem('authToken', result.token);
        setMessage('✅ Bem-vindo! Redirecionando...');
        
        setTimeout(() => {
          router.push(callbackUrl);
        }, 800);
      } else {
        throw new Error('Nenhum token recebido');
      }
    } catch (err) {
      console.error('Erro:', err);
      setError(err.message || 'Erro ao fazer login');
      setMessage('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = () => {
    router.push('/auth/signup');
  };

  const handleForgotPassword = () => {
    router.push('/auth/forgot-password');
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {/* Email */}
      <div className={styles.formGroup}>
        <label className={styles.label}>📧 Email</label>
        <input
          type="email"
          className={styles.input}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="seu@email.com"
          disabled={isLoading}
          required
        />
      </div>

      {/* Password */}
      <div className={styles.formGroup}>
        <label className={styles.label}>🔐 Senha</label>
        <input
          type="password"
          className={styles.input}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Sua senha"
          disabled={isLoading}
          required
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className={styles.submitButton}
      >
        {isLoading ? '⏳ Entrando...' : '🚀 Entrar'}
      </button>

      {/* Messages */}
      {message && (
        <div className={`${styles.messageContainer} ${styles.infoMessage}`}>
          {message}
        </div>
      )}

      {error && (
        <div className={`${styles.messageContainer} ${styles.errorMessage}`}>
          {error}
        </div>
      )}

      {/* Links */}
      <div className={styles.links}>
        <button
          type="button"
          className={styles.link}
          onClick={handleForgotPassword}
        >
          Esqueceu a senha?
        </button>
      </div>

      {/* Divider */}
      <div className={styles.divider}>
        <div className={styles.dividerText}>Novo por aqui?</div>
      </div>

      {/* Sign Up Link */}
      <div className={styles.footer}>
        Não tem conta?{' '}
        <button
          type="button"
          className={styles.footerLink}
          onClick={handleSignUp}
        >
          Criar Conta
        </button>
      </div>
    </form>
  );
}
