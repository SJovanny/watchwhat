'use client'

import React, { useState, useEffect, useRef } from 'react';
import { Play, Calendar, Star, Film, X, Eye, Sparkles, TrendingUp, Zap } from 'lucide-react';
import { Movie, Serie, Video, SearchResult } from '@/types';
import { tmdbService, getImageUrl } from '@/lib/tmdb';
import { usePreferences } from '@/contexts/PreferencesContext';

interface TrailerItem {
  content: Movie | Serie;
  trailer: Video | null;
}

interface PopularTrailersProps {
  className?: string;
}

export default function PopularTrailers({ className = '' }: PopularTrailersProps) {
  const { preferences } = usePreferences();
  const [trailers, setTrailers] = useState<TrailerItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTrailer, setSelectedTrailer] = useState<TrailerItem | null>(null);
  const [currentBackgroundIndex, setCurrentBackgroundIndex] = useState(0);
  const [backgroundTrailers, setBackgroundTrailers] = useState<TrailerItem[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Gestion du scroll horizontal via la molette de la souris (desktop)
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const handleWheel = (e: WheelEvent) => {
      // Vérifier si on peut scroller horizontalement
      const canScrollHorizontally = scrollContainer.scrollWidth > scrollContainer.clientWidth;
      
      if (canScrollHorizontally) {
        e.preventDefault();
        scrollContainer.scrollLeft += e.deltaY;
      }
    };

    // Utiliser passive: false pour pouvoir appeler preventDefault
    scrollContainer.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      scrollContainer.removeEventListener('wheel', handleWheel);
    };
  }, [trailers]);

  // Recharger les trailers quand la région change
  useEffect(() => {
    loadTrailers();
  }, [preferences?.country]);

  // Filtrer les trailers avec des arrière-plans valides pour les backgrounds
  useEffect(() => {
    const validBackgroundTrailers = trailers.filter(
      trailer => getBackdrop(trailer.content) && getBackdrop(trailer.content) !== null
    );
    setBackgroundTrailers(validBackgroundTrailers.slice(0, 5)); // Prendre les 5 meilleurs
    console.log(`Trailers avec backdrop valides: ${validBackgroundTrailers.length}/${trailers.length}`);
    console.log('Backdrops:', validBackgroundTrailers.map(t => ({
      title: getTitle(t.content),
      backdrop: getBackdrop(t.content)
    })));
  }, [trailers]);

  // Changer l'arrière-plan toutes les 5 secondes
  useEffect(() => {
    if (backgroundTrailers.length === 0) return;

    const interval = setInterval(() => {
      setCurrentBackgroundIndex((prev) => (prev + 1) % backgroundTrailers.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [backgroundTrailers.length]);

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <section className={`relative overflow-hidden ${className}`}>
        {/* Container de chargement avec effet glassmorphism */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-violet-900/90 via-purple-900/90 to-fuchsia-900/90 backdrop-blur-xl">
          {/* Éléments animés de fond */}
          <div className="absolute inset-0">
            {/* Orbes flottantes */}
            <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-r from-blue-400/30 to-purple-400/30 rounded-full blur-2xl animate-pulse"></div>
            <div className="absolute bottom-10 right-10 w-40 h-40 bg-gradient-to-r from-pink-400/20 to-red-400/20 rounded-full blur-2xl animate-bounce"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-gradient-to-r from-cyan-400/25 to-blue-400/25 rounded-full blur-xl animate-spin"></div>
            
            {/* Motif géométrique */}
            <div 
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: `repeating-conic-gradient(from 0deg at 50% 50%, transparent 0deg, rgba(255,255,255,0.1) 30deg, transparent 60deg)`,
                backgroundSize: '100px 100px'
              }}
            ></div>
          </div>

          {/* Overlay glassmorphism */}
          <div className="absolute inset-0 bg-white/5 backdrop-blur-sm border border-white/10"></div>
          
          <div className="relative z-10 p-12 min-h-[600px] flex flex-col justify-center">
            {/* Header de chargement */}
            <div className="mb-8">
              <div className="flex items-center space-x-4 mb-4">
                <div className="relative">
                  <div className="p-4 bg-gradient-to-br from-red-500/80 to-pink-600/80 rounded-2xl shadow-2xl backdrop-blur-md">
                    <Film className="h-8 w-8 text-white animate-pulse" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl blur-xl opacity-50 animate-pulse"></div>
                </div>
                <div className="space-y-2">
                  <div className="w-64 h-8 bg-white/20 rounded-xl animate-pulse"></div>
                  <div className="w-48 h-4 bg-white/15 rounded-lg animate-pulse"></div>
                </div>
              </div>
            </div>

            {/* Animation de chargement centrale */}
            <div className="text-center mb-8">
              <div className="relative inline-block mb-6">
                <div className="w-20 h-20 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <Sparkles className="h-8 w-8 text-white animate-pulse" />
                </div>
              </div>
              <h3 className="text-white text-3xl font-bold mb-3">
                Chargement des Trailers
              </h3>
              <p className="text-white/80 text-xl">
                Préparation de votre expérience cinématographique...
              </p>
            </div>

            {/* Skeleton des cartes de trailers */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white/10 backdrop-blur-md rounded-2xl overflow-hidden border border-white/20 animate-pulse"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <div className="h-48 bg-white/10"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-white/15 rounded-lg"></div>
                    <div className="h-3 bg-white/10 rounded"></div>
                    <div className="h-3 bg-white/10 rounded w-3/4"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (trailers.length === 0) {
    return (
      <section className={`relative overflow-hidden ${className}`}>
        {/* État vide avec design premium */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900/90 via-gray-900/90 to-zinc-900/90 backdrop-blur-xl">
          {/* Éléments de fond animés */}
          <div className="absolute inset-0">
            <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-2xl animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-gradient-to-r from-red-500/15 to-pink-500/15 rounded-full blur-2xl animate-bounce"></div>
          </div>

          <div className="relative z-10 p-12 min-h-[400px] flex flex-col justify-center items-center text-center">
            <div className="relative mb-8">
              <div className="p-6 bg-gradient-to-br from-gray-700/50 to-gray-800/50 rounded-3xl backdrop-blur-md border border-white/10">
                <Film className="h-16 w-16 text-gray-400" />
              </div>
            </div>
            
            <h3 className="text-white text-3xl font-bold mb-4">
              Aucun Trailer Disponible
            </h3>
            <p className="text-white/70 text-xl max-w-md">
              Les trailers seront bientôt disponibles. Revenez plus tard pour découvrir les dernières bandes-annonces !
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`relative overflow-hidden ${className}`}>
      {/* Container principal avec glassmorphism et effets premium */}
      <div className="relative rounded-3xl overflow-hidden">
        {/* Arrière-plan dynamique ultramoderne */}
        <div className="absolute inset-0">
          {/* Gradient de base premium */}
          <div className="absolute inset-0 bg-gradient-to-br from-violet-900 via-purple-900 to-fuchsia-900"></div>
          
          {/* Orbes flottantes animées */}
          <div className="absolute top-10 left-10 w-40 h-40 bg-gradient-to-r from-blue-400/30 to-cyan-400/30 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-10 right-10 w-48 h-48 bg-gradient-to-r from-pink-400/25 to-red-400/25 rounded-full blur-3xl animate-float-delayed"></div>
          <div className="absolute top-1/2 left-20 w-32 h-32 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 rounded-full blur-2xl animate-float-slow"></div>
          <div className="absolute bottom-1/4 left-1/2 w-36 h-36 bg-gradient-to-r from-green-400/15 to-emerald-400/15 rounded-full blur-2xl animate-bounce"></div>
          
          {/* Motifs géométriques */}
          <div 
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: `
                radial-gradient(circle at 25% 25%, rgba(255,255,255,0.2) 2px, transparent 2px),
                radial-gradient(circle at 75% 75%, rgba(255,255,255,0.1) 1px, transparent 1px)
              `,
              backgroundSize: '60px 60px, 40px 40px'
            }}
          ></div>
          
          {/* Lignes de connexion animées */}
          <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.3)" />
                <stop offset="50%" stopColor="rgba(255,255,255,0.1)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0.3)" />
              </linearGradient>
            </defs>
            <path
              d="M0,100 Q200,50 400,100 T800,100"
              stroke="url(#lineGradient)"
              strokeWidth="2"
              fill="none"
              className="animate-pulse"
            />
            <path
              d="M0,200 Q300,150 600,200 T1200,200"
              stroke="url(#lineGradient)"
              strokeWidth="1"
              fill="none"
              className="animate-pulse"
              style={{ animationDelay: '1s' }}
            />
          </svg>
        </div>

        {/* Overlay glassmorphism */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-black/10 to-black/20 backdrop-blur-sm"></div>

        {/* Contenu principal */}
        <div className="relative z-10 p-6 lg:p-8">
          {/* Header compact mais stylé */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                {/* Icône avec effet néon */}
                <div className="relative">
                  <div className="p-3 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl shadow-xl">
                    <Film className="h-7 w-7 text-white" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl blur-lg opacity-50 animate-pulse"></div>
                </div>
                
                {/* Titre compact */}
                <div>
                  <h2 className="text-3xl lg:text-4xl font-black bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent leading-tight">
                    Trailers Populaires
                  </h2>
                  <div className="flex items-center space-x-2 mt-2">
                    <TrendingUp className="h-4 w-4 text-yellow-400 animate-pulse" />
                    <span className="text-white/90 text-sm font-semibold">
                      Les plus sensationnels du moment
                    </span>
                    <div className="px-2 py-1 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 rounded-full border border-yellow-400/30">
                      <span className="text-yellow-300 text-xs font-bold">NOUVEAU</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats compacts */}
              <div className="hidden lg:flex items-center space-x-3">
                <div className="flex items-center space-x-4 bg-white/10 backdrop-blur-md rounded-xl px-4 py-2 border border-white/20">
                  <div className="flex items-center space-x-1">
                    <Eye className="h-4 w-4 text-blue-400" />
                    <span className="text-white font-bold text-sm">{trailers.length}</span>
                    <span className="text-white/60 text-xs">trailers</span>
                  </div>
                  <div className="w-px h-4 bg-white/30"></div>
                  <div className="flex items-center space-x-1">
                    <Film className="h-4 w-4 text-purple-400" />
                    <span className="text-white font-bold text-sm">{trailers.filter(t => 'title' in t.content).length}</span>
                    <span className="text-white/60 text-xs">films</span>
                  </div>
                  <div className="w-px h-4 bg-white/30"></div>
                  <div className="flex items-center space-x-1">
                    <TrendingUp className="h-4 w-4 text-green-400" />
                    <span className="text-white font-bold text-sm">{trailers.filter(t => 'name' in t.content).length}</span>
                    <span className="text-white/60 text-xs">séries</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Description compacte */}
            <div className="max-w-3xl">
              <p className="text-lg text-white/90 leading-relaxed font-light">
                Découvrez les bandes-annonces les plus populaires dans notre collection horizontale. 
                <span className="font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Faites défiler pour explorer l'univers cinématographique.
                </span>
              </p>
            </div>
          </div>

          {/* Grid de trailers en format horizontal compact */}
          <div className="relative">
            <div 
              ref={scrollContainerRef}
              className="overflow-x-auto scrollbar-hide scroll-smooth px-8 cursor-grab active:cursor-grabbing"
            >
              <div className="flex space-x-6 pb-4" style={{ width: 'max-content' }}>
                {trailers.slice(0, 20).map((trailerItem, index) => (
                <div
                  key={`${trailerItem.content.id}-${index}`}
                  className="group cursor-pointer flex-shrink-0"
                  onClick={() => openTrailer(trailerItem)}
                  style={{
                    animationDelay: `${index * 0.05}s`
                  }}
                >
                  <div className="relative bg-white/5 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/20 hover:border-white/40 transition-all duration-500 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/20 w-80">
                    {/* Image container horizontal avec ratio 16:9 */}
                    <div className="relative h-44 overflow-hidden">
                      {getBackdrop(trailerItem.content) ? (
                        <>
                          <img
                            src={getImageUrl(getBackdrop(trailerItem.content), 'w780')}
                            alt={getTitle(trailerItem.content)}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                          {/* Gradient overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-30 transition-opacity duration-500"></div>
                          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-blue-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        </>
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                          <Film className="h-12 w-12 text-gray-600" />
                        </div>
                      )}
                      
                      {/* Bouton play compact */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <div className="relative">
                          <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-xl">
                            <Play className="h-8 w-8 text-white ml-1" fill="currentColor" />
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-600 rounded-full blur-xl opacity-50 animate-pulse"></div>
                        </div>
                      </div>

                      {/* Badges compacts */}
                      <div className="absolute top-3 right-3 flex flex-col space-y-1">
                        <div className="bg-black/60 backdrop-blur-xl border border-white/20 rounded-xl px-2 py-1 flex items-center space-x-1">
                          <Star className="h-3 w-3 text-yellow-400" fill="currentColor" />
                          <span className="text-white font-bold text-xs">
                            {getVoteAverage(trailerItem.content).toFixed(1)}
                          </span>
                        </div>
                        
                        {trailerItem.content.popularity > 50 && (
                          <div className="bg-gradient-to-r from-orange-500/80 to-red-500/80 backdrop-blur-xl border border-orange-400/50 rounded-lg px-2 py-1">
                            <span className="text-white text-xs font-bold">HOT</span>
                          </div>
                        )}
                      </div>

                      {/* Position indicator compact */}
                      <div className="absolute top-3 left-3 w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-xs">#{index + 1}</span>
                      </div>
                    </div>

                    {/* Contenu compact */}
                    <div className="p-4">
                      <h3 className="text-white font-bold text-lg mb-2 line-clamp-1 group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-400 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-500">
                        {getTitle(trailerItem.content)}
                      </h3>
                      
                      <div className="flex items-center justify-between text-white/70 text-sm mb-3">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span className="font-medium text-xs">
                            {new Date(getDate(trailerItem.content)).getFullYear()}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1 px-2 py-1 bg-white/10 rounded-lg">
                          <Zap className="h-3 w-3 text-yellow-400" />
                          <span className="text-xs font-bold">TRAILER</span>
                        </div>
                      </div>

                      {/* Barre de progression compacte */}
                      <div className="relative">
                        <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full transition-all duration-1000 group-hover:animate-pulse"
                            style={{ width: `${Math.min((getVoteAverage(trailerItem.content) || 0) * 10, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    {/* Effet de bordure */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-pink-500/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-lg"></div>
                  </div>
                </div>
              ))}
              </div>
            </div>
          </div>

          {/* Footer compact */}
          <div className="mt-8 text-center">
            <div className="inline-flex items-center space-x-3 px-6 py-3 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20">
              <Sparkles className="h-5 w-5 text-yellow-400 animate-pulse" />
              <span className="text-white font-medium">Mise à jour en temps réel</span>
              <div className="w-px h-4 bg-white/30"></div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-white/80 text-sm">En direct</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal optimisé pour les trailers */}
      {selectedTrailer && selectedTrailer.trailer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-2xl p-4">
          <div className="relative w-full max-w-5xl mx-auto">
            {/* Bouton de fermeture optimisé */}
            <button
              onClick={closeTrailer}
              className="absolute -top-16 right-0 group z-10"
            >
              <div className="relative">
                <div className="w-12 h-12 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl flex items-center justify-center group-hover:bg-red-500/20 group-hover:border-red-500/40 transition-all duration-300">
                  <X className="h-6 w-6 text-white group-hover:text-red-400 transition-colors" />
                </div>
                <div className="absolute inset-0 bg-red-500 rounded-xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
              </div>
            </button>
            
            {/* Container vidéo avec ratio 16:9 optimisé */}
            <div className="relative w-full" style={{ aspectRatio: '16 / 9' }}>
              {/* Effets de bordure subtils */}
              <div className="absolute -inset-2 bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-pink-500/30 rounded-2xl blur-lg opacity-50"></div>
              
              {/* Video iframe avec taille optimisée */}
              <iframe
                src={`https://www.youtube.com/embed/${selectedTrailer.trailer.key}?autoplay=1&rel=0&modestbranding=1&color=white&iv_load_policy=3&showinfo=0&controls=1`}
                title={`Trailer: ${getTitle(selectedTrailer.content)}`}
                className="relative z-10 w-full h-full rounded-xl shadow-2xl border border-white/20"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>

            {/* Info du trailer compacte */}
            <div className="mt-6 text-center">
              <h3 className="text-white text-xl font-bold mb-2">
                {getTitle(selectedTrailer.content)}
              </h3>
              <p className="text-white/70">
                Bande-annonce officielle • {new Date(getDate(selectedTrailer.content)).getFullYear()}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
