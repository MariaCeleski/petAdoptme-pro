import Link from 'next/link';
import { Button } from '@/components/ui';

const errorMessages = {
  Configuration: 'Erro na configuração do servidor.',
  AccessDenied: 'Acesso negado. Você não tem permissão para fazer login.',
  Verification: 'Token de verificação inválido ou expirado.',
  Default: 'Ocorreu um erro durante a autenticação.',
  Signin: 'Erro ao fazer login.',
  OAuthSignin: 'Erro ao iniciar login com provedor externo.',
  OAuthCallback: 'Erro no callback do provedor externo.',
  OAuthCreateAccount: 'Erro ao criar conta com provedor externo.',
  EmailCreateAccount: 'Erro ao criar conta com email.',
  Callback: 'Erro no callback de autenticação.',
  OAuthAccountNotLinked: 'Esta conta de email já está sendo usada com um método de login diferente.',
  EmailSignin: 'Erro ao enviar email de verificação.',
  CredentialsSignin: 'Credenciais inválidas. Verifique seu email e senha.',
  SessionRequired: 'Você precisa estar logado para acessar esta página.',
};

export const metadata = {
  title: 'Erro de Autenticação - PetAdopt',
  description: 'Ocorreu um erro durante o processo de autenticação.',
};

export default function AuthErrorPage({ searchParams }) {
  const error = searchParams?.error;
  const errorMessage = errorMessages[error] || errorMessages.Default;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <Link href="/" className="inline-block">
            <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" 
                />
              </svg>
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            Erro de Autenticação
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            {errorMessage}
          </p>
        </div>

        <div className="space-y-4">
          <Button
            as="link" 
            href="/auth/signin"
            variant="primary"
            fullWidth
          >
            Tentar Fazer Login Novamente
          </Button>
          
          <Button
            as="link"
            href="/"
            variant="outline"
            fullWidth
          >
            Voltar ao Início
          </Button>
        </div>

        {error && (
          <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-xs text-red-600">
              Código do erro: {error}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}