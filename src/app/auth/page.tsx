"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Film,
  LogIn,
  Loader2,
  Check,
  AlertCircle,
  Mail,
  Lock,
  User as UserIcon,
  Shield,
  Star,
  Heart,
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useNotify } from "@/components/NotificationProvider";

type AuthMode = "login" | "signup";

export default function AuthPage() {
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
          notify.success("Connexion réussie", "Bienvenue !");
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-6">
      <div className="max-w-5xl w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Section informative */}
          <div className="space-y-8">
            <div className="text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start space-x-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl">
                  <Film className="h-8 w-8 text-white" />
                </div>
                <h1 className="text-4xl font-black text-white">WatchWhat</h1>
              </div>

              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                {mode === "login" ? "Connectez-vous" : "Créez votre compte"}
              </h2>
              <p className="text-xl text-white/80 leading-relaxed">
                Synchronisez vos préférences et accédez à vos listes
                personnalisées pour une expérience optimale.
              </p>
            </div>

            {/* Avantages */}
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-white">
                Pourquoi rejoindre WatchWhat ?
              </h3>

              <div className="space-y-4">
                <div className="flex items-start space-x-4 p-4 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Heart className="h-6 w-6 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold text-lg">
                      Listes personnalisées
                    </h4>
                    <p className="text-white/70">
                      Gérez vos favoris et votre historique de visionnage
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-4 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <Star className="h-6 w-6 text-purple-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold text-lg">
                      Recommandations personnalisées
                    </h4>
                    <p className="text-white/70">
                      Recevez des suggestions basées sur vos goûts
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-4 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <Shield className="h-6 w-6 text-green-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold text-lg">
                      Sécurisé & Privé
                    </h4>
                    <p className="text-white/70">
                      Vos données sont protégées et sécurisées
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section authentification */}
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
                    {mode === "login" ? "Connexion" : "Inscription"}
                  </h3>
                  <p className="text-white/70">
                    {mode === "login"
                      ? "Connectez-vous à votre compte"
                      : "Créez un nouveau compte"}
                  </p>
                </div>

                {/* Formulaire Email/Mot de passe */}
                <form onSubmit={handleEmailAuth} className="space-y-4 mb-6">
                  {mode === "signup" && (
                    <>
                      <div>
                        <label
                          htmlFor="firstName"
                          className="block text-sm font-medium text-white/90 mb-2"
                        >
                          Prénom
                        </label>
                        <div className="relative">
                          <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/40" />
                          <input
                            id="firstName"
                            type="text"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Votre prénom"
                          />
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="lastName"
                          className="block text-sm font-medium text-white/90 mb-2"
                        >
                          Nom
                        </label>
                        <div className="relative">
                          <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/40" />
                          <input
                            id="lastName"
                            type="text"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Votre nom"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-white/90 mb-2"
                    >
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/40" />
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="votre@email.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-white/90 mb-2"
                    >
                      Mot de passe
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/40" />
                      <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex items-center justify-center space-x-3 p-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl text-white font-semibold text-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-6 w-6 animate-spin" />
                        <span>
                          {mode === "login" ? "Connexion..." : "Création..."}
                        </span>
                      </>
                    ) : (
                      <>
                        <LogIn className="h-6 w-6" />
                        <span>
                          {mode === "login"
                            ? "Se connecter"
                            : "Créer mon compte"}
                        </span>
                      </>
                    )}
                  </button>
                </form>

                {/* Séparateur */}
                <div className="relative mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/20"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-transparent text-white/60">
                      ou
                    </span>
                  </div>
                </div>

                {/* Connexion Google */}
                <button
                  onClick={handleGoogleAuth}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center space-x-3 p-4 bg-white hover:bg-gray-100 rounded-xl text-gray-800 font-semibold text-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-6 w-6 animate-spin" />
                      <span>Connexion...</span>
                    </>
                  ) : (
                    <>
                      <svg className="h-6 w-6" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      <span>Continuer avec Google</span>
                    </>
                  )}
                </button>

                {/* Basculer entre login et signup */}
                <div className="mt-6 text-center">
                  <p className="text-white/60 text-sm">
                    {mode === "login"
                      ? "Vous n'avez pas de compte ?"
                      : "Vous avez déjà un compte ?"}{" "}
                    <button
                      onClick={() => {
                        setMode(mode === "login" ? "signup" : "login");
                        setError(null);
                      }}
                      className="text-blue-400 hover:text-blue-300 font-medium underline"
                    >
                      {mode === "login" ? "Créer un compte" : "Se connecter"}
                    </button>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
