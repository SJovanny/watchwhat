"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import UserPreferences from "@/components/UserPreferences";
import { supabase } from "@/lib/supabase";
import { useNotify } from "@/components/NotificationProvider";
import { Settings, Lock } from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const notify = useNotify();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const hasNotifiedRef = useRef(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setIsAuthenticated(true);
      } else {
        // Éviter la double notification en Strict Mode
        if (!hasNotifiedRef.current) {
          hasNotifiedRef.current = true;
          notify.warning(
            "Connexion requise",
            "Vous devez être connecté pour accéder aux paramètres",
            {
              label: "Se connecter",
              onClick: () => router.push('/auth'),
            }
          );
        }
        router.push('/');
      }
    } catch (error) {
      console.error('Erreur de vérification auth:', error);
      router.push('/');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-6">
            <div className="p-4 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-2xl">
              <Settings className="h-10 w-10 text-white animate-spin" />
            </div>
          </div>
          <p className="text-white/70 text-lg">Chargement des préférences...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center p-8 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 max-w-md">
          <div className="relative mb-6 mx-auto w-fit">
            <div className="p-4 bg-gradient-to-br from-red-500 to-orange-600 rounded-2xl">
              <Lock className="h-10 w-10 text-white" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Accès restreint</h2>
          <p className="text-white/70 mb-6">
            Vous devez être connecté pour accéder aux paramètres.
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-medium rounded-xl hover:opacity-90 transition-opacity"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  return <UserPreferences />;
}
