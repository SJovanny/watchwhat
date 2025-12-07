# Instructions de mise à jour de la base de données

## Nouvelles fonctionnalités ajoutées

Cette mise à jour ajoute la gestion des films (en plus des séries) avec les fonctionnalités suivantes :

- Watchlist pour les films
- Marquer les films comme vus
- Suppression automatique de la watchlist quand un contenu est marqué comme vu (via triggers PostgreSQL)

## Étapes pour appliquer les changements

### 1. Mettre à jour le schema Prisma

Le fichier `backend/prisma/schema.prisma` a été mis à jour avec :

- `WatchlistMovie` - Table pour la watchlist des films
- `WatchedMovie` - Table pour les films vus
- Relations ajoutées au modèle User

### 2. Générer et appliquer la migration Prisma

```bash
cd backend
npx prisma migrate dev --name add_movies_and_triggers
```

Cette commande va :

- Créer les nouvelles tables `watchlist_movies` et `watched_movies`
- Mettre à jour le client Prisma

### 3. Appliquer les triggers SQL

Les triggers doivent être appliqués manuellement après la migration Prisma :

```bash
# Se connecter à votre base Supabase via l'interface SQL Editor ou psql
# Puis exécuter le contenu du fichier :
```

Copiez et exécutez le contenu de `backend/prisma/migrations/add_auto_remove_watchlist_trigger.sql` dans l'éditeur SQL de Supabase.

Ou via psql :

```bash
psql "postgresql://[YOUR_SUPABASE_CONNECTION_STRING]" -f backend/prisma/migrations/add_auto_remove_watchlist_trigger.sql
```

### 4. Vérifier l'installation

Vous pouvez vérifier que les triggers sont bien installés avec cette requête SQL :

```sql
-- Vérifier les triggers
SELECT
    trigger_name,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_name LIKE 'auto_remove_watchlist%';
```

Vous devriez voir :

- `auto_remove_watchlist_serie` sur la table `watched_series`
- `auto_remove_watchlist_movie` sur la table `watched_movies`

## Fonctionnement des triggers

### Trigger pour les séries

Quand un utilisateur marque une série comme vue (INSERT dans `watched_series`), le trigger `auto_remove_watchlist_serie` supprime automatiquement cette série de `watchlist_items` pour cet utilisateur.

### Trigger pour les films

Quand un utilisateur marque un film comme vu (INSERT dans `watched_movies`), le trigger `auto_remove_watchlist_movie` supprime automatiquement ce film de `watchlist_movies` pour cet utilisateur.

## Comportement attendu

### Frontend

- ✅ Au hover sur une carte de série/film : affichage des boutons Check (marquer comme vu) et Heart/Plus (watchlist)
- ✅ Sur la page de détails : bouton "Marquer comme vu" à côté des favoris
- ✅ Badge vert sur les contenus déjà vus
- ✅ Badge bleu sur les contenus dans la watchlist
- ✅ Quand un contenu est marqué comme vu, il disparaît automatiquement de la watchlist

### Backend

- ✅ Les triggers PostgreSQL gèrent automatiquement la suppression de la watchlist
- ✅ Le code frontend n'a plus besoin de faire de suppression manuelle
- ✅ Gestion de l'erreur si un contenu est déjà marqué comme vu (UPDATE au lieu de INSERT)

## Rollback (si nécessaire)

Si vous devez annuler ces changements :

```sql
-- Supprimer les triggers
DROP TRIGGER IF EXISTS auto_remove_watchlist_serie ON watched_series;
DROP TRIGGER IF EXISTS auto_remove_watchlist_movie ON watched_movies;

-- Supprimer les fonctions
DROP FUNCTION IF EXISTS remove_from_watchlist_on_watched_serie();
DROP FUNCTION IF EXISTS remove_from_watchlist_on_watched_movie();

-- Supprimer les tables (ATTENTION: cela supprime toutes les données)
DROP TABLE IF EXISTS watched_movies;
DROP TABLE IF EXISTS watchlist_movies;
```

Puis revertir la migration Prisma :

```bash
cd backend
npx prisma migrate reset
```
