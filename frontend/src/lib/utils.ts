// Utilitaires pour formatage et validation des données

/**
 * Formate une date en année ou retourne 'N/A' si la date est invalide
 */
export const formatDateToYear = (dateString: string | null | undefined): string => {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    const year = date.getFullYear();
    
    // Vérifier si l'année est valide et dans une plage raisonnable
    if (isNaN(year) || year < 1900 || year > 2100) {
      return 'N/A';
    }
    
    return year.toString();
  } catch {
    return 'N/A';
  }
};

/**
 * Formate une date en format local ou retourne 'N/A' si invalide
 */
export const formatDateToLocal = (dateString: string | null | undefined): string => {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'N/A';
    }
    
    return date.toLocaleDateString('fr-FR');
  } catch {
    return 'N/A';
  }
};

/**
 * Valide et formate une note sur 10
 */
export const formatRating = (rating: number | null | undefined): string => {
  if (rating === null || rating === undefined || isNaN(rating)) {
    return '0.0';
  }
  
  return Math.max(0, Math.min(10, rating)).toFixed(1);
};

/**
 * Obtient la couleur pour une note donnée
 */
export const getRatingColor = (rating: number): string => {
  if (isNaN(rating) || rating === 0) return 'text-gray-500';
  if (rating >= 8) return 'text-green-500';
  if (rating >= 6.5) return 'text-yellow-500';
  return 'text-red-500';
};

/**
 * Formate une durée en minutes en heures et minutes
 */
export const formatDuration = (minutes: number | null | undefined): string => {
  if (!minutes || isNaN(minutes) || minutes <= 0) {
    return 'N/A';
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (hours === 0) {
    return `${remainingMinutes}min`;
  }
  
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h${remainingMinutes}min`;
};

/**
 * Tronque un texte à une longueur donnée avec des points de suspension
 */
export const truncateText = (text: string | null | undefined, maxLength: number): string => {
  if (!text) return '';
  
  if (text.length <= maxLength) {
    return text;
  }
  
  return text.substring(0, maxLength).trim() + '...';
};

/**
 * Formate un nombre avec des séparateurs de milliers
 */
export const formatNumber = (num: number | null | undefined): string => {
  if (num === null || num === undefined || isNaN(num)) {
    return '0';
  }
  
  return num.toLocaleString('fr-FR');
};

/**
 * Gère les erreurs d'images et définit une image de fallback
 */
export const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>) => {
  const img = event.currentTarget;
  if (img.src !== '/placeholder-poster.svg') {
    img.src = '/placeholder-poster.svg';
  }
};

/**
 * Génère une URL d'image avec fallback
 */
export const getImageWithFallback = (imagePath: string | null, baseUrl: string = 'https://image.tmdb.org/t/p/w500'): string => {
  if (!imagePath) {
    return '/placeholder-poster.svg';
  }
  
  return `${baseUrl}${imagePath}`;
};

/**
 * Extrait prénom et nom des métadonnées Supabase d'un utilisateur.
 *
 * Le nom complet (`full_name` / `name`) passe en premier : c'est lui que
 * Google renvoie et met à jour à chaque connexion. `given_name` /
 * `family_name` ne sont écrits qu'à l'inscription par email et peuvent
 * rester périmés quand Google est rattaché au même compte.
 */
export const getNameFromMetadata = (
  metadata: Record<string, unknown> | null | undefined
): { firstName?: string; lastName?: string } => {
  const read = (key: string) => {
    const value = metadata?.[key];
    return typeof value === 'string' && value.trim() ? value.trim() : undefined;
  };

  const fullName = read('full_name') || read('name');
  if (fullName) {
    const [first, ...rest] = fullName.split(/\s+/);
    return {
      firstName: first,
      lastName: rest.length > 0 ? rest.join(' ') : read('family_name'),
    };
  }

  return { firstName: read('given_name'), lastName: read('family_name') };
};
