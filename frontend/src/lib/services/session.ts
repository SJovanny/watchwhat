/**
 * Utilisateur de la session courante, lu localement.
 *
 * supabase.auth.getUser() fait un appel réseau au serveur d'authentification,
 * et supabase-js exécute ces appels un par un derrière son verrou de session.
 * Avec deux vérifications par affiche sur l'accueil, la file atteignait
 * ~170 appels (≈17 s) et bloquait les pages suivantes (Profil, Paramètres).
 *
 * getSession() lit la session déjà stockée dans le navigateur (et ne la
 * rafraîchit que si le jeton a expiré). La sécurité ne change pas : chaque
 * requête envoie le jeton, que Supabase vérifie côté serveur (RLS).
 * Réserver getUser() aux endroits qui doivent revalider l'identité.
 */
import type { User } from "@supabase/supabase-js";
import { supabase } from "../supabase";

export async function getSessionUser(): Promise<User | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.user ?? null;
}
