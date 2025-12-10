"use client";

import React from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface FilterSectionProps {
  id: string;
  title: string;
  icon: React.ElementType;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

/**
 * Composant de section de filtre repliable
 * Utilisé par UnifiedFilterBar pour afficher les différentes catégories de filtres
 */
export default function FilterSection({
  id,
  title,
  icon: Icon,
  isExpanded,
  onToggle,
  children,
}: FilterSectionProps) {
  return (
    <div className="border-b border-gray-200 dark:border-gray-700 last:border-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-3 px-1 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
      >
        <div className="flex items-center space-x-2">
          <Icon size={16} className="text-gray-500 dark:text-gray-400" />
          <span className="font-medium text-gray-900 dark:text-white text-sm">
            {title}
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp size={16} className="text-gray-400" />
        ) : (
          <ChevronDown size={16} className="text-gray-400" />
        )}
      </button>
      {isExpanded && <div className="pb-4 px-1">{children}</div>}
    </div>
  );
}
