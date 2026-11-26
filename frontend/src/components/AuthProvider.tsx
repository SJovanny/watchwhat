"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { UserService, UserData } from "@/lib/user-service";
import { useHydration } from "@/hooks/useHydration";
import { getNameFromMetadata } from "@/lib/utils";

interface AuthContextType {
  user: UserData | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signInWithEmail: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: any }>;
  signUp: (
    email: string,
    password: string,
    firstName?: string,
    lastName?: string
  ) => Promise<{ success: boolean; error?: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const isHydrated = useHydration();

  useEffect(() => {
    // Attendre que l'hydratation soit terminée avant de charger l'utilisateur
    if (!isHydrated) return;

    let cancelled = false;

    // Charger l'utilisateur initial
    const loadUser = async () => {
      try {
        const currentUser = await UserService.getCurrentUser();
        if (!cancelled) setUser(currentUser);
      } catch (error) {
        console.error("Erreur lors du chargement de l'utilisateur:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    // Synchroniser le profil après un changement de session
    const handleAuthUser = async (authUser: User | null) => {
      try {
        if (!authUser) {
          if (!cancelled) setUser(null);
          return;
        }

        // Synchroniser l'utilisateur dans public.users si nécessaire (important pour Google OAuth)
        await UserService.syncUserAfterLogin(authUser.id);

        // Recharger les données utilisateur
        const userData = await UserService.getCurrentUser();

        // Si les données de l'utilisateur ne sont pas à jour, les mettre à jour
        const { firstName, lastName } = getNameFromMetadata(authUser.user_metadata);

        if (
          userData &&
          (userData.firstName !== firstName ||
            userData.lastName !== lastName ||
            userData.avatar !== authUser.user_metadata?.avatar_url)
        ) {
          await UserService.upsertUserProfile({
            id: authUser.id,
            email: authUser.email ?? userData.email,
            firstName,
            lastName,
            avatar: authUser.user_metadata?.avatar_url,
          });

          // Recharger après mise à jour
          const updatedUser = await UserService.getCurrentUser();
          if (!cancelled) setUser(updatedUser);
        } else if (!cancelled) {
          setUser(userData);
        }
      } catch (error) {
        console.error("Erreur lors de la synchronisation de l'utilisateur:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadUser();

    // Écouter les changements d'authentification.
    // Ne jamais attendre (await) un appel Supabase dans ce callback : supabase-js
    // l'exécute en tenant son verrou d'authentification, donc tout getUser(),
    // getSession() ou requête lancé ici attendrait ce verrou indéfiniment
    // (page qui charge sans fin, nom qui disparaît au rechargement).
    // On sort donc le travail du callback avec setTimeout.
    const {
      data: { subscription },
    } = UserService.onAuthStateChange((authUser) => {
      setTimeout(() => {
        void handleAuthUser(authUser);
      }, 0);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [isHydrated]);

  const signIn = async () => {
    const result = await UserService.signInWithGoogle();
    if (!result.success) {
      throw new Error(result.error?.message || "Erreur de connexion");
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    return await UserService.signInWithEmail(email, password);
  };

  const signUp = async (
    email: string,
    password: string,
    firstName?: string,
    lastName?: string
  ) => {
    return await UserService.signUpWithEmail(
      email,
      password,
      firstName,
      lastName
    );
  };

  const signOut = async () => {
    const result = await UserService.signOut();
    if (result.success) {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signInWithEmail,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
