"use client";

import React from "react";
import Image from "next/image";
import { ArrowLeft, User } from "lucide-react";
import { getBackdropUrl, getImageUrl } from "@/lib/tmdb";

export const detailContainer = "mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-12";

/* ---------- Hero ---------- */

interface DetailHeroProps {
  title: string;
  backdropPath: string | null;
  posterPath: string | null;
  tagline?: string | null;
  /** Ligne mono : année, durée, langue… */
  meta: (string | null | undefined | false)[];
  rating: number;
  voteCount: number;
  genres?: { id: number; name: string }[];
  onBack: () => void;
  actions: React.ReactNode;
}

export function DetailHero({
  title,
  backdropPath,
  posterPath,
  tagline,
  meta,
  rating,
  voteCount,
  genres,
  onBack,
  actions,
}: DetailHeroProps) {
  const metaItems = meta.filter(Boolean) as string[];

  return (
    <header className="relative -mt-16 min-h-[640px] overflow-hidden bg-gray-950 text-white lg:min-h-[min(88svh,860px)]">
      {backdropPath && (
        <Image
          src={getBackdropUrl(backdropPath, "original")}
          alt=""
          fill
          priority
          sizes="100vw"
          className="animate-fade object-cover object-[center_25%]"
        />
      )}
      <div aria-hidden className="scrim-left absolute inset-0" />
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-canvas via-canvas/70 to-transparent" />
      <div aria-hidden className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/60 to-transparent" />

      <div
        className={`${detailContainer} relative flex min-h-[640px] flex-col justify-end pb-12 pt-28 lg:min-h-[min(88svh,860px)] lg:pb-16`}
      >
        <button
          onClick={onBack}
          className="absolute left-4 top-20 inline-flex h-10 items-center gap-2 rounded-lg pl-2 pr-3 text-[14px] text-white/75 transition-colors duration-150 hover:bg-white/10 hover:text-white sm:left-6 lg:left-12"
        >
          <ArrowLeft size={18} strokeWidth={1.5} />
          Retour
        </button>

        <div className="animate-rise flex flex-col gap-8 md:flex-row md:items-end">
          {posterPath && (
            <div className="relative hidden aspect-[2/3] w-[220px] flex-shrink-0 overflow-hidden rounded-xl shadow-[0_24px_64px_rgb(0_0_0/0.55)] ring-1 ring-white/10 md:block lg:w-[260px]">
              <Image
                src={getImageUrl(posterPath, "w500")}
                alt={`Affiche de ${title}`}
                fill
                sizes="260px"
                className="object-cover"
              />
            </div>
          )}

          <div className="min-w-0 max-w-[760px]">
            <p className="meta mb-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-white/70">
              <span className="text-yellow-400">★ {rating.toFixed(1)}</span>
              <span className="text-white/50">{voteCount.toLocaleString("fr-FR")} votes</span>
              {metaItems.map((item) => (
                <React.Fragment key={item}>
                  <span aria-hidden className="text-white/35">·</span>
                  <span>{item}</span>
                </React.Fragment>
              ))}
            </p>

            <h1 className="font-display text-[44px] leading-[1.02] tracking-[-0.02em] text-balance sm:text-[60px] lg:text-[80px]">
              {title}
            </h1>

            {tagline && (
              <p className="mt-4 max-w-[48ch] text-[18px] leading-[1.5] text-white/75">{tagline}</p>
            )}

            {genres && genres.length > 0 && (
              <ul className="mt-5 flex flex-wrap gap-2">
                {genres.map((g) => (
                  <li
                    key={g.id}
                    className="rounded-md border border-white/15 px-2.5 py-1 text-[13px] text-white/80"
                  >
                    {g.name}
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-8 flex flex-wrap items-center gap-3">{actions}</div>
          </div>
        </div>
      </div>
    </header>
  );
}

/* ---------- Boutons du hero ---------- */

export const heroPrimary =
  "inline-flex h-12 items-center gap-2 rounded-lg bg-white px-6 text-[15px] font-medium text-gray-950 transition-[background-color,transform] duration-150 hover:bg-white/85 active:scale-[0.97] disabled:opacity-60";

export const heroSecondary =
  "inline-flex h-12 items-center gap-2 rounded-lg bg-white/15 px-5 text-[15px] font-medium text-white backdrop-blur-sm transition-[background-color,transform] duration-150 hover:bg-white/25 active:scale-[0.97] disabled:opacity-60";

export const heroSecondaryOn =
  "inline-flex h-12 items-center gap-2 rounded-lg bg-accent px-5 text-[15px] font-medium text-white transition-[background-color,transform] duration-150 hover:bg-velvet-700 active:scale-[0.97] disabled:opacity-60";

/* ---------- Sections ---------- */

export function DetailSection({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={className}>
      <h2 className="mb-5 font-display text-[28px] leading-[1.1] text-ink sm:text-[32px]">{title}</h2>
      {children}
    </section>
  );
}

export function InfoPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-line bg-surface p-6">
      <h3 className="mb-4 text-[14px] font-medium text-ink">{title}</h3>
      <dl className="divide-y divide-line">{children}</dl>
    </div>
  );
}

export function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[112px_1fr] gap-4 py-3 text-[14px] first:pt-0 last:pb-0">
      <dt className="text-ink-3">{label}</dt>
      <dd className="text-ink">{children}</dd>
    </div>
  );
}

export function PersonTile({
  name,
  role,
  profilePath,
}: {
  name: string;
  role?: string;
  profilePath: string | null;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-full bg-raised ring-1 ring-line">
        {profilePath ? (
          <Image src={getImageUrl(profilePath, "w200")} alt="" fill sizes="56px" className="object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <User size={20} strokeWidth={1.5} className="text-ink-3" />
          </div>
        )}
      </div>
      <div className="min-w-0">
        <p className="truncate text-[14px] font-medium text-ink">{name}</p>
        {role && <p className="truncate text-[13px] text-ink-3">{role}</p>}
      </div>
    </div>
  );
}

/* ---------- États ---------- */

export function DetailSkeleton() {
  return (
    <div aria-busy="true">
      <div className="relative -mt-16 h-[640px] bg-gray-950 lg:h-[min(88svh,860px)]">
        <div className={`${detailContainer} flex h-full items-end pb-16`}>
          <div className="flex items-end gap-8">
            <div className="skeleton hidden aspect-[2/3] w-[260px] bg-white/10! md:block" />
            <div>
              <div className="skeleton mb-5 h-3 w-48 bg-white/10!" />
              <div className="skeleton mb-4 h-14 w-[min(520px,70vw)] bg-white/10!" />
              <div className="skeleton h-4 w-[min(360px,60vw)] bg-white/10!" />
            </div>
          </div>
        </div>
      </div>
      <div className={`${detailContainer} grid gap-12 py-12 lg:grid-cols-[1fr_360px]`}>
        <div className="space-y-4">
          <div className="skeleton h-8 w-40" />
          <div className="skeleton h-4 w-full" />
          <div className="skeleton h-4 w-5/6" />
          <div className="skeleton h-4 w-2/3" />
        </div>
        <div className="skeleton h-72 rounded-xl" />
      </div>
      <span className="sr-only">Chargement</span>
    </div>
  );
}

export function DetailNotFound({
  title,
  message,
  onBack,
}: {
  title: string;
  message: string;
  onBack: () => void;
}) {
  return (
    <div className={`${detailContainer} flex min-h-[70vh] flex-col items-start justify-center`}>
      <p className="meta mb-3 text-ink-3">Erreur 404</p>
      <h1 className="font-display text-[48px] leading-[1.05] text-ink">{title}</h1>
      <p className="mt-3 max-w-[48ch] text-[16px] text-ink-2">{message}</p>
      <button
        onClick={onBack}
        className="mt-8 inline-flex h-11 items-center gap-2 rounded-lg border border-line-strong px-5 text-[15px] text-ink transition-colors duration-150 hover:bg-raised active:scale-[0.97]"
      >
        <ArrowLeft size={18} strokeWidth={1.5} />
        Retour
      </button>
    </div>
  );
}
