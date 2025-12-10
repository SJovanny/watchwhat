"use client";

import React from "react";
import { X } from "lucide-react";
import { Keyword } from "@/types";

interface KeywordFilterProps {
  keywords: Keyword[];
  searchValue: string;
  searchResults: Keyword[];
  isSearching: boolean;
  onSearchChange: (query: string) => void;
  onKeywordAdd: (keyword: Keyword) => void;
  onKeywordRemove: (keywordId: number) => void;
}

/**
 * Filtre de mots-clés
 */
export default function KeywordFilter({
  keywords,
  searchValue,
  searchResults,
  isSearching,
  onSearchChange,
  onKeywordAdd,
  onKeywordRemove,
}: KeywordFilterProps) {
  return (
    <div className="space-y-3">
      <div className="relative">
        <input
          type="text"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white pr-8"
          placeholder="Rechercher un mot-clé..."
        />
        {isSearching && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          </div>
        )}
      </div>

      {/* Résultats de recherche */}
      {searchResults.length > 0 && (
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2 max-h-32 overflow-y-auto">
          {searchResults.map((keyword) => (
            <button
              key={keyword.id}
              onClick={() => onKeywordAdd(keyword)}
              className="w-full text-left px-2 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors"
            >
              {keyword.name}
            </button>
          ))}
        </div>
      )}

      {/* Mots-clés sélectionnés */}
      {keywords.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {keywords.map((keyword) => (
            <span
              key={keyword.id}
              className="inline-flex items-center space-x-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs"
            >
              <span>{keyword.name}</span>
              <button
                onClick={() => onKeywordRemove(keyword.id)}
                className="hover:text-blue-900 dark:hover:text-blue-100"
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
