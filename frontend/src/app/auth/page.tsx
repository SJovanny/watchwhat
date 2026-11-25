"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Loader2,
  Check,
  AlertCircle,
  Mail,
  Lock,
  User as UserIcon,
  Star,
  Heart,
} from "lucide-react";
import { tmdbService, getImageUrl } from "@/lib/tmdb";
import { useAuth } from "@/components/AuthProvider";
import { useNotify } from "@/components/NotificationProvider";

type AuthMode = "login" | "signup";

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, signInWithEmail, signUp, signIn } = useAuth();
  const notify = useNotify();

  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [posters, setPosters] = useState<string[]>([]);

  // Mur d'affiches en fond : les tendances de la semaine
  useEffect(() => {
    tmdbService
      .getTrendingAll("week", 1)
      .then((res) => {
        const paths = (res.results || [])
          .map((item) => ("poster_path" in item ? item.poster_path : null))
          .filter((p): p is string => !!p);
        setPosters([...paths, ...paths].slice(0, 40));
      })
      .catch(() => setPosters([]));
  }, []);

  // Rediriger si déjà connecté
  useEffect(() => {
    if (user) {
      const redirect = searchParams.get("redirect") || "/";
      router.push(redirect);
    }
  }, [user, router, searchParams]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (mode === "login") {
        const result = await signInWithEmail(email, password);
        if (result.success) {
          notify.success("Connexion réussie", "Votre liste est à jour");
          const redirect = searchParams.get("redirect") || "/";
          router.push(redirect);
        } else {
          setError(result.error?.message || "Erreur de connexion");
        }
      } else {
        const result = await signUp(email, password, firstName, lastName);

        // Log pour débogage
        console.log("Résultat de l'inscription:", result);

        if (result.success) {
          notify.success(
            "Compte créé",
            "Vérifiez votre email pour confirmer votre compte"
          );
          setMode("login");
          // Réinitialiser les champs
          setEmail("");
          setPassword("");
          setFirstName("");
          setLastName("");
        } else {
          // Log de l'erreur pour débogage
          console.error("Erreur d'inscription:", result.error);

          // Gérer spécifiquement le cas où le compte existe déjà
          if (result.error?.code === "email_exists") {
            notify.error("Compte existant", result.error.message, {
              label: "Se connecter",
              onClick: () => setMode("login"),
            });
            setMode("login");
          } else {
            setError(
              result.error?.message || "Erreur lors de la création du compte"
            );
            // Afficher aussi une notification pour plus de visibilité
            notify.error(
              "Erreur d'inscription",
              result.error?.message || "Erreur lors de la création du compte"
            );
          }
        }
      }
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await signIn();
    } catch (err: any) {
      setError(err.message || "Erreur lors de la connexion avec Google");
      setIsLoading(false);
    }
  };

  const field = (
    id: string,
    label: string,
    Icon: typeof Mail,
    props: React.InputHTMLAttributes<HTMLInputElement>
  ) => (
    <div>
      <label htmlFor={id} className="mb-2 block text-[14px] text-ink-2">
        {label}
      </label>
      <div className="relative">
        <Icon size={18} strokeWidth={1.5} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" />
        <input id={id} className="h-12 w-full rounded-lg border border-line-strong bg-canvas pl-10 pr-4 text-[15px] text-ink placeholder:text-ink-3 transition-[border-color,box-shadow] duration-150 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25" {...props} />
      </div>
    </div>
  );

  return (
    <div className="relative -mt-16 min-h-screen overflow-hidden bg-gray-950 pt-16">
      {/* Mur d'affiches */}
      <div aria-hidden className="absolute inset-0 grid grid-cols-4 gap-2 p-2 opacity-60 sm:grid-cols-6 lg:grid-cols-8">
        {posters.map((path, i) => (
          <div key={`${path}-${i}`} className="relative aspect-[2/3] overflow-hidden rounded-md">
            <img src={getImageUrl(path, "w300")} alt="" className="h-full w-full object-cover" loading="lazy" />
          </div>
        ))}
      </div>
      <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-gray-950 via-gray-950/85 to-gray-950/40" />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-gray-950/60" />

      <div className="relative mx-auto grid min-h-[calc(100vh-4rem)] max-w-[1600px] items-center gap-12 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_440px] lg:gap-20 lg:px-12">
        <div className="animate-rise max-w-[560px] text-white">
          <h1 className="font-display text-[48px] leading-[1.02] tracking-[-0.02em] sm:text-[64px]">
            {mode === "login" ? "Reprenez votre liste là où vous l’avez laissée" : "Une liste pour toutes vos soirées"}
          </h1>
          <p className="mt-5 max-w-[46ch] text-[17px] leading-[1.6] text-white/75">
            Votre compte garde vos favoris, votre watchlist et ce que vous avez déjà vu,
            et trie les tendances selon vos genres et votre pays.
          </p>
          <ul className="mt-10 space-y-4 text-[15px] text-white/85">
            {[
              { icon: Heart, text: "Favoris et watchlist synchronisés sur tous vos appareils" },
              { icon: Check, text: "Un historique de ce que vous avez vu, film par film" },
              { icon: Star, text: "Des tendances filtrées par genres, note minimale et pays" },
            ].map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3">
                <span className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md border border-white/15 text-white/80">
                  <Icon size={16} strokeWidth={1.5} />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>

        <div className="w-full rounded-2xl border border-line bg-surface p-6 shadow-[0_24px_80px_rgb(0_0_0/0.45)] sm:p-8">
          <h2 className="font-display text-[32px] leading-[1.1] text-ink">
            {mode === "login" ? "Connexion" : "Créer un compte"}
          </h2>
          <p className="mt-1 text-[14px] text-ink-2">
            {mode === "login" ? "Avec votre email ou votre compte Google" : "Gratuit, en moins d’une minute"}
          </p>

          {error && (
            <div role="alert" className="mt-6 flex items-start gap-3 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-[14px] text-red-600 dark:text-red-400">
              <AlertCircle size={18} strokeWidth={1.5} className="mt-px flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <button
            onClick={handleGoogleAuth}
            disabled={isLoading}
            className="mt-6 inline-flex h-12 w-full items-center justify-center gap-3 rounded-lg border border-line-strong bg-canvas text-[15px] font-medium text-ink transition-[background-color,transform] duration-150 hover:bg-raised active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden>
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continuer avec Google
          </button>

          <div className="my-6 flex items-center gap-3 text-[13px] text-ink-3">
            <span className="h-px flex-1 bg-line" />
            ou par email
            <span className="h-px flex-1 bg-line" />
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-4">
            {mode === "signup" && (
              <div className="grid gap-4 sm:grid-cols-2">
                {field("firstName", "Prénom", UserIcon, {
                  type: "text",
                  value: firstName,
                  onChange: (e) => setFirstName(e.target.value),
                  autoComplete: "given-name",
                })}
                {field("lastName", "Nom", UserIcon, {
                  type: "text",
                  value: lastName,
                  onChange: (e) => setLastName(e.target.value),
                  autoComplete: "family-name",
                })}
              </div>
            )}
            {field("email", "Email", Mail, {
              type: "email",
              value: email,
              onChange: (e) => setEmail(e.target.value),
              required: true,
              autoComplete: "email",
              placeholder: "vous@exemple.fr",
            })}
            {field("password", "Mot de passe", Lock, {
              type: "password",
              value: password,
              onChange: (e) => setPassword(e.target.value),
              required: true,
              minLength: 6,
              autoComplete: mode === "login" ? "current-password" : "new-password",
              placeholder: "6 caractères minimum",
            })}

            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-accent text-[15px] font-medium text-on-accent shadow-[inset_0_1px_0_rgb(255_255_255/0.14)] transition-[background-color,transform] duration-150 hover:bg-velvet-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading && <Loader2 size={18} className="animate-spin" />}
              {isLoading
                ? mode === "login"
                  ? "Connexion"
                  : "Création du compte"
                : mode === "login"
                  ? "Se connecter"
                  : "Créer mon compte"}
            </button>
          </form>

          <p className="mt-6 text-center text-[14px] text-ink-2">
            {mode === "login" ? "Pas encore de compte ?" : "Déjà un compte ?"}{" "}
            <button
              onClick={() => {
                setMode(mode === "login" ? "signup" : "login");
                setError(null);
              }}
              className="font-medium text-ink underline decoration-line-strong underline-offset-4 transition-colors hover:decoration-ink"
            >
              {mode === "login" ? "Créer un compte" : "Se connecter"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense 
      fallback={
        <div className="flex min-h-[80vh] items-center justify-center">
          <Loader2 size={24} strokeWidth={1.5} className="animate-spin text-ink-3" />
        </div>
      }
    >
      <AuthContent />
    </Suspense>
  );
}
