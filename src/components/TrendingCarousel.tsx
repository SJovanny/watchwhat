'use client'

import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import SerieCard from './SerieCard';
import { Serie } from '@/types';

interface TrendingCarouselProps {
  series: Serie[];
  onSerieClick: (serie: Serie) => void;
  autoScrollSpeed?: number; // Vitesse en millisecondes (plus bas = plus rapide)
}

export default function TrendingCarousel({ 
  series, 
  onSerieClick, 
  autoScrollSpeed = 50 // Défilement fluide toutes les 50ms
}: TrendingCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false); // Désactivé par défaut
  const [isHovering, setIsHovering] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const innerCarouselRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);

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

  // Auto-scroll fluide et continu
  const startAutoScroll = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    const animate = () => {
      if (!isHovering && isPlaying) {
        setScrollPosition(prev => {
          const cardWidth = carouselRef.current ? carouselRef.current.offsetWidth / itemsPerView : 300;
          const newPosition = prev + 1; // Vitesse de défilement en pixels
          const maxScroll = (series.length - itemsPerView) * cardWidth;
          
          // Reset au début quand on atteint la fin
          if (newPosition >= maxScroll + cardWidth) {
            setCurrentIndex(0);
            return 0;
          }
          
          // Mettre à jour l'index actuel basé sur la position
          const newIndex = Math.floor(newPosition / cardWidth);
          if (newIndex !== currentIndex && newIndex <= maxIndex) {
            setCurrentIndex(newIndex);
          }
          
          return newPosition;
        });
      }
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
  };

  const stopAutoScroll = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  };

  useEffect(() => {
    if (isPlaying) {
      startAutoScroll();
    } else {
      stopAutoScroll();
    }

    return () => stopAutoScroll();
  }, [isPlaying, isHovering, series.length]);

  const goToPrevious = () => {
    const newIndex = currentIndex <= 0 ? maxIndex : currentIndex - 1;
    setCurrentIndex(newIndex);
    const cardWidth = carouselRef.current ? carouselRef.current.offsetWidth / itemsPerView : 300;
    setScrollPosition(newIndex * cardWidth);
  };

  const goToNext = () => {
    const newIndex = currentIndex >= maxIndex ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
    const cardWidth = carouselRef.current ? carouselRef.current.offsetWidth / itemsPerView : 300;
    setScrollPosition(newIndex * cardWidth);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  // Gestion du déplacement manuel (drag-and-drop)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isPlaying) return; // Si auto-scroll est actif, ne pas permettre le drag
    
    setIsDragging(true);
    setStartX(e.pageX - (carouselRef.current?.offsetLeft || 0));
    setScrollLeft(scrollPosition);
    
    // Désactiver la sélection de texte pendant le drag
    document.body.style.userSelect = 'none';
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    document.body.style.userSelect = '';
    
    // Snapping à l'index le plus proche
    if (carouselRef.current) {
      const cardWidth = carouselRef.current.offsetWidth / itemsPerView;
      const newIndex = Math.round(scrollPosition / cardWidth);
      setCurrentIndex(Math.min(newIndex, maxIndex));
      setScrollPosition(Math.min(newIndex, maxIndex) * cardWidth);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || isPlaying) return;
    e.preventDefault();
    
    const x = e.pageX - (carouselRef.current?.offsetLeft || 0);
    const walk = (x - startX) * 1.5; // Multiplicateur de vitesse
    const newPosition = Math.max(0, Math.min(scrollLeft - walk, (series.length - itemsPerView) * (carouselRef.current?.offsetWidth || 0) / itemsPerView));
    
    setScrollPosition(newPosition);
    
    // Mettre à jour l'index basé sur la position
    if (carouselRef.current) {
      const cardWidth = carouselRef.current.offsetWidth / itemsPerView;
      const newIndex = Math.floor(newPosition / cardWidth);
      if (newIndex !== currentIndex && newIndex >= 0 && newIndex <= maxIndex) {
        setCurrentIndex(newIndex);
      }
    }
  };

  // Gestion du touch pour mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (isPlaying) return;
    
    setIsDragging(true);
    setStartX(e.touches[0].clientX - (carouselRef.current?.offsetLeft || 0));
    setScrollLeft(scrollPosition);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || isPlaying) return;
    
    const x = e.touches[0].clientX - (carouselRef.current?.offsetLeft || 0);
    const walk = (x - startX) * 1.5;
    const newPosition = Math.max(0, Math.min(scrollLeft - walk, (series.length - itemsPerView) * (carouselRef.current?.offsetWidth || 0) / itemsPerView));
    
    setScrollPosition(newPosition);
    
    if (carouselRef.current) {
      const cardWidth = carouselRef.current.offsetWidth / itemsPerView;
      const newIndex = Math.floor(newPosition / cardWidth);
      if (newIndex !== currentIndex && newIndex >= 0 && newIndex <= maxIndex) {
        setCurrentIndex(newIndex);
      }
    }
  };

  const handleTouchEnd = () => {
    handleMouseUp();
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
        {/* Indicateur de statut auto-scroll */}
        {isPlaying && !isHovering && (
          <div className="bg-black/50 rounded-full px-3 py-1 flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
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
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div 
          className="flex transition-none"
          style={{ 
            transform: `translateX(-${scrollPosition}px)`,
            width: `${series.length * (carouselRef.current ? carouselRef.current.offsetWidth / itemsPerView : 300)}px`
          }}
        >
          {series.map((serie, index) => (
            <div 
              key={serie.id}
              className="flex-shrink-0 px-2"
              style={{ 
                width: `${carouselRef.current ? carouselRef.current.offsetWidth / itemsPerView : 300}px`
              }}
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
            onClick={() => {
              setCurrentIndex(index);
              const cardWidth = carouselRef.current ? carouselRef.current.offsetWidth / itemsPerView : 300;
              setScrollPosition(index * cardWidth);
            }}
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
