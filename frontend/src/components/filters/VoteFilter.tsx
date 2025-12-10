"use client";

import React from "react";

interface VoteFilterProps {
  voteAverageMin: number;
  voteAverageMax: number;
  voteCountMin: number;
  onVoteMinChange: (value: number) => void;
  onVoteMaxChange: (value: number) => void;
  onVoteCountChange: (value: number) => void;
}

/**
 * Filtre de notes/votes
 */
export default function VoteFilter({
  voteAverageMin,
  voteAverageMax,
  voteCountMin,
  onVoteMinChange,
  onVoteMaxChange,
  onVoteCountChange,
}: VoteFilterProps) {
  return (
    <div className="space-y-4">
      <div>
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
          <span>Note minimale: {voteAverageMin}</span>
          <span>Note maximale: {voteAverageMax}</span>
        </div>
        <div className="flex items-center space-x-3">
          <input
            type="range"
            min="0"
            max="10"
            step="0.5"
            value={voteAverageMin}
            onChange={(e) =>
              onVoteMinChange(
                Math.min(parseFloat(e.target.value), voteAverageMax - 0.5)
              )
            }
            className="flex-1"
          />
          <input
            type="range"
            min="0"
            max="10"
            step="0.5"
            value={voteAverageMax}
            onChange={(e) =>
              onVoteMaxChange(
                Math.max(parseFloat(e.target.value), voteAverageMin + 0.5)
              )
            }
            className="flex-1"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
          Nombre minimum de votes
        </label>
        <input
          type="number"
          min="0"
          step="100"
          value={voteCountMin}
          onChange={(e) => onVoteCountChange(parseInt(e.target.value) || 0)}
          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          placeholder="0"
        />
      </div>
    </div>
  );
}
