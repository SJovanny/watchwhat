-- Migration SQL pour ajouter les triggers de suppression automatique de la watchlist

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
