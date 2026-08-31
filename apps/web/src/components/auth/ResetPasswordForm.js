'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { validatePasswordStrength } from '@/lib/auth-utils';
import { Button, Input } from '@/components/ui';

export default function ResetPasswordForm({ token, email }) {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  // Validar token ao carregar o componente
  useEffect(() => {
    const validateToken = async () => {
      if (!token || !email) {
        setErrors({ general: 'Link inválido. Solicite uma nova redefinição de senha.' });
        setIsValidating(false);
        return;
      }

      try {
        const response = await fetch(`/api/auth/reset-password?token=${token}&email=${encodeURIComponent(email)}`);
        const result = await response.json();

        if (!response.ok) {
          setErrors({ general: result.error || 'Token inválido ou expirado' });
        } else {
          setIsTokenValid(true);
        }
      } catch (error) {
        console.error('Token validation error:', error);
        setErrors({ general: 'Erro ao validar token. Tente novamente.' });
      } finally {
        setIsValidating(false);
      }
    };

    validateToken();
  }, [token, email]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpar erro específico quando usuário começa a digitar
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    // Calcular força da senha em tempo real
    if (name === 'password') {
      const validation = validatePasswordStrength(value);
      setPasswordStrength(validation.strength);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validar senha
    const passwordValidation = validatePasswordStrength(formData.password);
    if (!passwordValidation.isValid) {
      newErrors.password = passwordValidation.errors[0];
    }

    // Validar confirmação de senha
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirmação de senha é obrigatória';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Senhas não coincidem';
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
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          email,
          password: formData.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.code === 'INVALID_TOKEN') {
          setErrors({ general: 'Token inválido ou expirado. Solicite uma nova redefinição.' });
        } else if (result.code === 'VALIDATION_ERROR') {
          setErrors({ general: result.error });
        } else {
          setErrors({ general: result.error || 'Erro ao redefinir senha' });
        }
        return;
      }

      // Sucesso - mostrar mensagem e redirecionar
      setIsSuccess(true);
      
      // Redirecionar após 3 segundos
      setTimeout(() => {
        router.push('/auth/signin?message=password-reset-success');
      }, 3000);

    } catch (error) {
      console.error('Reset password error:', error);
      setErrors({ 
        general: 'Erro inesperado. Tente novamente.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrengthColor = (strength) => {
    switch (strength) {
      case 0: case 1: return 'bg-red-400';
      case 2: return 'bg-yellow-400';
      case 3: return 'bg-blue-400';
      case 4: return 'bg-green-400';
      default: return 'bg-gray-300';
    }
  };

  const getPasswordStrengthText = (strength) => {
    switch (strength) {
      case 0: case 1: return 'Fraca';
      case 2: return 'Regular';
      case 3: return 'Boa';
      case 4: return 'Forte';
      default: return '';
    }
  };

  // Estado de carregamento/validação do token
  if (isValidating) {
    return (
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="flex justify-center">
          <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <p className="text-gray-600">Validando link de redefinição...</p>
      </div>
    );
  }

  // Token inválido
  if (!isTokenValid) {
    return (
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="mx-auto h-12 w-12 text-red-600">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" 
            />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900">Link Inválido</h2>
        <p className="text-sm text-gray-600">
          {errors.general}
        </p>
        <div className="space-y-3">
          <a
            href="/auth/forgot-password"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Solicitar Nova Redefinição
          </a>
          <a
            href="/auth/signin"
            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Voltar ao Login
          </a>
        </div>
      </div>
    );
  }

  // Sucesso
  if (isSuccess) {
    return (
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="mx-auto h-12 w-12 text-green-600">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
            />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900">Senha Redefinida!</h2>
        <p className="text-sm text-gray-600">
          Sua senha foi redefinida com sucesso. Você será redirecionado para o login.
        </p>
        <div className="flex justify-center">
          <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
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
        {/* Campo Senha */}
        <div>
          <Input
            label="Nova Senha"
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Mínimo 8 caracteres"
            error={errors.password}
            required
            disabled={isLoading}
            icon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-gray-600"
                disabled={isLoading}
              >
                {showPassword ? (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L9.878 9.878zM21.122 21.122L3 3" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            }
            iconPosition="right"
          />
          
          {/* Indicador de força da senha */}
          {formData.password && (
            <div className="mt-2">
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-gray-200 rounded-full h-1">
                  <div 
                    className={`h-1 rounded-full transition-all duration-300 ${getPasswordStrengthColor(passwordStrength)}`}
                    style={{ width: `${(passwordStrength / 4) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-gray-600">
                  {getPasswordStrengthText(passwordStrength)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Campo Confirmação de Senha */}
        <Input
          label="Confirmar Nova Senha"
          type={showConfirmPassword ? 'text' : 'password'}
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="Digite a senha novamente"
          error={errors.confirmPassword}
          required
          disabled={isLoading}
          icon={
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="text-gray-400 hover:text-gray-600"
              disabled={isLoading}
            >
              {showConfirmPassword ? (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L9.878 9.878zM21.122 21.122L3 3" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          }
          iconPosition="right"
        />

        {/* Botão de Reset */}
        <Button
          type="submit"
          variant="primary"
          fullWidth
          loading={isLoading}
          disabled={isLoading}
        >
          Redefinir Senha
        </Button>
      </form>
    </div>
  );
}