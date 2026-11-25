"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface SectionHeaderProps {
  title: React.ReactNode;
  /** Petite ligne mono à côté du titre, ex. « 20 titres » */
  meta?: React.ReactNode;
  action?: { label: string; href?: string; onClick?: () => void };
  /** Contrôles à droite (segmented control, etc.) */
  children?: React.ReactNode;
  as?: "h2" | "h3";
  className?: string;
}

/** En-tête de rangée unique pour toute l'application */
export default function SectionHeader({
  title,
  meta,
  action,
  children,
  as: Tag = "h2",
  className = "",
}: SectionHeaderProps) {
  const actionClass =
    "group inline-flex h-9 items-center gap-1.5 rounded-lg px-2 -mr-2 text-[14px] text-ink-2 transition-colors duration-150 hover:text-ink";
  const actionContent = action && (
    <>
      {action.label}
      <ArrowRight
        size={16}
        strokeWidth={1.5}
        className="transition-transform duration-150 ease-[var(--ease-cinema)] group-hover:translate-x-0.5"
      />
    </>
  );

  return (
    <div className={`mb-5 flex flex-wrap items-end justify-between gap-x-6 gap-y-3 ${className}`}>
      <div className="flex min-w-0 items-baseline gap-3">
        <Tag className="font-display text-[28px] leading-[1.1] text-ink sm:text-[32px]">{title}</Tag>
        {meta && <span className="meta hidden text-ink-3 sm:inline">{meta}</span>}
      </div>
      <div className="flex items-center gap-3">
        {children}
        {action &&
          (action.href ? (
            <Link href={action.href} className={actionClass}>
              {actionContent}
            </Link>
          ) : (
            <button onClick={action.onClick} className={actionClass}>
              {actionContent}
            </button>
          ))}
      </div>
    </div>
  );
}

/** Segmented control discret (Aujourd'hui / Cette semaine) */
export function Segmented<T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex rounded-lg bg-raised p-1">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={`h-8 rounded-md px-3 text-[13px] transition-[background-color,color] duration-150 ${
              active
                ? "bg-surface text-ink shadow-[0_1px_2px_rgb(0_0_0/0.12)] dark:bg-gray-700 dark:shadow-[inset_0_1px_0_rgb(255_255_255/0.06)]"
                : "text-ink-2 hover:text-ink"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
