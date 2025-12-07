'use client'

import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import SerieCard from './SerieCard';
import { Serie } from '@/types';

interface TrendingCarouselProps {
  series: Serie[];
  onSerieClick: (serie: Serie) => void;
}

export default function TrendingCarousel({ 
  series, 
  onSerieClick
}: TrendingCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [scrollPosition, setScrollPosition] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Configuration responsive pour le nombre d'éléments visibles
  const itemsToShow = {
    mobile: 2,
    tablet: 4,
    desktop: 6,
    large: 8
  };

  // Déterminer combien d'items afficher selon la taille de l'écran
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

    // Prévention du comportement de défilement par défaut pour permettre le défilement horizontal
    const preventDefaultScroll = (e: WheelEvent) => {
      if (carouselRef.current?.contains(e.target as Node)) {
        e.preventDefault();
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('wheel', preventDefaultScroll, { passive: false });
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('wheel', preventDefaultScroll);
    };
  }, []);

  // Calcul du nombre maximum d'indices
  const maxIndex = Math.max(0, series.length - itemsPerView);

  // Navigation
  const goToPrevious = () => {
    const newIndex = currentIndex <= 0 ? 0 : currentIndex - 1;
    setCurrentIndex(newIndex);
    
    if (carouselRef.current) {
      const cardWidth = carouselRef.current.offsetWidth / itemsPerView;
      setScrollPosition(newIndex * cardWidth);
    }
  };

  const goToNext = () => {
    const newIndex = currentIndex >= maxIndex ? maxIndex : currentIndex + 1;
    setCurrentIndex(newIndex);
    
    if (carouselRef.current) {
      const cardWidth = carouselRef.current.offsetWidth / itemsPerView;
      setScrollPosition(newIndex * cardWidth);
    }
  };

  // Gestion du défilement horizontal par scroll (molette/trackpad)
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault(); // Empêcher le défilement vertical de la page
    
    if (carouselRef.current) {
      const cardWidth = carouselRef.current.offsetWidth / itemsPerView;
      const maxScrollPosition = maxIndex * cardWidth;
      
      // Déplacement proportionnel à la vitesse de scroll, avec deltaX pour le scroll horizontal
      // et deltaY pour le scroll vertical (qu'on transforme en horizontal)
      const scrollDelta = e.deltaX !== 0 ? e.deltaX : e.deltaY;
      const newPosition = Math.max(0, Math.min(scrollPosition + scrollDelta, maxScrollPosition));
      
      setScrollPosition(newPosition);
      
      // Mise à jour de l'index basé sur la position
      const newIndex = Math.floor(newPosition / cardWidth);
      if (newIndex !== currentIndex && newIndex >= 0 && newIndex <= maxIndex) {
        setCurrentIndex(newIndex);
      }
    }
  };

  // Gestion du défilement manuel par glisser-déposer
  const handleMouseDown = (e: React.MouseEvent) => {
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
      const clampedIndex = Math.max(0, Math.min(newIndex, maxIndex));
      setCurrentIndex(clampedIndex);
      setScrollPosition(clampedIndex * cardWidth);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    
    const x = e.pageX - (carouselRef.current?.offsetLeft || 0);
    const walk = (x - startX); // Distance parcourue
    
    if (carouselRef.current) {
      const maxScrollPosition = maxIndex * carouselRef.current.offsetWidth / itemsPerView;
      const newPosition = Math.max(0, Math.min(scrollLeft - walk, maxScrollPosition));
      setScrollPosition(newPosition);
      
      // Mise à jour de l'index basé sur la position
      const cardWidth = carouselRef.current.offsetWidth / itemsPerView;
      const newIndex = Math.floor(newPosition / cardWidth);
      if (newIndex !== currentIndex) {
        setCurrentIndex(newIndex);
      }
    }
  };

  // Gestion du touch pour mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].clientX - (carouselRef.current?.offsetLeft || 0));
    setScrollLeft(scrollPosition);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    const x = e.touches[0].clientX - (carouselRef.current?.offsetLeft || 0);
    const walk = (x - startX);
    
    if (carouselRef.current) {
      const maxScrollPosition = maxIndex * carouselRef.current.offsetWidth / itemsPerView;
      const newPosition = Math.max(0, Math.min(scrollLeft - walk, maxScrollPosition));
      setScrollPosition(newPosition);
      
      const cardWidth = carouselRef.current.offsetWidth / itemsPerView;
      const newIndex = Math.floor(newPosition / cardWidth);
      if (newIndex !== currentIndex) {
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
    <div className="relative group">
      {/* Bouton précédent */}
      <button
        onClick={goToPrevious}
        className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all opacity-70 hover:opacity-100"
        disabled={currentIndex === 0}
      >
        <ChevronLeft size={20} />
      </button>

      {/* Bouton suivant */}
      <button
        onClick={goToNext}
        className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all opacity-70 hover:opacity-100"
        disabled={currentIndex === maxIndex}
      >
        <ChevronRight size={20} />
      </button>

      {/* Carrousel avec défilement manuel et scroll horizontal */}
      <div 
        ref={carouselRef}
        className="overflow-hidden rounded-lg cursor-grab active:cursor-grabbing"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onMouseMove={handleMouseMove}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div 
          className="flex transition-transform duration-300 ease-out"
          style={{ 
            transform: `translateX(-${scrollPosition}px)`,
            width: `${series.length * (carouselRef.current ? carouselRef.current.offsetWidth / itemsPerView : 300)}px`
          }}
        >
          {series.map((serie) => (
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

      {/* Indicateurs de position */}
      <div className="flex justify-center mt-4 space-x-2">
        {Array.from({ length: Math.min(10, maxIndex + 1) }, (_, index) => (
          <button
            key={index}
            onClick={() => {
              setCurrentIndex(index);
              if (carouselRef.current) {
                const cardWidth = carouselRef.current.offsetWidth / itemsPerView;
                setScrollPosition(index * cardWidth);
              }
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
