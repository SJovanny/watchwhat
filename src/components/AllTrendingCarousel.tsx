'use client'

import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(6);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Calculer le nombre d'éléments visibles selon la taille de l'écran
  useEffect(() => {
    const updateItemsPerView = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setItemsPerView(2); // Mobile
      } else if (width < 768) {
        setItemsPerView(3); // Small tablet
      } else if (width < 1024) {
        setItemsPerView(4); // Tablet
      } else if (width < 1280) {
        setItemsPerView(5); // Small desktop
      } else {
        setItemsPerView(6); // Large desktop
      }
    };

    updateItemsPerView();
    window.addEventListener('resize', updateItemsPerView);
    return () => window.removeEventListener('resize', updateItemsPerView);
  }, []);

  const maxIndex = Math.max(0, content.length - itemsPerView);

  const nextSlide = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, maxIndex));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  const canGoNext = currentIndex < maxIndex;
  const canGoPrev = currentIndex > 0;

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
      {/* Navigation buttons */}
      {content.length > itemsPerView && (
        <>
          <button
            onClick={prevSlide}
            disabled={!canGoPrev}
            className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full shadow-lg transition-all duration-200 ${
              canGoPrev
                ? 'bg-white dark:bg-gray-800 text-gray-800 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
            }`}
            aria-label="Contenu précédent"
          >
            <ChevronLeft size={20} />
          </button>

          <button
            onClick={nextSlide}
            disabled={!canGoNext}
            className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full shadow-lg transition-all duration-200 ${
              canGoNext
                ? 'bg-white dark:bg-gray-800 text-gray-800 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
            }`}
            aria-label="Contenu suivant"
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}

      {/* Carousel container */}
      <div className="overflow-hidden mx-8" ref={carouselRef}>
        <div 
          className="flex transition-transform duration-300 ease-in-out gap-4"
          style={{ 
            transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
            width: `${(content.length / itemsPerView) * 100}%`
          }}
        >
          {content.map((item) => (
            <div
              key={`${item.media_type}-${item.id}`}
              className="flex-shrink-0"
              style={{ width: `${100 / content.length}%` }}
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

      {/* Indicators */}
      {content.length > itemsPerView && (
        <div className="flex justify-center mt-6 space-x-2">
          {Array.from({ length: maxIndex + 1 }, (_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                index === currentIndex
                  ? 'bg-blue-600'
                  : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
              }`}
              aria-label={`Aller à la page ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
