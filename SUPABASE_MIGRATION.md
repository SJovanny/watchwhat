# Instructions de mise à jour de la base de données Supabase

## Nouvelles fonctionnalités ajoutées

Cette mise à jour ajoute la gestion des films (en plus des séries) avec les fonctionnalités suivantes :

- Watchlist pour les films
- Marquer les films comme vus
- Suppression automatique de la watchlist quand un contenu est marqué comme vu (via triggers PostgreSQL)

## 🚀 Étapes pour appliquer les changements sur Supabase

### Étape 1 : Créer les nouvelles tables

1. Connectez-vous à votre projet Supabase : https://app.supabase.com
2. Allez dans **SQL Editor** (icône de base de données dans le menu de gauche)
3. Cliquez sur **New query**
4. Copiez et exécutez ce script :

```sql
-- =====================================================
-- Création des tables pour la gestion des films
-- =====================================================

-- Table pour la watchlist des films
CREATE TABLE IF NOT EXISTS watchlist_movies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  movie_id INTEGER NOT NULL,
  movie_name TEXT NOT NULL,
  movie_data JSONB NOT NULL,
  added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, movie_id)
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_watchlist_movies_user_id ON watchlist_movies(user_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_movies_movie_id ON watchlist_movies(movie_id);

-- Table pour les films vus
CREATE TABLE IF NOT EXISTS watched_movies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  movie_id INTEGER NOT NULL,
  movie_name TEXT NOT NULL,
  movie_data JSONB NOT NULL,
  watched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, movie_id)
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_watched_movies_user_id ON watched_movies(user_id);
CREATE INDEX IF NOT EXISTS idx_watched_movies_movie_id ON watched_movies(movie_id);

-- Activer RLS (Row Level Security)
ALTER TABLE watchlist_movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE watched_movies ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- Politiques RLS pour watchlist_movies
-- =====================================================

CREATE POLICY "Users can view their own movie watchlist"
  ON watchlist_movies FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert into their own movie watchlist"
  ON watchlist_movies FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete from their own movie watchlist"
  ON watchlist_movies FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- Politiques RLS pour watched_movies
-- =====================================================

CREATE POLICY "Users can view their own watched movies"
  ON watched_movies FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert into their own watched movies"
  ON watched_movies FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own watched movies"
  ON watched_movies FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own watched movies"
  ON watched_movies FOR DELETE
  USING (auth.uid() = user_id);
```

### Étape 2 : Créer les triggers pour suppression automatique

Dans le même **SQL Editor** de Supabase, créez une nouvelle requête et exécutez :

```sql
-- =====================================================
-- Triggers pour suppression automatique de la watchlist
-- =====================================================

-- Fonction trigger pour retirer automatiquement une série de la watchlist quand elle est marquée comme vue
CREATE OR REPLACE FUNCTION remove_from_watchlist_on_watched_serie()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM watchlist_items
  WHERE user_id = NEW.user_id
  AND serie_id = NEW.serie_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger sur la table watched_series
DROP TRIGGER IF EXISTS auto_remove_watchlist_serie ON watched_series;
CREATE TRIGGER auto_remove_watchlist_serie
  AFTER INSERT ON watched_series
  FOR EACH ROW
  EXECUTE FUNCTION remove_from_watchlist_on_watched_serie();

-- Fonction trigger pour retirer automatiquement un film de la watchlist quand il est marqué comme vu
CREATE OR REPLACE FUNCTION remove_from_watchlist_on_watched_movie()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM watchlist_movies
  WHERE user_id = NEW.user_id
  AND movie_id = NEW.movie_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger sur la table watched_movies
DROP TRIGGER IF EXISTS auto_remove_watchlist_movie ON watched_movies;
CREATE TRIGGER auto_remove_watchlist_movie
  AFTER INSERT ON watched_movies
  FOR EACH ROW
  EXECUTE FUNCTION remove_from_watchlist_on_watched_movie();
```

