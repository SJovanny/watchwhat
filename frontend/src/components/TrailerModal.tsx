"use client";

import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";

interface TrailerModalProps {
  videoKey: string;
  title: string;
  subtitle?: string;
  onClose: () => void;
}

/**
 * Lecteur de bande-annonce plein écran (YouTube).
 * Échap ou un clic hors de la vidéo ferme ; le scroll de la page est bloqué.
 */
export default function TrailerModal({ videoKey, title, subtitle, onClose }: TrailerModalProps) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Bande-annonce : ${title}`}
      className="animate-fade-in fixed inset-0 z-[70] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm sm:p-8"
      onClick={onClose}
    >
      <div className="w-full max-w-6xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-end justify-between gap-4">
          <div className="min-w-0">
            <h2 className="truncate font-display text-[28px] leading-tight text-white sm:text-[36px]">
              {title}
            </h2>
            {subtitle && <p className="meta mt-1 text-white/60">{subtitle}</p>}
          </div>
          <button
            ref={closeRef}
            onClick={onClose}
            aria-label="Fermer la bande-annonce"
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-white/15 text-white/80 transition-colors duration-150 hover:bg-white/10 hover:text-white active:scale-[0.97]"
          >
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>
        <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black shadow-[0_24px_80px_rgb(0_0_0/0.6)] ring-1 ring-white/10">
          <iframe
            src={`https://www.youtube.com/embed/${videoKey}?autoplay=1&rel=0&modestbranding=1&iv_load_policy=3`}
            title={`Bande-annonce : ${title}`}
            className="absolute inset-0 h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
}
