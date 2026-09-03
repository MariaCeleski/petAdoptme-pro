import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import PendingPetsPage from './PendingPetsPage';

export const metadata = {
  title: 'Pets Aguardando Aprovação | Admin - PetAdopt',
  description: 'Gerencie pets aguardando aprovação para adoção',
};

export default async function Page() {
  // Check session on server
  const session = await getServerSession(authOptions);

  // Redirect if not authenticated
  if (!session) {
    redirect('/auth/signin');
  }

  // Redirect if not admin
  if (session.user?.role !== 'admin') {
    redirect('/');
  }

  return <PendingPetsPage />;
}
