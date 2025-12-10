"use client";

import React from "react";
import { User, LogOut } from "lucide-react";
import { tmdbV4Service, type TMDBv4Account } from "@/lib/tmdb-v4";

interface AccountTabProps {
  account: TMDBv4Account | null;
  onLogout: () => void;
}

/**
 * Onglet Compte - Informations du compte TMDB
 */
export default function AccountTab({ account, onLogout }: AccountTabProps) {
  const handleLogin = async () => {
    try {
      const tokenData = await tmdbV4Service.createRequestToken();
      if (tokenData.request_token) {
        window.location.href = `https://www.themoviedb.org/auth/access?request_token=${tokenData.request_token}`;
      }
    } catch (error) {
      console.error("Erreur lors de l'initialisation de la connexion:", error);
    }
  };

  if (!account) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <User className="h-10 w-10 text-white" />
        </div>
        <h4 className="text-white text-xl font-bold mb-2">Non connecté</h4>
        <p className="text-white/70 mb-6">
          Connectez-vous avec votre compte TMDB pour synchroniser vos données.
        </p>
        <button
          onClick={handleLogin}
          className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
        >
          Se connecter avec TMDB
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Informations du compte */}
      <div className="p-6 bg-white/5 rounded-xl border border-white/10">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
            <User className="h-8 w-8 text-white" />
          </div>
          <div>
            <h4 className="text-white font-bold text-xl">
              {account.name || account.username}
            </h4>
            <p className="text-white/70">@{account.username}</p>
            <p className="text-white/50 text-sm">ID: {account.id}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-white/70">Langue:</span>
            <span className="text-white ml-2">
              {account.iso_639_1.toUpperCase()}
            </span>
          </div>
          <div>
            <span className="text-white/70">Pays:</span>
            <span className="text-white ml-2">{account.iso_3166_1}</span>
          </div>
          <div>
            <span className="text-white/70">Contenu adulte:</span>
            <span
              className={`ml-2 ${
                account.include_adult ? "text-red-400" : "text-green-400"
              }`}
            >
              {account.include_adult ? "Activé" : "Désactivé"}
            </span>
          </div>
        </div>
      </div>

      {/* Actions du compte */}
      <div className="space-y-4">
        <h4 className="text-white font-medium text-lg">Actions</h4>

        <button
          onClick={onLogout}
          className="flex items-center space-x-3 w-full p-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 transition-all duration-300"
        >
          <LogOut className="h-5 w-5" />
          <span className="font-medium">Se déconnecter</span>
        </button>
      </div>
    </div>
  );
}
