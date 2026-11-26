"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Lock } from "lucide-react";
import UserPreferences from "@/components/UserPreferences";
import { useAuth } from "@/components/AuthProvider";
import { useNotify } from "@/components/NotificationProvider";

export default function SettingsPage() {
  const router = useRouter();
  const notify = useNotify();
  // Une seule source de vérité pour la session : AuthProvider
  const { user, loading } = useAuth();
  const hasNotifiedRef = useRef(false);

  useEffect(() => {
    if (loading || user) return;

    // Éviter la double notification en Strict Mode
    if (!hasNotifiedRef.current) {
      hasNotifiedRef.current = true;
      notify.warning(
        "Connexion requise",
        "Vous devez être connecté pour accéder aux paramètres",
        {
          label: "Se connecter",
          onClick: () => router.push("/auth"),
        }
      );
    }
    router.push("/");
  }, [loading, user, notify, router]);

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center" aria-busy="true">
        <div className="flex items-center gap-3 text-[15px] text-ink-2">
          <Loader2 size={18} strokeWidth={1.5} className="animate-spin text-ink-3" />
          Chargement des préférences
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-[1600px] flex-col items-start justify-center px-4 sm:px-6 lg:px-12">
        <span className="mb-5 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-line text-ink-2">
          <Lock size={18} strokeWidth={1.5} />
        </span>
        <h1 className="font-display text-[44px] leading-[1.05] text-ink">Accès réservé</h1>
        <p className="mt-3 max-w-[44ch] text-[16px] text-ink-2">
          Connectez-vous pour régler votre langue, votre pays et vos genres.
        </p>
        <button
          onClick={() => router.push("/auth")}
          className="mt-8 inline-flex h-11 items-center rounded-lg bg-accent px-5 text-[15px] font-medium text-on-accent transition-[background-color,transform] duration-150 hover:bg-velvet-700 active:scale-[0.97]"
        >
          Se connecter
        </button>
      </div>
    );
  }

  return <UserPreferences />;
}
