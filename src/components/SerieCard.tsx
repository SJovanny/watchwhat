'use client'

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Star, Heart, Calendar, Play, Plus, Check } from 'lucide-react';
import { Serie } from '@/types';
import { getImageUrl } from '@/lib/tmdb';
import { formatDateToYear, formatRating, getRatingColor, handleImageError } from '@/lib/utils';
import { UserService } from '@/lib/user-service';
import { useAuth } from './AuthProvider';
import { useNotify } from './NotificationProvider';

interface SerieCardProps {
  serie: Serie;
  onSerieClick?: (serie: Serie) => void;
  showActions?: boolean;
  className?: string;
}

export default function SerieCard({ 
  serie, 
  onSerieClick, 
  showActions = true,
  className = "" 
}: SerieCardProps) {
  const { user } = useAuth();
  const notify = useNotify();
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [isWatched, setIsWatched] = useState(false);
  const [loading, setLoading] = useState(false);

  // Charger l'état initial
  useEffect(() => {
    if (user) {
      loadSerieStatus();
    }
  }, [user, serie.id]);

  const loadSerieStatus = async () => {
    if (!user) return;

    try {
      const [watchlistStatus, watchedStatus] = await Promise.all([
        UserService.isInWatchlist(serie.id),
        UserService.isWatched(serie.id)
      ]);
      
      setIsInWatchlist(watchlistStatus);
      setIsWatched(watchedStatus);
    } catch (error) {
      console.error('Erreur lors du chargement du statut de la série:', error);
    }
  };

  const handleWatchlistToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!user) {
      notify.info('Connexion requise', 'Connectez-vous pour gérer votre watchlist');
      return;
    }

    setLoading(true);
    try {
      if (isInWatchlist) {
        const success = await UserService.removeFromWatchlist(serie.id);
        if (success) {
          setIsInWatchlist(false);
          notify.success('Retiré de la watchlist', `"${serie.name}" a été retiré de votre watchlist`);
        }
      } else {
        const success = await UserService.addToWatchlist(serie);
        if (success) {
          setIsInWatchlist(true);
          notify.success('Ajouté à la watchlist', `"${serie.name}" a été ajouté à votre watchlist`);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la gestion de la watchlist:', error);
      notify.error('Erreur', 'Une erreur est survenue lors de la mise à jour de votre watchlist');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsWatched = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!user) {
      notify.info('Connexion requise', 'Connectez-vous pour marquer des séries comme vues');
      return;
    }

    setLoading(true);
    try {
      const success = await UserService.markAsWatched(serie);
      if (success) {
        setIsWatched(true);
        // Retirer de la watchlist si elle y était
        if (isInWatchlist) {
          await UserService.removeFromWatchlist(serie.id);
          setIsInWatchlist(false);
        }
        notify.success(
          'Marqué comme vu', 
          `"${serie.name}" a été ajouté à vos séries vues`,
          {
            label: 'Voir mes séries vues',
            onClick: () => window.location.href = '/profile'
          }
        );
      }
    } catch (error) {
      console.error('Erreur lors du marquage comme vu:', error);
      notify.error('Erreur', 'Une erreur est survenue lors du marquage de la série');
    } finally {
      setLoading(false);
    }
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
        {showActions && user && (
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="flex space-x-2">
              {!isWatched && (
                <button
                  onClick={handleMarkAsWatched}
                  disabled={loading}
                  className="p-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors disabled:opacity-50"
                  title="Marquer comme vu"
                >
                  <Check size={16} />
                </button>
              )}
              
              <button
                onClick={handleWatchlistToggle}
                disabled={loading}
                className={`p-2 rounded-full transition-colors disabled:opacity-50 ${
                  isInWatchlist 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'bg-white text-gray-800 hover:bg-gray-100'
                }`}
                title={isInWatchlist ? 'Retirer de la watchlist' : 'Ajouter à la watchlist'}
              >
                {isInWatchlist ? <Heart size={16} fill="currentColor" /> : <Plus size={16} />}
              </button>
            </div>
          </div>
        )}

        {/* Badge de note */}
        <div className="absolute top-2 right-2 bg-black/80 text-white px-2 py-1 rounded-lg text-xs font-semibold flex items-center space-x-1">
          <Star size={12} className={getRatingColor(serie.vote_average)} fill="currentColor" />
          <span>{formatRating(serie.vote_average)}</span>
        </div>

        {/* Indicateurs de statut */}
        <div className="absolute top-2 left-2 flex flex-col space-y-1">
          {isWatched && (
            <div className="bg-green-600 text-white p-1 rounded-full" title="Déjà vu">
              <Check size={12} />
            </div>
          )}
          {isInWatchlist && !isWatched && (
            <div className="bg-blue-600 text-white p-1 rounded-full" title="Dans la watchlist">
              <Heart size={12} fill="currentColor" />
            </div>
          )}
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

        {/* Actions pour utilisateurs non connectés */}
        {showActions && !user && (
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              Connectez-vous pour gérer vos séries
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
