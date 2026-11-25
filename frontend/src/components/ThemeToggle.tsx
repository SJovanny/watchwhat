"use client";

import React from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export default function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggleTheme, mounted } = useTheme();

  const base =
    "inline-flex h-9 w-9 items-center justify-center rounded-lg text-ink-2 transition-colors duration-150 hover:bg-raised hover:text-ink active:scale-[0.97]";

  // Éviter le flash de contenu non stylé
  if (!mounted) {
    return (
      <button className={`${base} ${className}`} disabled aria-label="Thème">
        <span className="h-[18px] w-[18px]" />
      </button>
    );
  }

  const label =
    theme === "light" ? "Mode clair" : theme === "dark" ? "Mode sombre" : "Thème système";

  const Icon = theme === "light" ? Sun : theme === "dark" ? Moon : Monitor;

  return (
    <button
      onClick={toggleTheme}
      className={`${base} ${className}`}
      title={label}
      aria-label={label}
    >
      <Icon size={18} strokeWidth={1.5} />
    </button>
  );
}