### Étape 3 : Vérifier l'installation

Dans le **SQL Editor**, exécutez cette requête pour vérifier que tout est bien installé :

```sql
-- Vérifier que les tables existent
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('watchlist_movies', 'watched_movies');

-- Vérifier les triggers
SELECT
    trigger_name,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_name LIKE 'auto_remove_watchlist%';
```

Vous devriez voir :

- ✅ 2 tables : `watchlist_movies` et `watched_movies`
- ✅ 2 triggers : `auto_remove_watchlist_serie` et `auto_remove_watchlist_movie`

## 📊 Structure des tables créées

### Table `watchlist_movies`

```
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key → users)
- movie_id (INTEGER, TMDB ID)
- movie_name (TEXT)
- movie_data (JSONB, données complètes du film)
- added_at (TIMESTAMPTZ)
```

### Table `watched_movies`

```
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key → users)
- movie_id (INTEGER, TMDB ID)
- movie_name (TEXT)
- movie_data (JSONB, données complètes du film)
- watched_at (TIMESTAMPTZ)
```

## 🎯 Fonctionnement des triggers

### Trigger pour les séries

Quand un utilisateur marque une série comme vue (INSERT dans `watched_series`), le trigger `auto_remove_watchlist_serie` **supprime automatiquement** cette série de `watchlist_items` pour cet utilisateur.

### Trigger pour les films

Quand un utilisateur marque un film comme vu (INSERT dans `watched_movies`), le trigger `auto_remove_watchlist_movie` **supprime automatiquement** ce film de `watchlist_movies` pour cet utilisateur.

## ✨ Comportement attendu dans l'application

### Frontend

- ✅ Au **hover** sur une carte de série/film : affichage des boutons
  - **Check vert** : Marquer comme vu
  - **Heart bleu / Plus blanc** : Ajouter/retirer de la watchlist
- ✅ Sur la **page de détails** : bouton "Marquer comme vu" à côté des favoris
- ✅ **Badge vert** sur les contenus déjà vus (coin supérieur gauche)
- ✅ **Badge bleu** sur les contenus dans la watchlist
- ✅ Quand un contenu est **marqué comme vu**, il disparaît **automatiquement** de la watchlist

### Backend

- ✅ Les **triggers PostgreSQL** gèrent automatiquement la suppression de la watchlist
- ✅ Le code frontend n'a **plus besoin** de faire de suppression manuelle
- ✅ Gestion de l'erreur si un contenu est déjà marqué comme vu (UPDATE au lieu de INSERT)

## 🔧 Rollback (si nécessaire)

Si vous devez annuler ces changements, exécutez dans le **SQL Editor** :

```sql
-- Supprimer les triggers
DROP TRIGGER IF EXISTS auto_remove_watchlist_serie ON watched_series;
DROP TRIGGER IF EXISTS auto_remove_watchlist_movie ON watched_movies;

-- Supprimer les fonctions
DROP FUNCTION IF EXISTS remove_from_watchlist_on_watched_serie();
DROP FUNCTION IF EXISTS remove_from_watchlist_on_watched_movie();

-- Supprimer les tables (⚠️ ATTENTION: cela supprime TOUTES les données)
DROP TABLE IF EXISTS watched_movies;
DROP TABLE IF EXISTS watchlist_movies;
```

## 📝 Notes importantes

1. **Row Level Security (RLS)** : Les politiques RLS sont activées pour garantir que chaque utilisateur ne peut accéder qu'à ses propres données.

2. **Performance** : Des index sont créés sur `user_id` et `movie_id`/`serie_id` pour optimiser les requêtes.

3. **Cascade Delete** : Si un utilisateur est supprimé, toutes ses données de watchlist et films vus sont automatiquement supprimées.

4. **Pas besoin de Prisma** : Toutes les opérations se font directement via Supabase Client dans le frontend.

5. **Frontend déjà prêt** : Le code frontend est déjà configuré pour utiliser ces tables via `UserService.ts`.
