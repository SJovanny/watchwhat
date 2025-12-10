"use client";

import React from "react";
import { TMDBGenre } from "@/types";

interface GenreFilterProps {
  genres: TMDBGenre[];
  selectedGenres: number[];
  onToggle: (genreId: number) => void;
}

/**
 * Filtre de genres
 */
export default function GenreFilter({
  genres,
  selectedGenres,
  onToggle,
}: GenreFilterProps) {
  return (
    <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
      {genres.map((genre) => {
        const isSelected = selectedGenres.includes(genre.id);

        return (
          <button
            key={genre.id}
            onClick={() => onToggle(genre.id)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              isSelected
                ? "bg-blue-500 text-white"
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            {genre.name}
          </button>
        );
      })}
    </div>
  );
}
