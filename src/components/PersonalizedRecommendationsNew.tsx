'use client'

import React, { useState, useEffect } from 'react';
import { Star, TrendingUp, Heart, Clock, Info } from 'lucide-react';
import { IntelligentRecommendationService, RecommendationScore } from '@/lib/intelligent-recommendations';
import { useAuth } from '@/components/AuthProvider';
import Image from 'next/image';
import Link from 'next/link';

interface PersonalizedRecommendationsProps {
  limit?: number;
  showTitle?: boolean;
}

export default function PersonalizedRecommendations({ 
  limit = 12, 
  showTitle = true 
}: PersonalizedRecommendationsProps) {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<RecommendationScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRecommendations = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const recs = await IntelligentRecommendationService.getPersonalizedRecommendations(
          user.id, 
          limit
        );
        
        setRecommendations(recs);
      } catch (err) {
        console.error('Erreur lors du chargement des recommandations:', err);
        setError('Impossible de charger les recommandations');
      } finally {
        setLoading(false);
      }
    };

    loadRecommendations();
  }, [user, limit]);

  if (!user) {
    return (
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 text-center">
        <Heart className="h-12 w-12 text-purple-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">
          Recommandations personnalisées
        </h3>
        <p className="text-white/60 mb-4">
          Connectez-vous pour recevoir des recommandations basées sur vos goûts
        </p>
        <Link 
          href="/auth"
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-medium rounded-xl hover:from-purple-600 hover:to-pink-700 transition-all duration-300"
        >
          Se connecter
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {showTitle && (
          <div className="flex items-center space-x-3">
            <TrendingUp className="h-6 w-6 text-purple-400" />
            <h2 className="text-2xl font-bold text-white">
              Recommandé pour vous
            </h2>
          </div>
        )}
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {Array.from({ length: limit }).map((_, index) => (
            <div 
              key={index}
              className="aspect-[2/3] bg-white/5 rounded-xl animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-center">
        <Info className="h-8 w-8 text-red-400 mx-auto mb-3" />
        <p className="text-red-400 font-medium">{error}</p>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 text-center">
        <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">
          Pas encore de recommandations
        </h3>
        <p className="text-white/60">
          Regardez quelques séries ou films pour recevoir des recommandations personnalisées
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {showTitle && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <TrendingUp className="h-6 w-6 text-purple-400" />
            <h2 className="text-2xl font-bold text-white">
              Recommandé pour vous
            </h2>
          </div>
          
          <div className="text-sm text-white/60">
            Basé sur vos goûts • {recommendations.length} suggestions
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {recommendations.map((rec, index) => (
          <RecommendationCard 
            key={`${rec.content.id}-${rec.type}-${index}`} 
            recommendation={rec} 
          />
        ))}
      </div>
    </div>
  );
}

interface RecommendationCardProps {
  recommendation: RecommendationScore;
}

function RecommendationCard({ recommendation }: RecommendationCardProps) {
  const { content, score, reasons, type } = recommendation;
  
  const title = 'name' in content ? content.name : content.title;
  const releaseDate = 'first_air_date' in content ? content.first_air_date : content.release_date;
  const year = releaseDate ? new Date(releaseDate).getFullYear() : null;
  const imageUrl = content.poster_path 
    ? `https://image.tmdb.org/t/p/w500${content.poster_path}`
    : '/placeholder-poster.jpg';

  const linkHref = type === 'serie' ? `/serie/${content.id}` : `/movie/${content.id}`;

  return (
    <div className="group relative">
      <Link href={linkHref}>
        <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-white/5 hover:bg-white/10 transition-all duration-300 group-hover:scale-105">
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 16vw"
          />
          
          {/* Overlay avec score */}
          <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm rounded-lg px-2 py-1">
            <div className="flex items-center space-x-1">
              <Star className="h-3 w-3 text-yellow-400 fill-current" />
              <span className="text-xs font-medium text-white">
                {(content.vote_average || 0).toFixed(1)}
              </span>
            </div>
          </div>

          {/* Badge de recommandation */}
          <div className="absolute top-2 left-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg px-2 py-1">
            <span className="text-xs font-bold text-white">
              {Math.round(score)}%
            </span>
          </div>

          {/* Hover overlay avec raisons */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-3">
            <div className="space-y-2">
              <h4 className="font-semibold text-white text-sm line-clamp-2">
                {title}
              </h4>
              
              {year && (
                <p className="text-white/60 text-xs">
                  {year} • {type === 'serie' ? 'Série' : 'Film'}
                </p>
              )}
              
              <div className="space-y-1">
                {reasons.slice(0, 2).map((reason, index) => (
                  <div 
                    key={index}
                    className="text-xs text-white/80 bg-white/10 rounded-md px-2 py-1"
                  >
                    {reason}
                  </div>
                ))}
                
                {reasons.length > 2 && (
                  <div className="text-xs text-purple-300 font-medium">
                    +{reasons.length - 2} autres raisons
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
