'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Film, Heart, Shield, Star, Users, Check } from 'lucide-react'
import GoogleLoginButton from '@/components/GoogleLoginButton'

export default function SupabaseAuthPage() {
  const router = useRouter()
  const [showSuccess, setShowSuccess] = useState(false)

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
                Bienvenue sur WatchWhat
              </h2>
              <p className="text-xl text-white/80 leading-relaxed">
                Découvrez, suivez et organisez vos séries préférées avec une expérience personnalisée.
              </p>
            </div>

            {/* Avantages */}
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-white">Pourquoi créer un compte ?</h3>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-4 p-4 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20">
                  <div className="p-2 bg-pink-500/20 rounded-lg">
                    <Heart className="h-6 w-6 text-pink-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold text-lg">Watchlist & Favoris</h4>
                    <p className="text-white/70">Sauvegardez vos séries favorites et créez votre liste de visionnage</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-4 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <Star className="h-6 w-6 text-purple-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold text-lg">Recommandations IA</h4>
                    <p className="text-white/70">Recevez des suggestions personnalisées basées sur vos goûts</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-4 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Users className="h-6 w-6 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold text-lg">Synchronisation multi-appareils</h4>
                    <p className="text-white/70">Accédez à vos données depuis n'importe quel appareil</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-4 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <Shield className="h-6 w-6 text-green-400" />
                  </div>
                 
                </div>
              </div>
            </div>
          </div>

          {/* Section connexion */}
          <div className="flex items-center justify-center">
            <div className="w-full max-w-md">
              <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8">
                
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    Connexion
                  </h3>
                  <p className="text-white/70">
                    Utilisez votre compte Google pour vous connecter en un clic
                  </p>
                </div>

                <GoogleLoginButton />

                <div className="mt-6 text-center">
                  <p className="text-white/60 text-sm">
                    En vous connectant, vous acceptez nos{' '}
                    <a href="#" className="text-blue-400 hover:text-blue-300 underline">
                      conditions d'utilisation
                    </a>
                  </p>
                </div>

               
                  </div>
                </div>
              </div>

              {/* Continuer sans compte */}
              <div className="mt-6 text-center">
                <button
                  onClick={() => router.push('/')}
                  className="text-white/80 hover:text-white text-sm font-medium underline"
                >
                  Continuer sans compte
                </button>
              </div>
            </div>
          </div>
        </div>
      
  )
}
