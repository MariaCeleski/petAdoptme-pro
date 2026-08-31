'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { validateEmail, validatePasswordStrength } from '@/lib/auth-utils';
import { Button, Input, Select } from '@/components/ui';
import PasswordInput from './PasswordInput';

export default function SignUpForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    type: 'ADOPTER',
    acceptTerms: false,
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [successMessage, setSuccessMessage] = useState('');
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({ ...prev, [name]: newValue }));
    
    // Limpar erro específico quando usuário começa a digitar
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    // Calcular força da senha em tempo real
    if (name === 'password') {
      const validation = validatePasswordStrength(newValue);
      setPasswordStrength(validation.strength);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validar nome
    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Nome deve ter pelo menos 2 caracteres';
    }

    // Validar email
    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.isValid) {
      newErrors.email = emailValidation.errors[0];
    }

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

    // Validar tipo de usuário
    if (!['ADOPTER', 'INDIVIDUAL_OWNER', 'SHELTER_ADMIN'].includes(formData.type)) {
      newErrors.type = 'Tipo de usuário inválido';
    }

    // Validar termos
    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'Você deve aceitar os termos de uso';
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
      // Chamar API de registro
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.toLowerCase().trim(),
          password: formData.password,
          type: formData.type,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.code === 'USER_EXISTS') {
          setErrors({ email: 'Este email já está cadastrado' });
        } else if (result.code === 'VALIDATION_ERROR') {
          setErrors({ general: result.error });
        } else {
          setErrors({ general: result.error || 'Erro ao criar conta' });
        }
        return;
      }

      // ✅ Sucesso! Mostrar mensagem e redirecionar
      console.log('✅ Cadastro bem-sucedido:', result.user);
      
      // Mostrar mensagem de sucesso na UI
      setSuccessMessage(`🎉 Bem-vindo, ${result.user.name}! Sua conta foi criada com sucesso!`);
      
      // Mostrar alerta também
      alert(`✅ Conta criada com sucesso!\n\nBem-vindo, ${result.user.name}!\n\nVocê será redirecionado para verificar seu email.`);
      
      // Redirecionar após 2 segundos
      setTimeout(() => {
        router.push(`/auth/verify-request?email=${encodeURIComponent(formData.email)}`);
      }, 2000);

    } catch (error) {
      console.error('Registration error:', error);
      setErrors({ 
        general: 'Erro inesperado. Tente novamente.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setIsLoading(true);
    try {
      await signIn('google', { callbackUrl: '/dashboard' });
    } catch (error) {
      console.error('Google signup error:', error);
      setErrors({ 
        general: 'Erro ao cadastrar com Google.' 
      });
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

  return (
    <div className="w-full max-w-md space-y-6">
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex gap-3">
            <span className="text-2xl">✅</span>
            <div>
              <p className="font-semibold text-green-800">{successMessage}</p>
              <p className="text-sm text-green-700 mt-1">Você será redirecionado em instantes...</p>
            </div>
          </div>
        </div>
      )}

      {errors.general && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-800">{errors.general}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Campo Nome */}
        <Input
          label="Nome Completo"
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Seu nome completo"
          error={errors.name}
          required
          disabled={isLoading}
        />

        {/* Campo Email */}
        <Input
          label="Email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="seu@email.com"
          error={errors.email}
          required
          disabled={isLoading}
        />

        {/* Campo Tipo de Usuário */}
        <Select
          label="Tipo de Conta"
          value={formData.type}
          onChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
          options={[
            { value: 'ADOPTER', label: 'Adotante - Quero adotar pets' },
            { value: 'INDIVIDUAL_OWNER', label: 'Pessoa Física - Vou cadastrar pets para adoção' },
            { value: 'SHELTER_ADMIN', label: 'Abrigo/ONG - Administro uma instituição' }
          ]}
          error={errors.type}
          required
          disabled={isLoading}
        />

        {/* Campo Senha */}
        <div>
          <PasswordInput
            label="Senha"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Mínimo 8 caracteres"
            error={errors.password}
            required
            disabled={isLoading}
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
        <PasswordInput
          label="Confirmar Senha"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="Digite a senha novamente"
          error={errors.confirmPassword}
          required
          disabled={isLoading}
        />

        {/* Checkbox Termos */}
        <div>
          <label className="flex items-start">
            <input
              type="checkbox"
              name="acceptTerms"
              checked={formData.acceptTerms}
              onChange={handleChange}
              className={`mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 ${
                errors.acceptTerms ? 'border-red-300' : ''
              }`}
              required
              disabled={isLoading}
            />
            <span className="ml-2 text-sm text-gray-600">
              Eu aceito os{' '}
              <a href="/termos" target="_blank" className="text-blue-600 hover:text-blue-500">
                Termos de Uso
              </a>{' '}
              e a{' '}
              <a href="/privacidade" target="_blank" className="text-blue-600 hover:text-blue-500">
                Política de Privacidade
              </a>
            </span>
          </label>
          {errors.acceptTerms && (
            <p className="mt-1 text-sm text-red-600">{errors.acceptTerms}</p>
          )}
        </div>

        {/* Botão de Cadastro */}
        <Button
          type="submit"
          variant="primary"
          fullWidth
          loading={isLoading}
          disabled={isLoading}
        >
          Criar Conta
        </Button>
      </form>

      {/* Divisor */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">ou</span>
        </div>
      </div>

      {/* Botão Google */}
      <Button
        type="button"
        variant="outline"
        fullWidth
        onClick={handleGoogleSignUp}
        disabled={isLoading}
        icon={
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
        }
        iconPosition="left"
      >
        Cadastrar com Google
      </Button>
    </div>
  );
}