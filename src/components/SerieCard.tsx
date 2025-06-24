import React from 'react';
import Image from 'next/image';
import { Star, Heart, Calendar, Play } from 'lucide-react';
import { Serie } from '@/types';
import { getImageUrl } from '@/lib/tmdb';
import { useFavoriteSeries } from '@/lib/storage';
import { formatDateToYear, formatRating, getRatingColor, handleImageError } from '@/lib/utils';

interface SerieCardProps {
  serie: Serie;
  onSerieClick?: (serie: Serie) => void;
  onAddToWatched?: (serie: Serie) => void;
  showActions?: boolean;
  className?: string;
}

export default function SerieCard({ 
  serie, 
  onSerieClick, 
  onAddToWatched, 
  showActions = true,
  className = "" 
}: SerieCardProps) {
  const { addFavoriteSerie, removeFavoriteSerie, isFavorite } = useFavoriteSeries();
  const isSerieInFavorites = isFavorite(serie.id);

  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSerieInFavorites) {
      removeFavoriteSerie(serie.id);
    } else {
      addFavoriteSerie(serie);
    }
  };

  const handleAddToWatched = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToWatched?.(serie);
  };

  const handleCardClick = () => {
    onSerieClick?.(serie);
  };

  return (
    <div 
      className={`group relative bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden ${className}`}
      onClick={handleCardClick}
    >
      {/* Image de la série */}
      <div className="relative aspect-[2/3] overflow-hidden">
        <Image
          src={getImageUrl(serie.poster_path, 'w500')}
          alt={serie.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          onError={handleImageError}
        />
        
        {/* Overlay avec actions */}
        {showActions && (
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="flex space-x-2">
              <button
                onClick={handleAddToWatched}
                className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                title="Marquer comme vu"
              >
                <Play size={16} />
              </button>
              <button
                onClick={handleFavoriteToggle}
                className={`p-2 rounded-full transition-colors ${
                  isSerieInFavorites 
                    ? 'bg-red-600 text-white hover:bg-red-700' 
                    : 'bg-white text-gray-800 hover:bg-gray-100'
                }`}
                title={isSerieInFavorites ? 'Retirer des favoris' : 'Ajouter aux favoris'}
              >
                <Heart size={16} fill={isSerieInFavorites ? 'currentColor' : 'none'} />
              </button>
            </div>
          </div>
        )}

        {/* Badge de note */}
        <div className="absolute top-2 right-2 bg-black/80 text-white px-2 py-1 rounded-lg text-xs font-semibold flex items-center space-x-1">
          <Star size={12} className={getRatingColor(serie.vote_average)} fill="currentColor" />
          <span>{formatRating(serie.vote_average)}</span>
        </div>
      </div>

      {/* Informations de la série */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {serie.name}
        </h3>
        
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
          <Calendar size={14} className="mr-1" />
          <span>{formatDateToYear(serie.first_air_date)}</span>
        </div>

        {serie.overview && (
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
            {serie.overview}
          </p>
        )}

        {/* Pays d'origine */}
        {serie.origin_country && serie.origin_country.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {serie.origin_country.slice(0, 2).map((country) => (
              <span 
                key={country}
                className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs text-gray-600 dark:text-gray-400 rounded-full"
              >
                {country}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Indicateur de favoris permanent */}
      {isSerieInFavorites && (
        <div className="absolute top-2 left-2 bg-red-600 text-white p-1 rounded-full">
          <Heart size={12} fill="currentColor" />
        </div>
      )}
    </div>
  );
}
