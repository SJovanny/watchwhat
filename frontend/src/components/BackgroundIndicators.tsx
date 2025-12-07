'use client'

import React from 'react';

interface BackgroundIndicatorsProps {
  total: number;
  currentIndex: number;
  onIndexChange: (index: number) => void;
  className?: string;
}

export default function BackgroundIndicators({ 
  total, 
  currentIndex, 
  onIndexChange, 
  className = '' 
}: BackgroundIndicatorsProps) {
  if (total <= 1) return null;

  return (
    <div className={`flex justify-center space-x-2 ${className}`}>
      {Array.from({ length: total }, (_, index) => (
        <button
          key={index}
          onClick={() => onIndexChange(index)}
          className={`w-2 h-2 rounded-full transition-colors duration-200 ${
            index === currentIndex
              ? 'bg-blue-600'
              : 'bg-gray-300/60 dark:bg-gray-600/60 hover:bg-gray-400/60 dark:hover:bg-gray-500/60'
          }`}
          aria-label={`Background ${index + 1}`}
        />
      ))}
    </div>
  );
}
