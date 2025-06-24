"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Star, 
  Play, 
  Heart,
  Users,
  Globe,
  Tv,
  Info,
  PlayCircle
} from 'lucide-react';
import { SerieDetails, Video, Cast, Crew } from '@/types';
import { tmdbService, getImageUrl, getBackdropUrl } from '@/lib/tmdb';
import { useFavoriteSeries } from '@/lib/storage';
import { formatDateToYear, formatRating, getRatingColor } from '@/lib/utils';
import SerieCard from '@/components/SerieCard';

export default function SeriePage() {
  const params = useParams();
  const router = useRouter();
  const serieId = parseInt(params.id as string);
  
  const [serie, setSerie] = useState<SerieDetails | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [similarSeries, setSimilarSeries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTrailer, setShowTrailer] = useState(false);
  const [mainTrailer, setMainTrailer] = useState<Video | null>(null);

  const { addFavoriteSerie, removeFavoriteSerie, isFavorite } = useFavoriteSeries();
  const isSerieInFavorites = serie ? isFavorite(serie.id) : false;

  useEffect(() => {
    const loadSerieData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const [serieData, videosData, similarData] = await Promise.all([
          tmdbService.getSerieDetails(serieId),
          tmdbService.getSerieVideos(serieId),
          tmdbService.getSimilarSeries(serieId)
        ]);

        setSerie(serieData);
        setVideos(videosData.results);
        setSimilarSeries(similarData.results.slice(0, 8));

        // Trouver le trailer principal
        const trailer = videosData.results.find(
          video => video.type === 'Trailer' && video.site === 'YouTube' && video.official
        ) || videosData.results.find(
          video => video.type === 'Teaser' && video.site === 'YouTube'
        ) || videosData.results[0];

        setMainTrailer(trailer || null);

      } catch (err) {
        console.error('Erreur lors du chargement de la série:', err);
        setError('Impossible de charger les détails de la série');
      } finally {
        setIsLoading(false);
      }
    };

    if (serieId) {
      loadSerieData();
    }
  }, [serieId]);

  const handleFavoriteToggle = () => {
    if (!serie) return;
    
    if (isSerieInFavorites) {
      removeFavoriteSerie(serie.id);
    } else {
      addFavoriteSerie(serie);
    }
  };

  const handleSerieSelect = (selectedSerie: any) => {
    router.push(`/serie/${selectedSerie.id}`);
  };

  const getTrailerUrl = (video: Video) => {
    if (video.site === 'YouTube') {
      return `https://www.youtube.com/embed/${video.key}?autoplay=1&rel=0`;
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Chargement des détails...</p>
        </div>
      </div>
    );
  }

  if (error || !serie) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <Info size={48} className="mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Série introuvable
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {error || 'Cette série n\'existe pas ou n\'est pas disponible.'}
          </p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header avec image de fond */}
      <div className="relative">
        {/* Image de fond */}
        <div className="relative h-[60vh] overflow-hidden">
          <Image
            src={getBackdropUrl(serie.backdrop_path, 'original')}
            alt={serie.name}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/70 to-gray-900/30" />
        </div>

        {/* Contenu superposé */}
        <div className="absolute inset-0 flex items-end">
          <div className="w-full px-6 pb-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Poster */}
                <div className="flex-shrink-0">
                  <div className="relative w-48 h-72 rounded-lg overflow-hidden shadow-2xl">
                    <Image
                      src={getImageUrl(serie.poster_path, 'w500')}
                      alt={serie.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>

                {/* Informations */}
                <div className="flex-1 text-white">
                  <div className="flex items-center gap-4 mb-4">
                    <button
                      onClick={() => router.back()}
                      className="p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
                    >
                      <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-3xl md:text-4xl font-bold">{serie.name}</h1>
                  </div>

                  {serie.tagline && (
                    <p className="text-lg text-gray-200 mb-4 italic">"{serie.tagline}"</p>
                  )}

                  {/* Métadonnées */}
                  <div className="flex flex-wrap items-center gap-4 mb-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Star size={16} className={getRatingColor(serie.vote_average)} fill="currentColor" />
                      <span className="font-semibold">{formatRating(serie.vote_average)}</span>
                      <span className="text-gray-300">({serie.vote_count.toLocaleString()} votes)</span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Calendar size={16} />
                      <span>{formatDateToYear(serie.first_air_date)}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <Tv size={16} />
                      <span>{serie.number_of_seasons} saison{serie.number_of_seasons > 1 ? 's' : ''}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <Clock size={16} />
                      <span>{serie.episode_run_time[0] || 45}min</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <Globe size={16} />
                      <span>{serie.origin_country.join(', ')}</span>
                    </div>
                  </div>

                  {/* Genres */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {serie.genres.map((genre) => (
                      <span
                        key={genre.id}
                        className="px-3 py-1 bg-blue-600/80 rounded-full text-sm font-medium"
                      >
                        {genre.name}
                      </span>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    {mainTrailer && (
                      <button
                        onClick={() => setShowTrailer(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition-colors"
                      >
                        <Play size={20} />
                        Regarder la bande-annonce
                      </button>
                    )}
                    
                    <button
                      onClick={handleFavoriteToggle}
                      className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
                        isSerieInFavorites
                          ? 'bg-red-600 hover:bg-red-700'
                          : 'bg-white/20 hover:bg-white/30'
                      }`}
                    >
                      <Heart size={20} fill={isSerieInFavorites ? 'currentColor' : 'none'} />
                      {isSerieInFavorites ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-8">
            {/* Synopsis */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Synopsis</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {serie.overview || 'Aucun synopsis disponible.'}
              </p>
            </section>

            {/* Cast principal */}
            {serie.credits?.cast && serie.credits.cast.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Distribution</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {serie.credits.cast.slice(0, 8).map((actor: Cast) => (
                    <div key={actor.id} className="text-center">
                      <div className="relative w-20 h-20 mx-auto mb-2 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                        {actor.profile_path ? (
                          <Image
                            src={getImageUrl(actor.profile_path, 'w200')}
                            alt={actor.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Users size={24} className="text-gray-400" />
                          </div>
                        )}
                      </div>
                      <p className="font-semibold text-sm text-gray-900 dark:text-white">{actor.name}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{actor.character}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Séries similaires */}
            {similarSeries.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Séries similaires</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {similarSeries.map((similarSerie) => (
                    <SerieCard
                      key={similarSerie.id}
                      serie={similarSerie}
                      onSerieClick={handleSerieSelect}
                      className="hover:scale-105 transition-transform"
                    />
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Informations détaillées */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Informations</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <dt className="font-medium text-gray-600 dark:text-gray-400">Statut</dt>
                  <dd className="text-gray-900 dark:text-white">{serie.status}</dd>
                </div>
                
                <div>
                  <dt className="font-medium text-gray-600 dark:text-gray-400">Première diffusion</dt>
                  <dd className="text-gray-900 dark:text-white">
                    {new Date(serie.first_air_date).toLocaleDateString('fr-FR')}
                  </dd>
                </div>

                {serie.last_air_date && (
                  <div>
                    <dt className="font-medium text-gray-600 dark:text-gray-400">Dernière diffusion</dt>
                    <dd className="text-gray-900 dark:text-white">
                      {new Date(serie.last_air_date).toLocaleDateString('fr-FR')}
                    </dd>
                  </div>
                )}

                <div>
                  <dt className="font-medium text-gray-600 dark:text-gray-400">Nombre d'épisodes</dt>
                  <dd className="text-gray-900 dark:text-white">{serie.number_of_episodes}</dd>
                </div>

                {serie.networks && serie.networks.length > 0 && (
                  <div>
                    <dt className="font-medium text-gray-600 dark:text-gray-400">Chaîne(s)</dt>
                    <dd className="text-gray-900 dark:text-white">
                      {serie.networks.map(network => network.name).join(', ')}
                    </dd>
                  </div>
                )}

                {serie.production_companies && serie.production_companies.length > 0 && (
                  <div>
                    <dt className="font-medium text-gray-600 dark:text-gray-400">Production</dt>
                    <dd className="text-gray-900 dark:text-white">
                      {serie.production_companies.slice(0, 3).map(company => company.name).join(', ')}
                    </dd>
                  </div>
                )}
              </div>
            </div>

            {/* Autres vidéos */}
            {videos.length > 1 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Autres vidéos</h3>
                <div className="space-y-2">
                  {videos.slice(0, 5).map((video) => (
                    <button
                      key={video.id}
                      onClick={() => {
                        setMainTrailer(video);
                        setShowTrailer(true);
                      }}
                      className="w-full text-left p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                    >
                      <PlayCircle size={16} className="text-red-600 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{video.name}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{video.type}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal pour la bande-annonce */}
      {showTrailer && mainTrailer && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl aspect-video">
            <button
              onClick={() => setShowTrailer(false)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 text-xl font-bold"
            >
              ✕ Fermer
            </button>
            {getTrailerUrl(mainTrailer) && (
              <iframe
                src={getTrailerUrl(mainTrailer)!}
                title={mainTrailer.name}
                className="w-full h-full rounded-lg"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
