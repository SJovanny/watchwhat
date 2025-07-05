import { supabase } from './supabase'
import { Serie } from '@/types'

export interface UserData {
  id: string
  email: string
  name?: string | null
  avatar?: string | null
}

export interface WatchlistItem {
  id: string
  serieId: number
  serieName: string
  serieData: Serie
  addedAt: string
}

export interface WatchedSerie {
  id: string
  serieId: number
  serieName: string
  serieData: Serie
  watchedAt: string
  seasonsWatched: number[]
  episodesWatched: Record<string, number[]>
}

export interface UserPreferences {
  favoriteGenres: number[]
  favoriteActors: number[]
  minRating: number
  preferredLanguage: string
}

export interface Rating {
  id: string
  serieId: number
  rating: number
  review?: string | null
  createdAt: string
  updatedAt: string
}

export class UserService {
  // Obtenir l'utilisateur connecté
  static async getCurrentUser(): Promise<UserData | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      return userData || {
        id: user.id,
        email: user.email!,
        name: user.user_metadata?.name || null,
        avatar: user.user_metadata?.avatar_url || null,
      }
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', error)
      return null
    }
  }

  // Créer ou mettre à jour le profil utilisateur
  static async upsertUserProfile(userData: {
    id: string
    email: string
    name?: string
    avatar?: string
  }): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('users')
        .upsert({
          id: userData.id,
          email: userData.email,
          name: userData.name,
          avatar: userData.avatar,
          updated_at: new Date().toISOString(),
        })

      if (error) throw error
      return true
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error)
      return false
    }
  }

  // Authentification
  static async signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
    
    if (error) {
      console.error('Erreur de connexion:', error)
      return { success: false, error }
    }
    
    return { success: true, data }
  }

  static async signInWithEmail(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error('Erreur de connexion:', error)
      return { success: false, error }
    }

    return { success: true, data }
  }

  static async signUpWithEmail(email: string, password: string, name?: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name,
        }
      }
    })

    if (error) {
      console.error('Erreur d\'inscription:', error)
      return { success: false, error }
    }

    return { success: true, data }
  }

  static async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Erreur de déconnexion:', error)
      return { success: false, error }
    }
    return { success: true }
  }

  // Gestion de la watchlist
  static async addToWatchlist(serie: Serie): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return false

      const { error } = await supabase
        .from('watchlist_items')
        .insert({
          user_id: user.id,
          serie_id: serie.id,
          serie_name: serie.name,
          serie_data: serie,
        })

      if (error) throw error
      return true
    } catch (error) {
      console.error('Erreur lors de l\'ajout à la watchlist:', error)
      return false
    }
  }

  static async removeFromWatchlist(serieId: number): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return false

      const { error } = await supabase
        .from('watchlist_items')
        .delete()
        .eq('user_id', user.id)
        .eq('serie_id', serieId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Erreur lors de la suppression de la watchlist:', error)
      return false
    }
  }

  static async getWatchlist(): Promise<WatchlistItem[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []

      const { data, error } = await supabase
        .from('watchlist_items')
        .select('*')
        .eq('user_id', user.id)
        .order('added_at', { ascending: false })

      if (error) throw error
      return data?.map(item => ({
        id: item.id,
        serieId: item.serie_id,
        serieName: item.serie_name,
        serieData: item.serie_data,
        addedAt: item.added_at,
      })) || []
    } catch (error) {
      console.error('Erreur lors de la récupération de la watchlist:', error)
      return []
    }
  }

  static async isInWatchlist(serieId: number): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return false

      const { data, error } = await supabase
        .from('watchlist_items')
        .select('id')
        .eq('user_id', user.id)
        .eq('serie_id', serieId)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return !!data
    } catch (error) {
      console.error('Erreur lors de la vérification de la watchlist:', error)
      return false
    }
  }

  // Gestion des séries vues
  static async markAsWatched(serie: Serie, seasonNumber?: number, episodeNumbers?: number[]): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return false

      // Vérifier si la série existe déjà
      const { data: existing } = await supabase
        .from('watched_series')
        .select('*')
        .eq('user_id', user.id)
        .eq('serie_id', serie.id)
        .single()

      if (existing) {
        // Mettre à jour
        const seasonsWatched = existing.seasons_watched || []
        const episodesWatched = existing.episodes_watched || {}

        if (seasonNumber !== undefined) {
          if (!seasonsWatched.includes(seasonNumber)) {
            seasonsWatched.push(seasonNumber)
          }
          
          if (episodeNumbers) {
            episodesWatched[seasonNumber.toString()] = episodeNumbers
          }
        }

        const { error } = await supabase
          .from('watched_series')
          .update({
            seasons_watched: seasonsWatched,
            episodes_watched: episodesWatched,
            watched_at: new Date().toISOString(),
          })
          .eq('user_id', user.id)
          .eq('serie_id', serie.id)

        if (error) throw error
      } else {
        // Créer nouvelle entrée
        const seasonsWatched = seasonNumber !== undefined ? [seasonNumber] : []
        const episodesWatched = seasonNumber !== undefined && episodeNumbers 
          ? { [seasonNumber.toString()]: episodeNumbers } 
          : {}

        const { error } = await supabase
          .from('watched_series')
          .insert({
            user_id: user.id,
            serie_id: serie.id,
            serie_name: serie.name,
            serie_data: serie,
            seasons_watched: seasonsWatched,
            episodes_watched: episodesWatched,
          })

        if (error) throw error
      }
      return true
    } catch (error) {
      console.error('Erreur lors du marquage comme vu:', error)
      return false
    }
  }

  static async getWatchedSeries(): Promise<WatchedSerie[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []

      const { data, error } = await supabase
        .from('watched_series')
        .select('*')
        .eq('user_id', user.id)
        .order('watched_at', { ascending: false })

      if (error) throw error
      return data?.map(serie => ({
        id: serie.id,
        serieId: serie.serie_id,
        serieName: serie.serie_name,
        serieData: serie.serie_data,
        watchedAt: serie.watched_at,
        seasonsWatched: serie.seasons_watched || [],
        episodesWatched: serie.episodes_watched || {},
      })) || []
    } catch (error) {
      console.error('Erreur lors de la récupération des séries vues:', error)
      return []
    }
  }

  static async clearWatchedHistory(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return false

      const { error } = await supabase
        .from('watched_series')
        .delete()
        .eq('user_id', user.id)

      if (error) throw error
      return true
    } catch (error) {
      console.error("Erreur lors de la suppression de l'historique:", error)
      return false
    }
  }

  static async isWatched(serieId: number): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return false

      const { data, error } = await supabase
        .from('watched_series')
        .select('id')
        .eq('user_id', user.id)
        .eq('serie_id', serieId)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return !!data
    } catch (error) {
      console.error('Erreur lors de la vérification si vu:', error)
      return false
    }
  }

  // Gestion des préférences
  static async updatePreferences(preferences: Partial<UserPreferences>): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return false

      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          favorite_genres: preferences.favoriteGenres,
          favorite_actors: preferences.favoriteActors,
          min_rating: preferences.minRating,
          preferred_language: preferences.preferredLanguage,
        })

      if (error) throw error
      return true
    } catch (error) {
      console.error('Erreur lors de la mise à jour des préférences:', error)
      return false
    }
  }

  static async getPreferences(): Promise<UserPreferences | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      
      if (!data) return null
      
      return {
        favoriteGenres: data.favorite_genres || [],
        favoriteActors: data.favorite_actors || [],
        minRating: data.min_rating || 7.0,
        preferredLanguage: data.preferred_language || 'fr-FR',
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des préférences:', error)
      return null
    }
  }

  // Gestion des notes
  static async rateSerie(serieId: number, rating: number, review?: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return false

      const { error } = await supabase
        .from('ratings')
        .upsert({
          user_id: user.id,
          serie_id: serieId,
          rating,
          review,
          updated_at: new Date().toISOString(),
        })

      if (error) throw error
      return true
    } catch (error) {
      console.error('Erreur lors de la notation:', error)
      return false
    }
  }

  static async getUserRating(serieId: number): Promise<Rating | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      const { data, error } = await supabase
        .from('ratings')
        .select('*')
        .eq('user_id', user.id)
        .eq('serie_id', serieId)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      
      if (!data) return null
      
      return {
        id: data.id,
        serieId: data.serie_id,
        rating: data.rating,
        review: data.review,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      }
    } catch (error) {
      console.error('Erreur lors de la récupération de la note:', error)
      return null
    }
  }

  static async getUserRatings(): Promise<Rating[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []

      const { data, error } = await supabase
        .from('ratings')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })

      if (error) throw error
      return data?.map(rating => ({
        id: rating.id,
        serieId: rating.serie_id,
        rating: rating.rating,
        review: rating.review,
        createdAt: rating.created_at,
        updatedAt: rating.updated_at,
      })) || []
    } catch (error) {
      console.error('Erreur lors de la récupération des notes:', error)
      return []
    }
  }

  // Écouter les changements d'authentification
  static onAuthStateChange(callback: (user: any) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(session?.user || null)
    })
  }
}
