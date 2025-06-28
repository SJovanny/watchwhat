'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Erreur d\'authentification:', error)
          router.push('/?error=auth_error')
          return
        }

        if (data.session) {
          // Rediriger vers la page d'accueil après connexion réussie
          router.push('/?success=auth_success')
        } else {
          router.push('/')
        }
      } catch (error) {
        console.error('Erreur lors du traitement du callback:', error)
        router.push('/?error=auth_error')
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Connexion en cours...</p>
      </div>
    </div>
  )
}
