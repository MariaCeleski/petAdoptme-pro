'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import styles from './SponsorsCarousel.module.css';

export default function SponsorsCarousel() {
  const [sponsors, setSponsors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetchSponsors();
  }, []);

  const fetchSponsors = async () => {
    try {
      const response = await fetch('/api/sponsors');
      const data = await response.json();
      
      // Ensure data is an array
      if (Array.isArray(data)) {
        setSponsors(data);
      } else if (data && typeof data === 'object' && data.sponsors && Array.isArray(data.sponsors)) {
        setSponsors(data.sponsors);
      } else {
        console.warn('Sponsors data is not in expected format:', data);
        setSponsors([]);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching sponsors:', error);
      setSponsors([]);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (sponsors.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % sponsors.length);
    }, 5000); // Change sponsor every 5 seconds

    return () => clearInterval(interval);
  }, [sponsors.length]);

  if (loading || sponsors.length === 0) {
    return null;
  }

  const getVisibleSponsors = () => {
    const itemsPerView = 4;
    const visibleSponsors = [];
    
    for (let i = 0; i < itemsPerView; i++) {
      const index = (currentIndex + i) % sponsors.length;
      visibleSponsors.push(sponsors[index]);
    }
    
    return visibleSponsors;
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + sponsors.length) % sponsors.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % sponsors.length);
  };

  const visibleSponsors = getVisibleSponsors();

  return (
    <section className={styles.sponsorsSection}>
      <div className={styles.sponsorsContainer}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            🤝 Nossos <span className={styles.highlight}>Patrocinadores</span>
          </h2>
          <p className={styles.sectionDescription}>
            Agradecemos às empresas que acreditam na causa de resgatar e cuidar de animais necessitados.
          </p>
        </div>

        <div className={styles.carouselWrapper}>
          <button 
            className={styles.navButton}
            onClick={handlePrevious}
            aria-label="Sponsor anterior"
          >
            ❮
          </button>

          <div className={styles.carouselContainer}>
            <div 
              className={styles.sponsorsGrid}
              style={{
                transform: `translateX(calc(-${currentIndex * 25}% - ${currentIndex * 12}px))`,
              }}
            >
              {sponsors.map((sponsor) => (
                <a
                  key={sponsor.id}
                  href={sponsor.website || '#'}
                  target={sponsor.website ? '_blank' : undefined}
                  rel={sponsor.website ? 'noopener noreferrer' : undefined}
                  className={styles.sponsorCard}
                  title={sponsor.name}
                >
                  <div className={styles.sponsorImageWrapper}>
                    <Image
                      src={sponsor.logo}
                      alt={sponsor.name}
                      fill
                      className={styles.sponsorImage}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                  </div>
                  {sponsor.description && (
                    <p className={styles.sponsorDescription}>{sponsor.description}</p>
                  )}
                </a>
              ))}
            </div>
          </div>

          <button 
            className={styles.navButton}
            onClick={handleNext}
            aria-label="Próximo sponsor"
          >
            ❯
          </button>
        </div>

        <div className={styles.dotsContainer}>
          {sponsors.map((_, index) => (
            <button
              key={index}
              className={`${styles.dot} ${index === currentIndex ? styles.active : ''}`}
              onClick={() => setCurrentIndex(index)}
              aria-label={`Ir para sponsor ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
