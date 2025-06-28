'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { UserService, UserData } from '@/lib/user-service'

interface AuthContextType {
  user: UserData | null
  loading: boolean
  signIn: () => Promise<void>
  signInWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: any }>
  signUp: (email: string, password: string, name?: string) => Promise<{ success: boolean; error?: any }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Charger l'utilisateur initial
    const loadUser = async () => {
      try {
        const currentUser = await UserService.getCurrentUser()
        setUser(currentUser)
      } catch (error) {
        console.error('Erreur lors du chargement de l\'utilisateur:', error)
      } finally {
        setLoading(false)
      }
    }

    loadUser()

    // Écouter les changements d'authentification
    const { data: { subscription } } = UserService.onAuthStateChange(async (authUser) => {
      if (authUser) {
        // Créer/mettre à jour le profil utilisateur
        await UserService.upsertUserProfile({
          id: authUser.id,
          email: authUser.email,
          name: authUser.user_metadata?.name || authUser.user_metadata?.full_name,
          avatar: authUser.user_metadata?.avatar_url,
        })
        
        // Charger les données utilisateur complètes
        const userData = await UserService.getCurrentUser()
        setUser(userData)
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async () => {
    const result = await UserService.signInWithGoogle()
    if (!result.success) {
      throw new Error(result.error?.message || 'Erreur de connexion')
    }
  }

  const signInWithEmail = async (email: string, password: string) => {
    return await UserService.signInWithEmail(email, password)
  }

  const signUp = async (email: string, password: string, name?: string) => {
    return await UserService.signUpWithEmail(email, password, name)
  }

  const signOut = async () => {
    const result = await UserService.signOut()
    if (result.success) {
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      signIn,
      signInWithEmail,
      signUp,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
