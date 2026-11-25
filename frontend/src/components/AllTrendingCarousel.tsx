'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { SearchResult } from '@/types';
import ContentCard from './ContentCard';

interface AllTrendingCarouselProps {
  content: SearchResult[];
  onContentClick?: (content: SearchResult) => void;
  className?: string;
}

/**
 * Rangée d'affiches défilante : défilement natif (trackpad, tactile, molette),
 * flèches au survol sur desktop, aimantation douce sur chaque affiche.
 */
export default function AllTrendingCarousel({
  content,
  onContentClick,
  className = ''
}: AllTrendingCarouselProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const updateEdges = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    updateEdges();
    const el = scrollerRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateEdges, { passive: true });
    window.addEventListener('resize', updateEdges);
    return () => {
      el.removeEventListener('scroll', updateEdges);
      window.removeEventListener('resize', updateEdges);
    };
  }, [updateEdges, content.length]);

  const page = (dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: 'smooth' });
  };

  if (content.length === 0) {
    return (
      <div className={className}>
        <p className="py-12 text-[14px] text-ink-3">
          Aucun titre en tendance pour le moment
        </p>
      </div>
    );
  }

  const arrow =
    'absolute top-0 z-20 hidden h-[calc(100%-56px)] w-12 items-center justify-center text-white opacity-0 transition-opacity duration-200 group-hover/row:opacity-100 focus-visible:opacity-100 md:flex';

  return (
    <div className={`group/row relative ${className}`}>
      <div
        ref={scrollerRef}
        className="row-scroller scrollbar-hide overflow-x-auto overflow-y-hidden scroll-smooth"
      >
        <ul className="flex gap-3 sm:gap-4" style={{ width: 'max-content' }}>
          {content.map((item) => (
            <li
              key={`${item.media_type}-${item.id}`}
              className="w-[140px] flex-shrink-0 sm:w-[160px] md:w-[176px] lg:w-[192px]"
            >
              <ContentCard content={item} onContentClick={onContentClick} className="h-full" />
            </li>
          ))}
        </ul>
      </div>

      {canPrev && (
        <button
          onClick={() => page(-1)}
          aria-label="Défiler vers la gauche"
          className={`${arrow} left-0 rounded-l-lg bg-gradient-to-r from-black/70 to-transparent`}
        >
          <ChevronLeft size={28} strokeWidth={1.5} />
        </button>
      )}
      {canNext && (
        <button
          onClick={() => page(1)}
          aria-label="Défiler vers la droite"
          className={`${arrow} right-0 rounded-r-lg bg-gradient-to-l from-black/70 to-transparent`}
        >
          <ChevronRight size={28} strokeWidth={1.5} />
        </button>
      )}
    </div>
  );
}
