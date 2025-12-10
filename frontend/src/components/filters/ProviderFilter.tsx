"use client";

import React from "react";
import { getImageUrl } from "@/lib/tmdb";
import { WatchProvider } from "@/types";

interface ProviderFilterProps {
  selectedProviders: number[];
  onToggle: (providerId: number) => void;
  providers: WatchProvider[];
  popularProviders: { id: number; name: string }[];
}

/**
 * Filtre de services de streaming
 */
export default function ProviderFilter({
  selectedProviders,
  onToggle,
  providers,
  popularProviders,
}: ProviderFilterProps) {
  return (
    <div>
      <div className="grid grid-cols-4 gap-2">
        {popularProviders.slice(0, 16).map((provider) => {
          const fullProvider = providers.find(
            (p) => p.provider_id === provider.id
          );
          const isSelected = selectedProviders.includes(provider.id);

          return (
            <button
              key={provider.id}
              onClick={() => onToggle(provider.id)}
              className={`relative p-2 rounded-lg border-2 transition-all ${
                isSelected
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30"
                  : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
              }`}
              title={provider.name}
            >
              {fullProvider?.logo_path ? (
                <img
                  src={getImageUrl(fullProvider.logo_path, "w200")}
                  alt={provider.name}
                  className="w-full h-8 object-contain rounded"
                />
              ) : (
                <div className="w-full h-8 flex items-center justify-center text-xs text-gray-500 dark:text-gray-400 font-medium">
                  {provider.name.slice(0, 3)}
                </div>
              )}
              {isSelected && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg
                    className="w-2.5 h-2.5 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>
      {selectedProviders.length > 0 && (
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          {selectedProviders.length} service(s) sélectionné(s)
        </p>
      )}
    </div>
  );
}
