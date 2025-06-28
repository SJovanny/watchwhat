# Configuration Supabase pour WatchWhat

## 1. Créer un projet Supabase

1. Allez sur [supabase.com](https://supabase.com)
2. Créez un compte et un nouveau projet
3. Notez l'URL et la clé anonyme du projet

## 2. Installation des dépendances

```bash
npm install @supabase/supabase-js prisma @prisma/client
npm install --save-dev prisma
```

## 3. Variables d'environnement

Créez/modifiez `.env.local` :

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Base de données (depuis Supabase Dashboard > Settings > Database)
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT].supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT].supabase.co:5432/postgres"

# TMDB (existant)
NEXT_PUBLIC_TMDB_READ_ACCESS_TOKEN=your-tmdb-token
```

## 4. Configuration des tables Supabase

### Option A: Via le Dashboard Supabase (Recommandé)

Allez dans **Database > SQL Editor** et exécutez :

```sql
-- Activer RLS (Row Level Security)
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Table des profils utilisateur
CREATE TABLE users (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des préférences utilisateur
CREATE TABLE user_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  favorite_genres INTEGER[],
  favorite_actors INTEGER[],
  min_rating REAL DEFAULT 7.0,
  preferred_language TEXT DEFAULT 'fr-FR'
);

-- Table de la watchlist
CREATE TABLE watchlist_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  serie_id INTEGER NOT NULL,
  serie_name TEXT NOT NULL,
  serie_data JSONB NOT NULL,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, serie_id)
);

-- Table des séries vues
CREATE TABLE watched_series (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  serie_id INTEGER NOT NULL,
  serie_name TEXT NOT NULL,
  serie_data JSONB NOT NULL,
  watched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  seasons_watched INTEGER[],
  episodes_watched JSONB DEFAULT '{}',
  UNIQUE(user_id, serie_id)
);

-- Table des notes
CREATE TABLE ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  serie_id INTEGER NOT NULL,
  rating REAL NOT NULL CHECK (rating >= 0.5 AND rating <= 10),
  review TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, serie_id)
);

-- Politiques RLS (Row Level Security)
-- Users peuvent voir/modifier leurs propres données

-- Users table
CREATE POLICY "Users can view own profile" ON users 
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users 
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON users 
  FOR INSERT WITH CHECK (auth.uid() = id);

-- User preferences
CREATE POLICY "Users can manage own preferences" ON user_preferences 
  FOR ALL USING (auth.uid() = user_id);

-- Watchlist
CREATE POLICY "Users can manage own watchlist" ON watchlist_items 
  FOR ALL USING (auth.uid() = user_id);

-- Watched series
CREATE POLICY "Users can manage own watched series" ON watched_series 
  FOR ALL USING (auth.uid() = user_id);

-- Ratings
CREATE POLICY "Users can manage own ratings" ON ratings 
  FOR ALL USING (auth.uid() = user_id);

-- Activer RLS sur toutes les tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE watchlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE watched_series ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour users
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger pour ratings
CREATE TRIGGER update_ratings_updated_at 
  BEFORE UPDATE ON ratings 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Option B: Via Prisma

```bash
npx prisma db push
```

## 5. Configuration de l'authentification

Dans le Dashboard Supabase, allez dans **Authentication > Settings** :

### Providers OAuth

**Google (Recommandé)**
1. Activez Google Provider
2. Ajoutez vos credentials Google OAuth
3. URL de redirection : `http://localhost:3000/auth/callback`

**Configuration site web**
- Site URL: `http://localhost:3000`
- Redirect URLs: `http://localhost:3000/auth/callback`

## 6. Test de la configuration

```bash
# Générer le client Prisma
npx prisma generate

# Démarrer le projet
npm run dev
```

## 7. Fonctionnalités disponibles

✅ **Authentification complète** (Google OAuth, Email/Password)
✅ **Watchlist personnelle** (ajouter/supprimer des séries)
✅ **Historique de visionnage** (séries vues avec détail saisons/épisodes)
✅ **Système de notes et critiques**
✅ **Préférences utilisateur** (genres favoris, acteurs, langue)
✅ **Recommandations personnalisées** basées sur l'historique
✅ **Synchronisation temps réel** entre appareils
✅ **Sécurité RLS** (chaque utilisateur ne voit que ses données)

## 8. Intégration dans les composants

Vous pouvez maintenant utiliser `UserService` dans vos composants :

```tsx
import { UserService } from '@/lib/user-service'

// Connexion
await UserService.signInWithGoogle()

// Ajouter à la watchlist
await UserService.addToWatchlist(serie)

// Marquer comme vu
await UserService.markAsWatched(serie, seasonNumber, episodeNumbers)

// Obtenir les recommandations personnalisées
const preferences = await UserService.getPreferences()
const watchedSeries = await UserService.getWatchedSeries()
```

## 9. Avantages de Supabase

- **Gratuit jusqu'à 500MB**
- **Authentification intégrée**
- **Base de données PostgreSQL**
- **API temps réel**
- **Sécurité RLS**
- **Dashboard intuitif**
- **Scaling automatique**
