/**
 * Image Optimization Utilities
 * 
 * Implementa lazy loading, blur placeholders e otimização automática de formatos
 * Requisitos: 9.3
 * 
 * Usa Next.js Image component e Cloudinary transformations
 */

/**
 * Configurações de otimização de imagem
 */
export const IMAGE_OPTIMIZATION_CONFIG = {
  // Tamanhos de breakpoint para srcset
  breakpoints: [320, 640, 1024, 1280, 1920],
  
  // Qualidade por dispositivo
  quality: {
    thumbnail: 60,
    small: 70,
    medium: 80,
    large: 90,
  },

  // Formatos preferidos por navegador
  formats: {
    modern: 'webp', // Para navegadores modernos
    fallback: 'jpg', // Fallback para navegadores antigos
  },

  // Blur placeholder config
  blurDataUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICAKICAGPGZPBHRLCIBPZD0iYiI+CiAgICA8ZmVHYXVzc2lhbkJsdXIgaW49IlNvdXJjZUdyYXBoaWMiIHN0ZERldmlhdGlvbj0iMjAiIC8+CiAgPC9maWx0ZXI+CiAgCiAgPHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2VjZjBmMSIgLz4KICAKICAKPC9zdmc+',
  
  // Dimensões padrão
  sizes: {
    thumbnail: { width: 100, height: 100 },
    small: { width: 300, height: 300 },
    medium: { width: 600, height: 600 },
    large: { width: 1200, height: 1200 },
  },
};

/**
 * Gerar URL otimizada para Cloudinary
 */
export function generateOptimizedImageUrl(imageUrl, options = {}) {
  if (!imageUrl) return null;

  // Se não for Cloudinary URL, retornar como está
  if (!imageUrl.includes('cloudinary.com')) {
    return imageUrl;
  }

  const {
    width = null,
    height = null,
    quality = 'auto',
    format = 'auto',
    crop = 'limit',
    fit = 'scale',
    gravity = 'auto',
    radius = 0,
  } = options;

  // Construir transformações
  const transformations = [];

  // Dimensions
  if (width && height) {
    transformations.push(`w_${width},h_${height},c_${crop}`);
  } else if (width) {
    transformations.push(`w_${width},c_limit`);
  } else if (height) {
    transformations.push(`h_${height},c_limit`);
  }

  // Quality and Format
  transformations.push(`q_${quality},f_${format}`);

  // Crop
  if (gravity !== 'auto') {
    transformations.push(`g_${gravity}`);
  }

  // Border radius
  if (radius > 0) {
    transformations.push(`r_${radius}`);
  }

  // Construir URL final
  if (transformations.length === 0) {
    return imageUrl;
  }

  const transformationString = transformations.join(',');

  // Inserir transformações na URL
  return imageUrl.replace('/image/upload/', `/image/upload/${transformationString}/`);
}

/**
 * Gerar blob placeholder (LQIP - Low Quality Image Placeholder)
 */
export async function generateBlurDataUrl(imageUrl, width = 10, height = 10) {
  try {
    // Usar transformação Cloudinary para gerar preview de baixa qualidade
    if (imageUrl.includes('cloudinary.com')) {
      const blurUrl = generateOptimizedImageUrl(imageUrl, {
        width,
        height,
        quality: 20,
        format: 'auto',
      });

      // Retornar data URL
      return `${blurUrl}`;
    }

    // Fallback para imagem padrão
    return IMAGE_OPTIMIZATION_CONFIG.blurDataUrl;
  } catch (error) {
    console.error('Erro ao gerar blur data URL:', error);
    return IMAGE_OPTIMIZATION_CONFIG.blurDataUrl;
  }
}

/**
 * Gerar srcset para responsividade
 */
export function generateImageSrcSet(imageUrl, maxWidth = 1200) {
  if (!imageUrl) return '';

  const breakpoints = IMAGE_OPTIMIZATION_CONFIG.breakpoints.filter(bp => bp <= maxWidth);

  return breakpoints
    .map(width => {
      const url = generateOptimizedImageUrl(imageUrl, {
        width,
        quality: 'auto',
        format: 'auto',
      });
      return `${url} ${width}w`;
    })
    .join(', ');
}

/**
 * Gerar sizes string para atributo sizes
 */
export function generateImageSizes(maxWidth = 1200) {
  return `
    (max-width: 640px) 100vw,
    (max-width: 1024px) 80vw,
    ${Math.min(maxWidth, 1200)}px
  `.trim().replace(/\s+/g, ' ');
}

