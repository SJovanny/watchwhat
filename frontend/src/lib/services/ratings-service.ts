/**
 * Service de notation - Gère les notes et avis
 * Principe SRP : Ce service ne gère que les ratings
 */
import { supabase } from "../supabase";

export interface Rating {
  id: string;
  serieId: number;
  rating: number;
  review?: string | null;
  createdAt: string;
  updatedAt: string;
}

export class RatingsService {
  /**
   * Noter une série
   */
  static async rateSerie(
    serieId: number,
    rating: number,
    review?: string
  ): Promise<boolean> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase.from("ratings").upsert({
        user_id: user.id,
        serie_id: serieId,
        rating,
        review,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Erreur lors de la notation:", error);
      return false;
    }
  }

  /**
   * Obtenir la note d'un utilisateur pour une série
   */
  static async getUserRating(serieId: number): Promise<Rating | null> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from("ratings")
        .select("*")
        .eq("user_id", user.id)
        .eq("serie_id", serieId)
        .maybeSingle();

      if (error) throw error;

      if (!data) return null;

      return {
        id: data.id,
        serieId: data.serie_id,
        rating: data.rating,
        review: data.review,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    } catch (error) {
      console.error("Erreur lors de la récupération de la note:", error);
      return null;
    }
  }

  /**
   * Obtenir toutes les notes de l'utilisateur
   */
  static async getUserRatings(): Promise<Rating[]> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("ratings")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      if (error) throw error;
      return (
        data?.map((rating) => ({
          id: rating.id,
          serieId: rating.serie_id,
          rating: rating.rating,
          review: rating.review,
          createdAt: rating.created_at,
          updatedAt: rating.updated_at,
        })) || []
      );
    } catch (error) {
      console.error("Erreur lors de la récupération des notes:", error);
      return [];
    }
  }
}
