'use client'

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Film, LogIn, Loader2, Check, AlertCircle, ExternalLink, Shield, Star, Heart } from 'lucide-react';
import { tmdbV4Service } from '@/lib/tmdb-v4';

export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const requestToken = searchParams.get('request_token');
    const approved = searchParams.get('approved');

    if (requestToken && approved === 'true') {
      handleAuthCallback(requestToken);
    }
  }, [searchParams]);

  const handleAuthCallback = async (requestToken: string) => {
    try {
      setIsLoading(true);
      setError(null);

      await tmdbV4Service.createAccessToken(requestToken);
      setSuccess(true);

      // Rediriger vers les paramètres après un court délai
      setTimeout(() => {
        router.push('/settings');
      }, 2000);
    } catch (error) {
      console.error('Erreur lors de l\'authentification:', error);
      setError('Erreur lors de l\'authentification. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { request_token } = await tmdbV4Service.createRequestToken();
      
      // Rediriger vers TMDB pour l'authentification
      const authUrl = `https://www.themoviedb.org/auth/access?request_token=${request_token}`;
      window.location.href = authUrl;
    } catch (error) {
      console.error('Erreur lors de la création du token:', error);
      setError('Erreur lors de la connexion. Veuillez réessayer.');
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-emerald-900 to-teal-900 flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="h-10 w-10 text-white" />
            </div>
            
            <h2 className="text-3xl font-bold text-white mb-4">
              Connexion réussie !
            </h2>
            <p className="text-white/80 text-lg mb-6">
              Votre compte TMDB a été connecté avec succès. Redirection en cours...
            </p>
            
            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          
          {/* Section informative */}
          <div className="space-y-8">
            <div className="text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start space-x-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl">
                  <Film className="h-8 w-8 text-white" />
                </div>
                <h1 className="text-4xl font-black text-white">
                  WatchWhat
                </h1>
              </div>
              
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                Connectez-vous à TMDB
              </h2>
              <p className="text-xl text-white/80 leading-relaxed">
                Synchronisez vos préférences et accédez à vos listes personnalisées pour une expérience optimale.
              </p>
            </div>

            {/* Avantages */}
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-white">Pourquoi se connecter ?</h3>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-4 p-4 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Heart className="h-6 w-6 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold text-lg">Listes personnalisées</h4>
                    <p className="text-white/70">Synchronisez vos favoris, watchlist et listes personnalisées</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-4 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <Star className="h-6 w-6 text-purple-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold text-lg">Recommandations personnalisées</h4>
                    <p className="text-white/70">Recevez des suggestions basées sur vos goûts</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-4 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <Shield className="h-6 w-6 text-green-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold text-lg">Sécurisé & Privé</h4>
                    <p className="text-white/70">Vos données sont protégées par l'authentification TMDB</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section connexion */}
          <div className="flex items-center justify-center">
            <div className="w-full max-w-md">
              <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8">
                
                {error && (
                  <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <AlertCircle className="h-5 w-5 text-red-400" />
                      <p className="text-red-400 font-medium">{error}</p>
                    </div>
                  </div>
                )}

                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <LogIn className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    Authentification TMDB
                  </h3>
                  <p className="text-white/70">
                    Utilisez votre compte The Movie Database pour vous connecter
                  </p>
                </div>

                <button
                  onClick={handleLogin}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center space-x-3 p-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl text-white font-semibold text-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-6 w-6 animate-spin" />
                      <span>Connexion...</span>
                    </>
                  ) : (
                    <>
                      <ExternalLink className="h-6 w-6" />
                      <span>Se connecter avec TMDB</span>
                    </>
                  )}
                </button>

                <div className="mt-6 text-center">
                  <p className="text-white/60 text-sm">
                    Vous n'avez pas de compte TMDB ?{' '}
                    <a
                      href="https://www.themoviedb.org/signup"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 font-medium underline"
                    >
                      Créer un compte
                    </a>
                  </p>
                </div>

                {/* Info sécurité */}
                <div className="mt-8 p-4 bg-white/5 rounded-xl border border-white/10">
                  <div className="flex items-start space-x-3">
                    <Shield className="h-5 w-5 text-yellow-400 mt-0.5" />
                    <div>
                      <p className="text-white/80 text-sm">
                        <strong>Sécurisé :</strong> Nous utilisons l'authentification officielle TMDB. 
                        Vos identifiants ne sont jamais stockés sur nos serveurs.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
