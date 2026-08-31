import Link from 'next/link';
import Button from '@/components/ui/Button/Button';
import styles from './not-found.module.css';

/**
 * Not Found page for shelter
 */
export default function NotFound() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>Abrigo não encontrado</h1>
        <p className={styles.message}>
          O abrigo que você procura não existe ou foi removido.
        </p>
        <div className={styles.actions}>
          <Link href="/shelters">
            <Button>Ver todos os abrigos</Button>
          </Link>
          <Link href="/pets">
            <Button variant="secondary">Ver pets disponíveis</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
