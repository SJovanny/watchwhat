'use client'

import React, { useState, useRef, useEffect } from 'react';
import { Play, ChevronLeft, ChevronRight } from 'lucide-react';
import { Serie } from '@/types';
import { getBackdropUrl } from '@/lib/tmdb';

interface TrailerItem {
  id: number;
  key: string;
  name: string;
  serie: Serie;
}

interface TrailerSliderProps {
  trailers: TrailerItem[];
  onSerieClick: (serie: Serie) => void;
}

export default function TrailerSlider({ trailers, onSerieClick }: TrailerSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeTrailer, setActiveTrailer] = useState<string | null>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);

  const itemWidth = 320; // Largeur fixe d'un élément de trailer
  
  const handleTrailerClick = (trailer: TrailerItem) => {
    setActiveTrailer(trailer.key);
  };

  const handleCloseTrailer = () => {
    setActiveTrailer(null);
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setScrollPosition((currentIndex - 1) * itemWidth);
    }
  };

  const goToNext = () => {
    if (currentIndex < trailers.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setScrollPosition((currentIndex + 1) * itemWidth);
    }
  };

  // Gestion du défilement horizontal par wheel
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    
    const scrollDelta = e.deltaX !== 0 ? e.deltaX : e.deltaY;
    const maxScroll = (trailers.length - 1) * itemWidth;
    const newPosition = Math.max(0, Math.min(scrollPosition + scrollDelta, maxScroll));
    
    setScrollPosition(newPosition);
    setCurrentIndex(Math.round(newPosition / itemWidth));
  };

  // Gestion du glisser-déposer
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.pageX - (sliderRef.current?.offsetLeft || 0));
    setScrollLeft(scrollPosition);
    document.body.style.userSelect = 'none';
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    
    const x = e.pageX - (sliderRef.current?.offsetLeft || 0);
    const walk = (x - startX);
    const maxScroll = (trailers.length - 1) * itemWidth;
    const newPosition = Math.max(0, Math.min(scrollLeft - walk, maxScroll));
    
    setScrollPosition(newPosition);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    document.body.style.userSelect = '';
    
    // Snapping à l'index le plus proche
    const newIndex = Math.round(scrollPosition / itemWidth);
    setCurrentIndex(newIndex);
    setScrollPosition(newIndex * itemWidth);
  };

  // Touch events pour mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].clientX - (sliderRef.current?.offsetLeft || 0));
    setScrollLeft(scrollPosition);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    const x = e.touches[0].clientX - (sliderRef.current?.offsetLeft || 0);
    const walk = (x - startX);
    const maxScroll = (trailers.length - 1) * itemWidth;
    const newPosition = Math.max(0, Math.min(scrollLeft - walk, maxScroll));
    
    setScrollPosition(newPosition);
  };

  useEffect(() => {
    const preventDefaultScroll = (e: WheelEvent) => {
      if (sliderRef.current?.contains(e.target as Node)) {
        e.preventDefault();
      }
    };

    window.addEventListener('wheel', preventDefaultScroll, { passive: false });
    
    return () => {
      window.removeEventListener('wheel', preventDefaultScroll);
    };
  }, []);

  if (trailers.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      {/* Modal pour lire le trailer */}
      {activeTrailer && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-5xl">
            <button 
              onClick={handleCloseTrailer}
              className="absolute -top-12 right-0 text-white hover:text-gray-300"
            >
              Fermer
            </button>
            <div className="relative pt-[56.25%]">
              <iframe
                className="absolute inset-0 w-full h-full"
                src={`https://www.youtube.com/embed/${activeTrailer}?autoplay=1`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <button
        onClick={goToPrevious}
        className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all opacity-70 hover:opacity-100"
        disabled={currentIndex === 0}
      >
        <ChevronLeft size={20} />
      </button>

      <button
        onClick={goToNext}
        className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all opacity-70 hover:opacity-100"
        disabled={currentIndex === trailers.length - 1}
      >
        <ChevronRight size={20} />
      </button>

      {/* Slider */}
      <div className="overflow-hidden">
        <div
          ref={sliderRef}
          className="flex gap-4 overflow-visible cursor-grab active:cursor-grabbing"
          style={{ transform: `translateX(-${scrollPosition}px)` }}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleMouseUp}
        >
          {trailers.map((trailer) => (
            <div 
              key={`${trailer.id}-${trailer.key}`} 
              className="flex-shrink-0 transition-transform duration-300"
              style={{ width: `${itemWidth}px` }}
            >
              <div className="relative rounded-lg overflow-hidden group h-48">
                <img
                  src={getBackdropUrl(trailer.serie.backdrop_path)}
                  alt={trailer.serie.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex flex-col justify-end p-4">
                  <h3 className="text-white font-bold">{trailer.serie.name}</h3>
                  <p className="text-gray-200 text-sm line-clamp-1">{trailer.name}</p>
                </div>
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <button 
                    onClick={() => handleTrailerClick(trailer)}
                    className="bg-red-600 hover:bg-red-700 text-white rounded-full w-14 h-14 flex items-center justify-center transition-transform transform group-hover:scale-110"
                    aria-label="Lire la bande-annonce"
                  >
                    <Play size={24} fill="currentColor" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Indicateurs */}
      <div className="flex justify-center mt-4 space-x-2">
        {trailers.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setCurrentIndex(index);
              setScrollPosition(index * itemWidth);
            }}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentIndex
                ? 'bg-red-600'
                : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
            }`}
            aria-label={`Aller à la bande-annonce ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
