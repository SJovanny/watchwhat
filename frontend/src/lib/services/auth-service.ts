/**
 * Service d'authentification - Gère l'authentification utilisateur
 * Principe SRP : Ce service ne gère que l'authentification
 */
import { supabase } from "../supabase";

export interface UserData {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  avatar?: string | null;
}

export class AuthService {
  /**
   * Obtenir l'utilisateur connecté
   */
  static async getCurrentUser(): Promise<UserData | null> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: userData } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

      return (
        userData || {
          id: user.id,
          email: user.email!,
          firstName:
            user.user_metadata?.given_name ||
            user.user_metadata?.name?.split(" ")[0] ||
            null,
          lastName:
            user.user_metadata?.family_name ||
            user.user_metadata?.name?.split(" ")[1] ||
            null,
          avatar: user.user_metadata?.avatar_url || null,
        }
      );
    } catch (error) {
      console.error("Erreur lors de la récupération de l'utilisateur:", error);
      return null;
    }
  }

  /**
   * Créer ou mettre à jour le profil utilisateur
   */
  static async upsertUserProfile(userData: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
  }): Promise<boolean> {
    try {
      const { data: existingUser, error: fetchError } = await supabase
        .from("users")
        .select("id, firstName, lastName, avatar")
        .eq("id", userData.id)
        .maybeSingle();

      if (fetchError && fetchError.code !== "PGRST116") {
        throw fetchError;
      }

      if (existingUser) {
        const { error } = await supabase
          .from("users")
          .update({
            email: userData.email,
            firstName: userData.firstName || existingUser.firstName,
            lastName: userData.lastName || existingUser.lastName,
            avatar: userData.avatar || existingUser.avatar,
            updated_at: new Date().toISOString(),
          })
          .eq("id", userData.id);

        if (error) throw error;
      }

      return true;
    } catch (error) {
      console.error("Erreur lors de la mise à jour du profil:", error);
      return false;
    }
  }

  /**
   * Vérifier si un email existe déjà
   */
  static async checkEmailExists(email: string): Promise<boolean> {
    try {
      const { data: existingUser } = await supabase
        .from("users")
        .select("id")
        .eq("email", email)
        .maybeSingle();

      return !!existingUser;
    } catch (error) {
      console.error("Erreur lors de la vérification de l'email:", error);
      return false;
    }
  }

  /**
   * Synchroniser l'utilisateur dans public.users après connexion
   */
  static async syncUserAfterLogin(userId: string): Promise<void> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || user.id !== userId) return;

      const { data: existingUser } = await supabase
        .from("users")
        .select("id")
        .eq("id", userId)
        .maybeSingle();

      if (!existingUser) {
        await this.upsertUserProfile({
          id: user.id,
          email: user.email!,
          firstName:
            user.user_metadata?.given_name ||
            user.user_metadata?.name?.split(" ")[0],
          lastName:
            user.user_metadata?.family_name ||
            user.user_metadata?.name?.split(" ")[1],
          avatar: user.user_metadata?.avatar_url,
        });
      }
    } catch (error) {
      console.error(
        "Erreur lors de la synchronisation de l'utilisateur:",
        error
      );
    }
  }

  /**
   * Connexion avec Google
   */
  static async signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      console.error("Erreur de connexion:", error);
      return { success: false, error };
    }

    return { success: true, data };
  }

  /**
   * Connexion avec email/mot de passe
   */
  static async signInWithEmail(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Erreur de connexion:", error);
      return { success: false, error };
    }

    if (data.user) {
      await this.syncUserAfterLogin(data.user.id);
    }

    return { success: true, data };
  }

  /**
   * Inscription avec email/mot de passe
   */
  static async signUpWithEmail(
    email: string,
    password: string,
    firstName?: string,
    lastName?: string
  ) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          given_name: firstName,
          family_name: lastName,
          name:
            firstName && lastName
              ? `${firstName} ${lastName}`
              : firstName || "",
        },
      },
    });

    if (error) {
      console.error("Erreur d'inscription:", error);

      if (
        error.message.includes("already registered") ||
        error.message.includes("already exists") ||
        error.message.includes("User already registered")
      ) {
        return {
          success: false,
          error: {
            message:
              "Un compte avec cet email existe déjà. Veuillez vous connecter.",
            code: "email_exists",
            originalError: error,
          },
        };
      }

      return { success: false, error };
    }

    return { success: true, data };
  }

  /**
   * Déconnexion
   */
  static async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Erreur de déconnexion:", error);
      return { success: false, error };
    }
    return { success: true };
  }

  /**
   * Écouter les changements d'authentification
   */
  static onAuthStateChange(callback: (user: any) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(session?.user || null);
    });
  }
}
