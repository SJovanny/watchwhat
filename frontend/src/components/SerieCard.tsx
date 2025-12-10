"use client";

import React from "react";
import { Serie } from "@/types";
import BaseContentCard from "./BaseContentCard";

interface SerieCardProps {
  serie: Serie;
  onSerieClick?: (serie: Serie) => void;
  showActions?: boolean;
  className?: string;
}

/**
 * Composant pour afficher une carte de série.
 * Délègue le rendu à BaseContentCard pour éviter la duplication de code.
 */
export default function SerieCard({
  serie,
  onSerieClick,
  showActions = true,
  className = "",
}: SerieCardProps) {
  return (
    <BaseContentCard
      content={serie}
      contentType="serie"
      onContentClick={(content) => onSerieClick?.(content as Serie)}
      showActions={showActions}
      className={className}
    />
  );
}