/**
 * Props otimizadas para Next.js Image component
 */
export function getOptimizedImageProps(imageUrl, options = {}) {
  const {
    alt = 'Imagem',
    width = 600,
    height = 600,
    priority = false,
    quality = 80,
    maxWidth = 1200,
    className = '',
  } = options;

  const optimizedUrl = generateOptimizedImageUrl(imageUrl, {
    width,
    height,
    quality,
    format: 'auto',
  });

  return {
    src: optimizedUrl,
    alt,
    width,
    height,
    priority,
    quality,
    placeholder: 'blur',
    blurDataURL: IMAGE_OPTIMIZATION_CONFIG.blurDataUrl,
    className,
    srcSet: generateImageSrcSet(imageUrl, maxWidth),
    sizes: generateImageSizes(maxWidth),
  };
}

/**
 * Componente otimizado para imagens de pets
 * (Usar em client components)
 */
export const PET_IMAGE_CONFIG = {
  sizes: {
    thumbnail: {
      width: 100,
      height: 100,
      quality: 60,
    },
    card: {
      width: 300,
      height: 300,
      quality: 70,
    },
    detail: {
      width: 800,
      height: 600,
      quality: 85,
    },
    gallery: {
      width: 1200,
      height: 900,
      quality: 90,
    },
  },
};

/**
 * Obter props otimizadas para imagem de pet
 */
export function getPetImageProps(imageUrl, sizePreset = 'card', options = {}) {
  const presetConfig = PET_IMAGE_CONFIG.sizes[sizePreset] || PET_IMAGE_CONFIG.sizes.card;

  return getOptimizedImageProps(imageUrl, {
    ...presetConfig,
    alt: options.alt || `Foto de pet`,
    priority: options.priority || false,
    maxWidth: presetConfig.width,
    className: options.className || '',
  });
}

/**
 * Gerar múltiplas versões de imagem para diferentes casos de uso
 */
export function generateImageVariants(imageUrl) {
  if (!imageUrl) return {};

  return {
    thumbnail: generateOptimizedImageUrl(imageUrl, {
      width: 100,
      height: 100,
      crop: 'fill',
      quality: 60,
    }),
    card: generateOptimizedImageUrl(imageUrl, {
      width: 300,
      height: 300,
      crop: 'fill',
      quality: 70,
    }),
    medium: generateOptimizedImageUrl(imageUrl, {
      width: 600,
      height: 600,
      crop: 'limit',
      quality: 80,
    }),
    large: generateOptimizedImageUrl(imageUrl, {
      width: 1200,
      height: 900,
      crop: 'limit',
      quality: 90,
    }),
    fullscreen: generateOptimizedImageUrl(imageUrl, {
      width: 1920,
      height: 1080,
      crop: 'limit',
      quality: 85,
    }),
  };
}

/**
 * Validar suporte a WebP e retornar formato apropriado
 */
export function getPreferredImageFormat(headers = {}) {
  const accept = headers['accept'] || '';

  if (accept.includes('image/webp')) {
    return 'webp';
  }

  if (accept.includes('image/avif')) {
    return 'avif';
  }

  return 'auto'; // Deixar Cloudinary decidir
}

/**
 * URL de imagem de fallback (quando imagem não carrega)
 */
export const DEFAULT_PET_IMAGE = '/images/default-pet-placeholder.svg';
export const DEFAULT_SHELTER_IMAGE = '/images/default-shelter-placeholder.svg';
export const DEFAULT_USER_AVATAR = '/images/default-avatar.svg';

/**
 * Gerar URL com fallback
 */
export function getImageUrlWithFallback(imageUrl, fallbackUrl = DEFAULT_PET_IMAGE) {
  return imageUrl || fallbackUrl;
}

/**
 * Transform image for specific use case
 */
export function createImageTransform(baseUrl, transform = {}) {
  const defaults = {
    quality: 'auto',
    format: 'auto',
    crop: 'limit',
  };

  const config = { ...defaults, ...transform };

  // Construir string de transformação Cloudinary
  const transformParts = [];

  if (config.width && config.height) {
    transformParts.push(`w_${config.width},h_${config.height},c_${config.crop}`);
  } else if (config.width) {
    transformParts.push(`w_${config.width}`);
  } else if (config.height) {
    transformParts.push(`h_${config.height}`);
  }

  transformParts.push(`q_${config.quality},f_${config.format}`);

  const transformation = transformParts.join(',');

  return baseUrl.replace(
    '/image/upload/',
    `/image/upload/${transformation}/`
  );
}
