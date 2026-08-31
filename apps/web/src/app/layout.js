import { Inter, Poppins } from 'next/font/google';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import AuthProvider from '@/components/auth/AuthProvider';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const poppins = Poppins({
  subsets: ['latin'],
  variable: '--font-poppins',
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

export const metadata = {
  title: 'PetAdopt - Encontre seu Companheiro Perfeito',
  description: 'Plataforma de adoção responsável que conecta pets abandonados com famílias amorosas. Adote com amor, mude uma vida.',
  keywords: 'adoção, pets, cães, gatos, animais, abrigo, adoção responsável',
  authors: [{ name: 'PetAdopt Team' }],
  openGraph: {
    title: 'PetAdopt - Adoção Responsável de Pets',
    description: 'Conectamos corações e transformamos vidas. Encontre seu melhor amigo.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PetAdopt - Adoção Responsável de Pets',
    description: 'Conectamos corações e transformamos vidas. Encontre seu melhor amigo.',
  }
};

export default async function RootLayout({ children }) {
  // Obter sessão no servidor para hidratação
  const session = await getServerSession(authOptions);

  return (
    <html lang="pt-BR" className={`${inter.variable} ${poppins.variable}`} suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <AuthProvider session={session}>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
