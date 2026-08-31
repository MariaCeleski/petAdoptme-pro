'use client';

import { useState } from 'react';
import { validateEmail } from '@/lib/auth-utils';
import { Button, Input } from '@/components/ui';
import ClientOnly from '@/components/common/ClientOnly/ClientOnly';

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    
    // Limpar erro quando usuário começa a digitar
    if (errors.email) {
      setErrors({});
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validar email
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      newErrors.email = emailValidation.errors[0];
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.code === 'VALIDATION_ERROR') {
          setErrors({ email: result.error });
        } else {
          setErrors({ general: result.error || 'Erro ao solicitar redefinição' });
        }
        return;
      }

      // Sucesso - mostrar mensagem
      setIsSuccess(true);

    } catch (error) {
      console.error('Forgot password error:', error);
      setErrors({ 
        general: 'Erro inesperado. Tente novamente.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Renderização SSR segura - sem estado dinâmico
  const SSRFallback = () => (
    <div className="w-full max-w-md space-y-6">
      <form className="space-y-4">
        <Input
          label="Email"
          type="email"
          name="email"
          placeholder="Digite seu email cadastrado"
          required
        />

        <Button
          type="submit"
          variant="primary"
          fullWidth
        >
          Enviar Instruções
        </Button>
      </form>

      <div className="text-center">
        <p className="text-sm text-gray-600">
          Lembrou da senha?{' '}
          <a 
            href="/auth/signin" 
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Fazer login
          </a>
        </p>
      </div>
    </div>
  );

  const ClientContent = () => {
    if (isSuccess) {
      return (
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 text-green-600">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2v10a2 2 0 002 2z" 
                />
              </svg>
            </div>
            <h2 className="mt-4 text-xl font-bold text-gray-900">
              Email Enviado!
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Se este email estiver cadastrado, você receberá as instruções para redefinir sua senha.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-2">Próximos passos:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Verifique sua caixa de entrada</li>
                <li>Procure por spam ou lixo eletrônico</li>
                <li>Clique no link de redefinição</li>
                <li>Crie uma nova senha</li>
              </ol>
            </div>
          </div>

          <div className="text-center">
            <a
              href="/auth/signin"
              className="text-blue-600 hover:text-blue-500 text-sm font-medium"
            >
              Voltar ao Login
            </a>
          </div>
        </div>
      );
    }

    return (
      <div className="w-full max-w-md space-y-6">
        {errors.general && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-sm text-red-800">{errors.general}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            name="email"
            value={email}
            onChange={handleChange}
            placeholder="Digite seu email cadastrado"
            error={errors.email}
            required
            disabled={isLoading}
          />

          <Button
            type="submit"
            variant="primary"
            fullWidth
            loading={isLoading}
            disabled={isLoading}
          >
            Enviar Instruções
          </Button>
        </form>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Lembrou da senha?{' '}
            <a 
              href="/auth/signin" 
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Fazer login
            </a>
          </p>
        </div>
      </div>
    );
  };

  return (
    <ClientOnly fallback={<SSRFallback />}>
      <ClientContent />
    </ClientOnly>
  );
}