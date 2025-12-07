'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Loader2, AlertCircle, Check } from 'lucide-react'

function CallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState<string>('')

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Vérifier s'il y a une erreur dans l'URL
        const error = searchParams.get('error')
        const errorDescription = searchParams.get('error_description')
        
        if (error) {
          console.error('Erreur OAuth:', error, errorDescription)
          setStatus('error')
          setErrorMessage(errorDescription || 'Erreur lors de l\'authentification')
          setTimeout(() => router.push('/auth/supabase'), 3000)
          return
        }

        // Échanger le code d'autorisation contre une session
        const { data, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error('Erreur session:', sessionError)
          setStatus('error')
          setErrorMessage(sessionError.message)
          setTimeout(() => router.push('/auth/supabase'), 3000)
          return
        }

        if (data.session) {
          console.log('✅ Session créée avec succès:', data.session.user.email)
          setStatus('success')
          setTimeout(() => router.push('/'), 2000)
        } else {
          setStatus('error')
          setErrorMessage('Aucune session trouvée')
          setTimeout(() => router.push('/auth/supabase'), 3000)
        }
      } catch (error: any) {
        console.error('Erreur callback:', error)
        setStatus('error')
        setErrorMessage(error.message || 'Erreur inconnue')
        setTimeout(() => router.push('/auth/supabase'), 3000)
      }
    }

    handleAuthCallback()
  }, [router, searchParams])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8 text-center">
          
          {status === 'loading' && (
            <>
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Loader2 className="h-10 w-10 text-white animate-spin" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">
                Authentification en cours...
              </h2>
              <p className="text-white/70">
                Veuillez patienter pendant que nous vous connectons
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">
                Connexion réussie !
              </h2>
              <p className="text-white/70 mb-6">
                Redirection vers l'accueil...
              </p>
              <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto"></div>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">
                Erreur d'authentification
              </h2>
              <p className="text-white/70 mb-6">
                {errorMessage || 'Une erreur est survenue'}
              </p>
              <p className="text-white/60 text-sm">
                Redirection vers la page de connexion...
              </p>
            </>
          )}

        </div>
      </div>
    </div>
  )
}

export default function AuthCallback() {
  return (
    <Suspense 
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-6">
           <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Loader2 className="h-10 w-10 text-white animate-spin" />
          </div>
        </div>
      }
    >
      <CallbackContent />
    </Suspense>
  )
}
