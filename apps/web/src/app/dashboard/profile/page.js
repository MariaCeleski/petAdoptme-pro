import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma as prismaClient } from '@/lib/prisma';
import EditProfileForm from '@/components/dashboard/EditProfileForm';
import styles from './page.module.css';

export const metadata = {
  title: 'Editar Perfil - PetAdopt',
  description: 'Edite suas informações de perfil na PetAdopt.',
};

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  // Check authentication (Requirement 7.4)
  if (!session) {
    redirect('/auth/signin');
  }

  // Fetch user profile from database
  let user = null;
  try {
    user = await prismaClient.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        type: true,
        phone: true,
        location: true,
        createdAt: true,
      },
    });
  } catch (error) {
    console.error('Error fetching user:', error);
  }

  if (!user) {
    redirect('/auth/signin');
  }

  const typeLabel = {
    ADOPTER: 'Adotante',
    INDIVIDUAL_OWNER: 'Pessoa Física',
    SHELTER_ADMIN: 'Administrador de Abrigo',
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Editar Perfil</h1>
          <p className={styles.subtitle}>
            Atualize suas informações de perfil na PetAdopt
          </p>
        </div>
        <span className={styles.badge}>{typeLabel[user.type]}</span>
      </div>

      <div className={styles.content}>
        <div className={styles.formWrapper}>
          <EditProfileForm user={user} />
        </div>

        {/* Information Card */}
        <div className={styles.infoCard}>
          <h3 className={styles.infoTitle}>Informações da Conta</h3>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>ID do Usuário:</span>
              <code className={styles.infoValue}>{user.id}</code>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Tipo de Conta:</span>
              <span className={styles.infoValue}>{typeLabel[user.type]}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Membro desde:</span>
              <span className={styles.infoValue}>
                {new Date(user.createdAt).toLocaleDateString('pt-BR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Help Card */}
        <div className={styles.helpCard}>
          <h3 className={styles.helpTitle}>Precisa de Ajuda?</h3>
          <ul className={styles.helpList}>
            <li>
              <strong>Nome:</strong> Seu nome completo que será exibido na plataforma
            </li>
            <li>
              <strong>Email:</strong> Seu endereço de email para notificações e login
            </li>
            <li>
              <strong>Telefone:</strong> Seu número de telefone para contato (opcional)
            </li>
            <li>
              <strong>Localização:</strong> Sua cidade e estado para encontrar pets próximos (opcional)
            </li>
            <li>
              <strong>Avatar:</strong> Sua foto de perfil em JPEG, PNG ou WebP (máximo 5MB)
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
