'use client'

import React from 'react';
import { Star, Calendar, User } from 'lucide-react';
import { Movie, Serie, Person, SearchResult } from '@/types';
import { getImageUrl } from '@/lib/tmdb';

interface ContentCardProps {
  content: SearchResult;
  onContentClick?: (content: SearchResult) => void;
  className?: string;
}

export default function ContentCard({ content, onContentClick, className = '' }: ContentCardProps) {
  const handleClick = () => {
    onContentClick?.(content);
  };

  const getTitle = () => {
    if (content.media_type === 'movie') {
      return (content as Movie).title;
    } else if (content.media_type === 'tv') {
      return (content as Serie).name;
    } else if (content.media_type === 'person') {
      return (content as Person).name;
    }
    return 'Titre inconnu';
  };

  const getDate = () => {
    if (content.media_type === 'movie') {
      return (content as Movie).release_date;
    } else if (content.media_type === 'tv') {
      return (content as Serie).first_air_date;
    }
    return null;
  };

  const getRating = () => {
    if (content.media_type === 'movie') {
      return (content as Movie).vote_average;
    } else if (content.media_type === 'tv') {
      return (content as Serie).vote_average;
    }
    return null;
  };

  const getOverview = () => {
    if (content.media_type === 'movie') {
      return (content as Movie).overview;
    } else if (content.media_type === 'tv') {
      return (content as Serie).overview;
    }
    return null;
  };

  const getImagePath = () => {
    if (content.media_type === 'person') {
      return (content as Person).profile_path;
    } else if (content.media_type === 'movie') {
      return (content as Movie).poster_path;
    } else if (content.media_type === 'tv') {
      return (content as Serie).poster_path;
    }
    return null;
  };

  const getMediaTypeBadge = () => {
    const badges = {
      movie: { label: 'Film', color: 'bg-blue-500' },
      tv: { label: 'Série', color: 'bg-green-500' },
      person: { label: 'Personne', color: 'bg-purple-500' }
    };
    
    const badge = badges[content.media_type];
    return (
      <span className={`inline-block px-2 py-1 text-xs font-semibold text-white rounded-full ${badge.color}`}>
        {badge.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).getFullYear().toString();
  };

  const title = getTitle();
  const date = getDate();
  const rating = getRating();
  const overview = getOverview();
  const imagePath = getImagePath();

  return (
    <div 
      className={`group relative bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer ${className}`}
      onClick={handleClick}
    >
      {/* Image */}
      <div className="relative aspect-[2/3] rounded-t-lg overflow-hidden">
        <img
          src={getImageUrl(imagePath)}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        
        {/* Media type badge */}
        <div className="absolute top-2 left-2">
          {getMediaTypeBadge()}
        </div>

        {/* Rating badge pour films et séries */}
        {rating && rating > 0 && (
          <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded-md text-xs font-semibold flex items-center space-x-1">
            <Star size={12} className="text-yellow-400" fill="currentColor" />
            <span>{rating.toFixed(1)}</span>
          </div>
        )}
      </div>

      {/* Content info */}
      <div className="p-4">
        <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2 line-clamp-2">
          {title}
        </h3>
        
        {/* Date pour films et séries */}
        {date && (
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
            <Calendar size={14} className="mr-1" />
            <span>{formatDate(date)}</span>
          </div>
        )}

        {/* Profession pour les personnes */}
        {content.media_type === 'person' && (content as Person).character && (
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
            <User size={14} className="mr-1" />
            <span className="line-clamp-1">{(content as Person).character}</span>
          </div>
        )}

        {/* Overview pour films et séries */}
        {overview && (
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
            {overview}
          </p>
        )}
      </div>
    </div>
  );
}
