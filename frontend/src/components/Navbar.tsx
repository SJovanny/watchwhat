"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Search,
  Heart,
  Home,
  User,
  Settings,
  TrendingUp,
  LogIn,
  LogOut,
  Menu,
  X,
  Film,
  Tv,
} from "lucide-react";
import { useAuth } from "./AuthProvider";
import { useNotify } from "./NotificationProvider";
import { useRouter } from "next/navigation";
import ThemeToggle from "./ThemeToggle";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Navbar() {
  const { user, loading, signIn, signOut } = useAuth();
  const { t } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const notify = useNotify();
  const router = useRouter();

  const handleAuthAction = async () => {
    if (user) {
      await signOut();
    } else {
      router.push("/auth");
    }
  };



  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-gray-900 dark:text-white">
              WatchWhat
            </span>
          </Link>

          {/* Navigation Desktop */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="flex items-center space-x-1 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <Home size={20} />
              <span>{t.nav.home}</span>
            </Link>

            <Link
              href="/movies"
              className="flex items-center space-x-1 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <Film size={20} />
              <span>{t.nav.movies}</span>
            </Link>

            <Link
              href="/discover"
              className="flex items-center space-x-1 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <Tv size={20} />
              <span>{t.nav.series}</span>
            </Link>

            <Link
              href="/search"
              className="flex items-center space-x-1 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <Search size={20} />
              <span>{t.nav.search}</span>
            </Link>

            {user && (
              <Link
                href="/favorites"
                className="flex items-center space-x-1 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <Heart size={20} />
                <span>{t.nav.favorites}</span>
              </Link>
            )}

            {user && (
              <Link
                href="/profile"
                className="flex items-center space-x-1 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <User size={20} />
                <span>{t.nav.profile}</span>
              </Link>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {/* Profil utilisateur ou bouton de connexion */}
            {!loading && (
              <div className="flex items-center space-x-2">
                {user ? (
                  <div className="flex items-center space-x-3">
                    {/* Avatar utilisateur */}
                    <div className="flex items-center space-x-2">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={
                            `${user.firstName || ""} ${
                              user.lastName || ""
                            }`.trim() || "Avatar"
                          }
                          className="w-8 h-8 rounded-full border-2 border-blue-500"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-white" />
                        </div>
                      )}
                      <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {`${user.firstName || ""} ${
                          user.lastName || ""
                        }`.trim() || "Utilisateur"}
                      </span>
                    </div>

                    {/* Bouton de déconnexion */}
                    <button
                      onClick={handleAuthAction}
                      className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                      title="Se déconnecter"
                    >
                      <LogOut size={20} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleAuthAction}
                    className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <LogIn size={16} />
                    <span>{t.nav.login}</span>
                  </button>
                )}
              </div>
            )}

            {/* Toggle Dark Mode */}
            <ThemeToggle />

            {/* Bouton des paramètres */}
            <Link
              href="/settings"
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <Settings size={20} />
            </Link>



            {/* Menu mobile */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Menu mobile étendu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-800">
            <div className="flex flex-col space-y-2">
              <Link
                href="/"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <Home size={20} />
                <span>{t.nav.home}</span>
              </Link>

              <Link
                href="/movies"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <Film size={20} />
                <span>{t.nav.movies}</span>
              </Link>

              <Link
                href="/discover"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <Tv size={20} />
                <span>{t.nav.series}</span>
              </Link>

              {user && (
                <>
                  <Link
                    href="/favorites"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center space-x-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <Heart size={20} />
                    <span>{t.nav.favorites}</span>
                  </Link>

                  <Link
                    href="/profile"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center space-x-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <User size={20} />
                    <span>{t.nav.profile}</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Navigation Mobile Bottom (conservée pour la compatibilité) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 px-4 py-2">
        <div className="flex items-center justify-around">
          <Link
            href="/"
            className="flex flex-col items-center space-y-1 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-2"
          >
            <Home size={20} />
            <span className="text-xs">{t.nav.home}</span>
          </Link>

          <Link
            href="/movies"
            className="flex flex-col items-center space-y-1 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-2"
          >
            <Film size={20} />
            <span className="text-xs">{t.nav.movies}</span>
          </Link>

          <Link
            href="/discover"
            className="flex flex-col items-center space-y-1 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-2"
          >
            <Tv size={20} />
            <span className="text-xs">{t.nav.series}</span>
          </Link>

          {user ? (
            <>
              <Link
                href="/favorites"
                className="flex flex-col items-center space-y-1 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-2"
              >
                <Heart size={20} />
                <span className="text-xs">{t.nav.favorites}</span>
              </Link>

              <Link
                href="/profile"
                className="flex flex-col items-center space-y-1 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-2"
              >
                <User size={20} />
                <span className="text-xs">{t.nav.profile}</span>
              </Link>
            </>
          ) : (
            <button
              onClick={handleAuthAction}
              className="flex flex-col items-center space-y-1 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-2"
            >
              <LogIn size={20} />
              <span className="text-xs">{t.nav.login}</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
