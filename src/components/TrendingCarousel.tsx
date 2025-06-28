'use client'

import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import SerieCard from './SerieCard';
import { Serie } from '@/types';

interface TrendingCarouselProps {
  series: Serie[];
  onSerieClick: (serie: Serie) => void;
  autoScrollInterval?: number;
}

export default function TrendingCarousel({ 
  series, 
  onSerieClick, 
  autoScrollInterval = 3000 
}: TrendingCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isHovering, setIsHovering] = useState(false);
  const [progress, setProgress] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const itemsToShow = {
    mobile: 2,
    tablet: 4,
    desktop: 6,
    large: 8
  };

  const getItemsPerView = () => {
    if (typeof window === 'undefined') return itemsToShow.desktop;
    
    if (window.innerWidth < 768) return itemsToShow.mobile;
    if (window.innerWidth < 1024) return itemsToShow.tablet;
    if (window.innerWidth < 1536) return itemsToShow.desktop;
    return itemsToShow.large;
  };

  const [itemsPerView, setItemsPerView] = useState(getItemsPerView());

  useEffect(() => {
    const handleResize = () => {
      setItemsPerView(getItemsPerView());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const maxIndex = Math.max(0, series.length - itemsPerView);

  const startAutoScroll = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    
    setProgress(0);
    
    // Barre de progression
    progressIntervalRef.current = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          return 0;
        }
        return prev + (100 / (autoScrollInterval / 50));
      });
    }, 50);
    
    intervalRef.current = setInterval(() => {
      if (!isHovering && isPlaying) {
        setCurrentIndex(prev => (prev >= maxIndex ? 0 : prev + 1));
        setProgress(0);
      }
    }, autoScrollInterval);
  };

  const stopAutoScroll = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  };

  useEffect(() => {
    if (isPlaying && !isHovering) {
      startAutoScroll();
    } else {
      stopAutoScroll();
    }

    return () => stopAutoScroll();
  }, [isPlaying, isHovering, maxIndex, autoScrollInterval]);

  const goToPrevious = () => {
    setCurrentIndex(prev => (prev <= 0 ? maxIndex : prev - 1));
    setProgress(0);
  };

  const goToNext = () => {
    setCurrentIndex(prev => (prev >= maxIndex ? 0 : prev + 1));
    setProgress(0);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  if (series.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <p className="text-gray-500 dark:text-gray-400">Aucune tendance disponible</p>
      </div>
    );
  }

  return (
    <div 
      className="relative group"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Contrôles de navigation */}
      <div className="absolute top-4 right-4 z-10 flex items-center space-x-2">
        {/* Indicateur de progression auto-scroll */}
        {isPlaying && !isHovering && (
          <div className="bg-black/50 rounded-full px-3 py-1 flex items-center space-x-2">
            <div className="w-8 h-1 bg-gray-400 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white transition-all duration-75 ease-linear"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-white text-xs">Auto</span>
          </div>
        )}
        
        <button
          onClick={togglePlayPause}
          className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all opacity-0 group-hover:opacity-100"
          title={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? <Pause size={16} /> : <Play size={16} />}
        </button>
      </div>

      {/* Bouton précédent */}
      <button
        onClick={goToPrevious}
        className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all opacity-0 group-hover:opacity-100"
        disabled={currentIndex === 0}
      >
        <ChevronLeft size={20} />
      </button>

      {/* Bouton suivant */}
      <button
        onClick={goToNext}
        className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all opacity-0 group-hover:opacity-100"
        disabled={currentIndex === maxIndex}
      >
        <ChevronRight size={20} />
      </button>

      {/* Carrousel */}
      <div 
        ref={carouselRef}
        className="overflow-hidden rounded-lg"
      >
        <div 
          className="flex transition-transform duration-500 ease-in-out"
          style={{ 
            transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
            width: `${(series.length / itemsPerView) * 100}%`
          }}
        >
          {series.map((serie, index) => (
            <div 
              key={serie.id}
              className="flex-shrink-0 px-2"
              style={{ width: `${100 / series.length}%` }}
            >
              <SerieCard 
                serie={serie} 
                onSerieClick={onSerieClick}
                className="h-full"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Indicateurs */}
      <div className="flex justify-center mt-4 space-x-2">
        {Array.from({ length: maxIndex + 1 }, (_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentIndex 
                ? 'bg-blue-600' 
                : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
            }`}
          />
        ))}
      </div>

      {/* Compteur */}
      <div className="text-center mt-2">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {currentIndex * itemsPerView + 1}-{Math.min((currentIndex + 1) * itemsPerView, series.length)} sur {series.length}
        </span>
      </div>
    </div>
  );
}
