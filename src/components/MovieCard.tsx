import React from 'react';
import Image from 'next/image';
import { Star, Calendar, Film } from 'lucide-react';
import { Movie } from '@/types';
import { getImageUrl } from '@/lib/tmdb';
import { formatDateToYear, formatRating, getRatingColor } from '@/lib/utils';

interface MovieCardProps {
  movie: Movie;
  onMovieClick: (movie: Movie) => void;
  className?: string;
}

export default function MovieCard({ movie, onMovieClick, className = '' }: MovieCardProps) {
  const handleClick = () => {
    onMovieClick(movie);
  };

  return (
    <div
      className={`group cursor-pointer bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 ${className}`}
      onClick={handleClick}
    >
      {/* Image */}
      <div className="relative aspect-[2/3] overflow-hidden">
        {movie.poster_path ? (
          <Image
            src={getImageUrl(movie.poster_path, 'w300')}
            alt={movie.title}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            <Film size={32} className="text-gray-400" />
          </div>
        )}
        
        {/* Overlay avec gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Rating badge */}
        <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center space-x-1">
          <Star size={12} className={getRatingColor(movie.vote_average)} fill="currentColor" />
          <span className="text-white text-xs font-bold">
            {formatRating(movie.vote_average)}
          </span>
        </div>
      </div>
      
      {/* Contenu */}
      <div className="p-3">
        <h3 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-2 mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {movie.title}
        </h3>
        
        <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
          <div className="flex items-center space-x-1">
            <Calendar size={10} />
            <span>{formatDateToYear(movie.release_date)}</span>
          </div>
          
          {movie.vote_count > 0 && (
            <span className="text-xs">
              {movie.vote_count} votes
            </span>
          )}
        </div>
        
        {/* Overview preview */}
        {movie.overview && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">
            {movie.overview}
          </p>
        )}
      </div>
    </div>
  );
}
