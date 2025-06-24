import React from 'react';
import Link from 'next/link';
import { Search, Heart, Home, User, Settings, TrendingUp } from 'lucide-react';

export default function Navbar() {
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
              <span>Accueil</span>
            </Link>
            
            <Link 
              href="/discover" 
              className="flex items-center space-x-1 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <Search size={20} />
              <span>Découvrir</span>
            </Link>
            
            <Link 
              href="/favorites" 
              className="flex items-center space-x-1 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <Heart size={20} />
              <span>Favoris</span>
            </Link>
            
            <Link 
              href="/profile" 
              className="flex items-center space-x-1 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <User size={20} />
              <span>Profil</span>
            </Link>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {/* Bouton des paramètres */}
            <Link
              href="/settings"
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <Settings size={20} />
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation Mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 px-4 py-2">
        <div className="flex items-center justify-around">
          <Link 
            href="/" 
            className="flex flex-col items-center space-y-1 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-2"
          >
            <Home size={20} />
            <span className="text-xs">Accueil</span>
          </Link>
          
          <Link 
            href="/discover" 
            className="flex flex-col items-center space-y-1 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-2"
          >
            <Search size={20} />
            <span className="text-xs">Découvrir</span>
          </Link>
          
          <Link 
            href="/favorites" 
            className="flex flex-col items-center space-y-1 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-2"
          >
            <Heart size={20} />
            <span className="text-xs">Favoris</span>
          </Link>
          
          <Link 
            href="/profile" 
            className="flex flex-col items-center space-y-1 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-2"
          >
            <User size={20} />
            <span className="text-xs">Profil</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
