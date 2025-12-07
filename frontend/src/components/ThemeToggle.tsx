"use client";

import React from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export default function ThemeToggle() {
  const { theme, toggleTheme, mounted } = useTheme();

  // Éviter le flash de contenu non stylé
  if (!mounted) {
    return (
      <button
        className="p-2 text-gray-600 dark:text-gray-400 rounded-lg"
        disabled
      >
        <div className="w-5 h-5" />
      </button>
    );
  }

  const getIcon = () => {
    switch (theme) {
      case "light":
        return <Sun size={20} />;
      case "dark":
        return <Moon size={20} />;
      case "system":
        return <Monitor size={20} />;
    }
  };

  const getLabel = () => {
    switch (theme) {
      case "light":
        return "Mode clair";
      case "dark":
        return "Mode sombre";
      case "system":
        return "Thème système";
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
      title={getLabel()}
      aria-label={getLabel()}
    >
      {getIcon()}
    </button>
  );
}
