'use client'

import React from 'react';
import { SearchResult } from '@/types';
import ContentCard from './ContentCard';

interface AllTrendingCarouselProps {
  content: SearchResult[];
  onContentClick?: (content: SearchResult) => void;
  className?: string;
}

export default function AllTrendingCarousel({ 
  content, 
  onContentClick, 
  className = '' 
}: AllTrendingCarouselProps) {

  if (content.length === 0) {
    return (
      <div className={`${className}`}>
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            Aucun contenu tendance disponible pour le moment.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Carousel container avec défilement horizontal natif */}
      <div 
        className="overflow-x-auto overflow-y-hidden scrollbar-hide scroll-smooth pb-4"
        style={{ 
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
      >
        <div className="flex gap-4" style={{ width: 'max-content' }}>
          {content.map((item) => (
            <div
              key={`${item.media_type}-${item.id}`}
              className="flex-shrink-0 w-40 sm:w-44 md:w-48 lg:w-52"
            >
              <ContentCard
                content={item}
                onContentClick={onContentClick}
                className="h-full"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
