'use client'

import React, { useState, useEffect, useRef } from 'react';
import { Play } from 'lucide-react';
import { Movie, Serie, Video } from '@/types';
import { tmdbService, getImageUrl, getBackdropUrl } from '@/lib/tmdb';
import { usePreferences } from '@/contexts/PreferencesContext';
import SectionHeader from './SectionHeader';
import TrailerModal from './TrailerModal';

interface TrailerItem {
  content: Movie | Serie;
  trailer: Video | null;
}

interface PopularTrailersProps {
  className?: string;
}

export default function PopularTrailers({ className = '' }: PopularTrailersProps) {
  const { preferences, isLoading: isPrefsLoading } = usePreferences();
  const [trailers, setTrailers] = useState<TrailerItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTrailer, setSelectedTrailer] = useState<TrailerItem | null>(null);
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Recharger les trailers quand la région change
  useEffect(() => {
    // Attendre que les préférences soient chargées
    if (!isPrefsLoading) {
      loadTrailers();
    }
  }, [preferences?.country, isPrefsLoading]);

  const loadTrailers = async () => {
    try {
      setIsLoading(true);
      
      // Charger un mélange équilibré de films et séries populaires et à venir
      // Utilise les fonctions filtrées par région pour adapter le contenu
      const region = tmdbService.getRegion();
      console.log(`[PopularTrailers] Chargement du contenu pour la région: ${region}`);
      
      const [
        popularMovies1, 
        popularMovies2, 
        upcomingMovies, 
        popularSeries1, 
        popularSeries2, 
        onTheAirSeries
      ] = await Promise.all([
        tmdbService.getPopularMoviesByRegion(1),
        tmdbService.getPopularMoviesByRegion(2),
        tmdbService.getUpcomingMoviesByRegion(1),
        tmdbService.getPopularSeriesByRegion(1),
        tmdbService.getPopularSeriesByRegion(2),
        tmdbService.getOnTheAirSeries(1)
      ]);
      
      // Combiner tous les contenus avec un bon équilibre films/séries
      const allContent: (Movie | Serie)[] = [
        ...popularMovies1.results,
        ...popularSeries1.results,
        ...upcomingMovies.results,
        ...popularMovies2.results,
        ...popularSeries2.results,
        ...onTheAirSeries.results
      ];
      
      // Déduplication basée sur l'ID pour éviter les doublons
      const uniqueContent = allContent.reduce((unique, content) => {
        if (!unique.find(item => item.id === content.id)) {
          unique.push(content);
        }
        return unique;
      }, [] as (Movie | Serie)[]);
      
      // Filtrer le contenu récent et populaire
      const currentYear = new Date().getFullYear();
      const recentContent = uniqueContent.filter(content => {
        const releaseDate = 'title' in content ? content.release_date : content.first_air_date;
        if (!releaseDate) return false;
        
        const releaseYear = new Date(releaseDate).getFullYear();
        // Contenu des 5 dernières années + contenu à venir
        return releaseYear >= currentYear - 5 || releaseYear > currentYear;
      });
      
      // Trier par popularité et prendre les 40 premiers pour avoir plus de choix
      recentContent.sort((a, b) => b.popularity - a.popularity);
      
      // Traiter les contenus par batches pour éviter le rate limiting
      const batchSize = 5;
      const validTrailers: TrailerItem[] = [];
      
      for (let i = 0; i < Math.min(recentContent.length, 40) && validTrailers.length < 20; i += batchSize) {
        const batch = recentContent.slice(i, i + batchSize);
        
        const batchPromises = batch.map(async (content) => {
          try {
            // Ajouter un petit délai pour éviter le rate limiting
            await new Promise(resolve => setTimeout(resolve, 120));
            
            const isMovie = 'title' in content;
            const videos = isMovie 
              ? await tmdbService.getMovieVideos(content.id)
              : await tmdbService.getSerieVideos(content.id);
              
            // Chercher le meilleur trailer (officiel en priorité)
            const trailer = videos.results.find(video => 
              video.type === 'Trailer' && 
              video.site === 'YouTube' && 
              video.official
            ) || videos.results.find(video => 
              video.type === 'Trailer' && 
              video.site === 'YouTube'
            ) || videos.results.find(video =>
              (video.type === 'Teaser' || video.type === 'Clip') &&
              video.site === 'YouTube'
            ) || null;
            
            return { content, trailer };
          } catch (error) {
            console.warn(`Impossible de charger les vidéos pour le contenu ${content.id} (${('title' in content) ? content.title : content.name})`);
            return { content, trailer: null };
          }
        });

        const batchResults = await Promise.all(batchPromises);
        
        // Ajouter les trailers valides de ce batch
        const validBatchTrailers = batchResults.filter(item => item.trailer !== null);
        validTrailers.push(...validBatchTrailers);
        
        // Si on a assez de trailers, on peut arrêter
        if (validTrailers.length >= 20) break;
        
        // Pause entre les batches pour éviter le rate limiting
        await new Promise(resolve => setTimeout(resolve, 250));
      }
      
      // Équilibrer films et séries dans les résultats finaux
      const movies = validTrailers.filter(item => 'title' in item.content);
      const series = validTrailers.filter(item => 'name' in item.content);
      
      // Mélanger films et séries de manière équilibrée
      const balancedTrailers: TrailerItem[] = [];
      const maxItems = 20;
      const moviesPerSeries = Math.max(1, Math.floor(movies.length / Math.max(1, series.length)));
      
      let movieIndex = 0;
      let seriesIndex = 0;
      
      while (balancedTrailers.length < maxItems && (movieIndex < movies.length || seriesIndex < series.length)) {
        // Ajouter des films
        for (let i = 0; i < moviesPerSeries && movieIndex < movies.length && balancedTrailers.length < maxItems; i++) {
          balancedTrailers.push(movies[movieIndex++]);
        }
        
        // Ajouter une série
        if (seriesIndex < series.length && balancedTrailers.length < maxItems) {
          balancedTrailers.push(series[seriesIndex++]);
        }
      }
      
      // Trier par popularité pour avoir les meilleurs en premier
      balancedTrailers.sort((a, b) => b.content.popularity - a.content.popularity);
      
      setTrailers(balancedTrailers.slice(0, 20));
      
      console.log(`Trailers chargés: ${balancedTrailers.length} (${movies.length} films, ${series.length} séries)`);
      console.log('Répartition:', balancedTrailers.map(t => ({
        title: getTitle(t.content),
        type: 'title' in t.content ? 'film' : 'série',
        popularity: t.content.popularity
      })));
    } catch (error) {
      console.error('Erreur lors du chargement des trailers populaires:', error);
      // En cas d'erreur, charger au moins quelques contenus de base
      try {
        const [fallbackMovies, fallbackSeries] = await Promise.all([
          tmdbService.getPopularMovies(1),
          tmdbService.getPopularSeries(1)
        ]);
        
        const fallbackTrailers = [
          ...fallbackMovies.results.slice(0, 3).map(movie => ({ content: movie, trailer: null as Video | null })),
          ...fallbackSeries.results.slice(0, 2).map(serie => ({ content: serie, trailer: null as Video | null }))
        ];
        setTrailers(fallbackTrailers);
      } catch (fallbackError) {
        console.error('Erreur lors du chargement de secours:', fallbackError);
        setTrailers([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const openTrailer = (trailerItem: TrailerItem) => {
    if (trailerItem.trailer) {
      setSelectedTrailer(trailerItem);
    }
  };

  const closeTrailer = () => {
    setSelectedTrailer(null);
  };

  const getTitle = (content: Movie | Serie) => {
    return 'title' in content ? content.title : content.name;
  };

  const getDate = (content: Movie | Serie) => {
    return 'title' in content ? content.release_date : content.first_air_date;
  };

  const getBackdrop = (content: Movie | Serie) => {
    return content.backdrop_path;
  };

  const getOverview = (content: Movie | Serie) => {
    return content.overview;
  };

  const getVoteAverage = (content: Movie | Serie) => {
    return content.vote_average;
  };

  const playable = trailers.filter((item) => item.trailer && getBackdrop(item.content));
  const featured = playable[Math.min(featuredIndex, Math.max(0, playable.length - 1))];
  const kindLabel = (content: Movie | Serie) => ('title' in content ? 'Film' : 'Série');
  const year = (content: Movie | Serie) => {
    const d = getDate(content);
    return d ? new Date(d).getFullYear() : '';
  };

  if (!isLoading && playable.length === 0) {
    return null;
  }

  return (
    <section className={className} aria-labelledby="row-trailers">
      <SectionHeader
        title={<span id="row-trailers">Bandes-annonces</span>}
        meta={isLoading ? undefined : `${playable.length} récentes`}
      />

      {isLoading || !featured ? (
        <div aria-hidden>
          <div className="skeleton aspect-video w-full rounded-2xl lg:aspect-[21/9]" />
          <div className="mt-4 flex gap-4 overflow-hidden">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="skeleton aspect-video w-[240px] flex-shrink-0 sm:w-[280px]" />
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* La scène : la bande-annonce en vedette */}
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-gray-950 text-white ring-1 ring-line sm:aspect-video lg:aspect-[21/9]">
            {playable.map((item, i) => (
              <div
                key={`${item.content.id}-${i}`}
                aria-hidden={item !== featured}
                className={`absolute inset-0 transition-opacity duration-700 ease-[var(--ease-cinema)] ${
                  item === featured ? 'opacity-100' : 'opacity-0'
                }`}
              >
                {Math.abs(i - featuredIndex) <= 1 && (
                  <img
                    src={getBackdropUrl(getBackdrop(item.content), 'w1280')}
                    alt=""
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                )}
              </div>
            ))}
            <div aria-hidden className="scrim-left absolute inset-0" />
            <div aria-hidden className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/80 to-transparent" />

            <div className="absolute inset-x-0 bottom-0 flex flex-col items-start gap-5 p-6 sm:p-10 lg:p-14">
              <p className="meta flex items-center gap-2 text-white/70">
                <span>{kindLabel(featured.content)}</span>
                <span aria-hidden className="text-white/35">·</span>
                <span>{year(featured.content)}</span>
                <span aria-hidden className="text-white/35">·</span>
                <span className="text-yellow-400">★ {getVoteAverage(featured.content).toFixed(1)}</span>
              </p>
              <h3 className="max-w-[18ch] font-display text-[36px] leading-[1.02] tracking-[-0.02em] text-balance sm:text-[48px] lg:text-[64px]">
                {getTitle(featured.content)}
              </h3>
              <div className="hidden md:block">
                <p className="max-w-[52ch] text-[15px] leading-[1.6] text-white/75 line-clamp-2">
                  {getOverview(featured.content)}
                </p>
              </div>
              <button
                onClick={() => openTrailer(featured)}
                className="group inline-flex h-12 items-center gap-3 rounded-lg bg-white pl-2 pr-6 text-[15px] font-medium text-gray-950 transition-[background-color,transform] duration-150 hover:bg-white/85 active:scale-[0.97]"
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-accent text-white">
                  <Play size={16} fill="currentColor" strokeWidth={0} className="ml-0.5" />
                </span>
                Lancer la bande-annonce
              </button>
            </div>
          </div>

          {/* La pellicule : choisir une bande-annonce */}
          <div
            ref={scrollContainerRef}
            className="row-scroller scrollbar-hide mt-4 overflow-x-auto"
          >
            <ul className="flex gap-3 sm:gap-4" style={{ width: 'max-content' }}>
              {playable.map((item, i) => {
                const active = item === featured;
                return (
                  <li key={`${item.content.id}-${i}`} className="w-[220px] flex-shrink-0 sm:w-[260px]">
                    <button
                      onClick={() => (active ? openTrailer(item) : setFeaturedIndex(i))}
                      onMouseEnter={() => setFeaturedIndex(i)}
                      onFocus={() => setFeaturedIndex(i)}
                      aria-label={`${getTitle(item.content)}${active ? ', lancer la bande-annonce' : ''}`}
                      className="group block w-full text-left"
                    >
                      <span
                        className={`relative block aspect-video overflow-hidden rounded-lg bg-raised ring-1 transition-[box-shadow] duration-200 ${
                          active ? 'ring-2 ring-accent' : 'ring-line'
                        }`}
                      >
                        <img
                          src={getImageUrl(getBackdrop(item.content), 'w780')}
                          alt=""
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-500 ease-[var(--ease-cinema)] group-hover:scale-[1.03]"
                        />
                        <span className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-gray-950">
                            <Play size={16} fill="currentColor" strokeWidth={0} className="ml-0.5" />
                          </span>
                        </span>
                      </span>
                      <span className="mt-2.5 block truncate text-[14px] font-medium text-ink">
                        {getTitle(item.content)}
                      </span>
                      <span className="meta mt-0.5 block text-ink-3">
                        {kindLabel(item.content)} · {year(item.content)}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </>
      )}

      {selectedTrailer && selectedTrailer.trailer && (
        <TrailerModal
          videoKey={selectedTrailer.trailer.key}
          title={getTitle(selectedTrailer.content)}
          subtitle={`Bande-annonce · ${kindLabel(selectedTrailer.content)} · ${year(selectedTrailer.content)}`}
          onClose={closeTrailer}
        />
      )}
    </section>
  );
}
