'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Chrome, Loader2, AlertCircle } from 'lucide-react'

export default function GoogleLoginButton() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })

      if (error) throw error

      // La redirection vers Google se fera automatiquement
    } catch (error: any) {
      console.error('Erreur Google login:', error)
      setError(error.message || 'Erreur lors de la connexion')
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full">
      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 text-red-400" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        </div>
      )}

      <button
        onClick={handleGoogleLogin}
        disabled={isLoading}
        className="w-full flex items-center justify-center space-x-3 p-4 bg-white hover:bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-800 font-semibold text-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            <span>Connexion...</span>
          </>
        ) : (
          <>
            <Chrome className="h-6 w-6 text-blue-600" />
            <span>Continuer avec Google</span>
          </>
        )}
      </button>
    </div>
  )
}
