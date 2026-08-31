/**
 * Email Preferences Dashboard Page
 * 
 * Requirements: 8.4 (email template customization), 8.5 (unsubscribe option)
 */

import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import EmailPreferencesPanel from '../EmailPreferencesPanel';
import { authOptions } from '@/lib/auth';

export const metadata = {
  title: 'Preferências de Email - PetAdopt',
  description: 'Gerencie suas preferências de notificações por email',
};

export default async function EmailPreferencesPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/auth/login');
  }

  return (
    <div style={{ padding: '20px' }}>
      <EmailPreferencesPanel />
    </div>
  );
}
