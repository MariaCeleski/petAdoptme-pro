import Link from 'next/link';
import styles from './verify-request.module.css';

export const metadata = {
  title: 'Verificação de Email - PetAdopt',
  description: 'Verifique seu email para completar o registro e começar a adotar.',
};

export default function VerifyRequestPage({ searchParams }) {
  const email = searchParams?.email;

  const steps = [
    {
      number: 1,
      text: 'Verifique sua caixa de entrada principal'
    },
    {
      number: 2,
      text: 'Procure por emails de spam ou lixo eletrônico'
    },
    {
      number: 3,
      text: 'Clique no link de verificação no email'
    },
    {
      number: 4,
      text: 'Retorne para fazer login e comece a adotar'
    }
  ];

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {/* Icon */}
        <div className={styles.iconContainer}>
          <div className={styles.iconBadge}>
            <svg 
              className={styles.iconSvg}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1.5}
                d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" 
              />
            </svg>
          </div>
        </div>

        {/* Title & Description */}
        <h1 className={styles.title}>
          Verifique seu Email 📧
        </h1>
        
        <p className={styles.description}>
          Um email de verificação foi enviado para:
        </p>
        
        {email && (
          <p className={styles.description}>
            <span className={styles.emailHighlight}>{email}</span>
          </p>
        )}

        {/* Steps */}
        <div className={styles.stepsSection}>
          <p className={styles.stepsTitle}>Próximos passos:</p>
          
          <div className={styles.stepsList}>
            {steps.map((step) => (
              <div key={step.number} className={styles.stepItem}>
                <div className={styles.stepNumber}>
                  {step.number}
                </div>
                <p className={styles.stepText}>
                  {step.text}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Info Box */}
        <div className={styles.infoBox}>
          <p className={styles.infoTitle}>💡 Dica Importante</p>
          <p className={styles.infoText}>
            Se não receber o email em alguns minutos, verifique sua pasta de spam. 
            Às vezes emails de verificação acabam lá por engano.
          </p>
        </div>

        {/* Buttons */}
        <div className={styles.buttonsSection}>
          <Link href="/auth/signin" className={styles.primaryButton}>
            ✓ Ir para Login
          </Link>
          
          <Link href="/auth/signup" className={styles.secondaryButton}>
            Tentar Cadastro Novamente
          </Link>
        </div>

        {/* Help Text */}
        <p className={styles.helpText}>
          Está com problemas? <Link href="/contato" className={styles.helpLink}>Entre em contato conosco</Link>
        </p>
      </div>
    </div>
  );
}