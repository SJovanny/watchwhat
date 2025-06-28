# The Movie Database (TMDB) API v3 Routes

## Account
- `GET /account/{account_id}` - Obtenir les détails du compte
- `POST /account/{account_id}/favorite` - Ajouter/supprimer des favoris
- `POST /account/{account_id}/watchlist` - Ajouter/supprimer de la watchlist
- `GET /account/{account_id}/favorite/movies` - Films favoris du compte
- `GET /account/{account_id}/favorite/tv` - Séries favorites du compte
- `GET /account/{account_id}/lists` - Listes du compte
- `GET /account/{account_id}/rated/movies` - Films notés par le compte
- `GET /account/{account_id}/rated/tv` - Séries notées par le compte
- `GET /account/{account_id}/rated/tv/episodes` - Épisodes notés par le compte
- `GET /account/{account_id}/watchlist/movies` - Watchlist films du compte
- `GET /account/{account_id}/watchlist/tv` - Watchlist séries du compte

## Authentication
- `GET /authentication/guest_session/new` - Créer une session invité
- `GET /authentication/token/new` - Créer un nouveau token de requête
- `POST /authentication/session/new` - Créer une nouvelle session
- `POST /authentication/session/convert/4` - Convertir session v4 en v3
- `POST /authentication/token/validate_with_login` - Valider token avec login
- `DELETE /authentication/session` - Supprimer une session

## Changes
- `GET /movie/changes` - Changements récents des films
- `GET /person/changes` - Changements récents des personnes
- `GET /tv/changes` - Changements récents des séries TV

## Collections
- `GET /collection/{collection_id}` - Détails d'une collection
- `GET /collection/{collection_id}/images` - Images d'une collection
- `GET /collection/{collection_id}/translations` - Traductions d'une collection

## Companies
- `GET /company/{company_id}` - Détails d'une compagnie
- `GET /company/{company_id}/alternative_names` - Noms alternatifs d'une compagnie
- `GET /company/{company_id}/images` - Images d'une compagnie

## Configuration
- `GET /configuration` - Configuration de l'API
- `GET /configuration/countries` - Liste des pays
- `GET /configuration/jobs` - Liste des métiers
- `GET /configuration/languages` - Liste des langues
- `GET /configuration/primary_translations` - Traductions primaires
- `GET /configuration/timezones` - Fuseaux horaires

## Discover
- `GET /discover/movie` - Découvrir des films avec filtres
- `GET /discover/tv` - Découvrir des séries TV avec filtres

## Find
- `GET /find/{external_id}` - Trouver par ID externe (IMDb, TVDB, etc.)

## Genres
- `GET /genre/movie/list` - Liste des genres de films
- `GET /genre/tv/list` - Liste des genres de séries TV

## Keywords
- `GET /keyword/{keyword_id}` - Détails d'un mot-clé
- `GET /keyword/{keyword_id}/movies` - Films associés à un mot-clé

## Movies
- `GET /movie/{movie_id}` - Détails d'un film
- `GET /movie/{movie_id}/account_states` - États du compte pour un film
- `GET /movie/{movie_id}/alternative_titles` - Titres alternatifs d'un film
- `GET /movie/{movie_id}/changes` - Changements d'un film
- `GET /movie/{movie_id}/credits` - Crédits d'un film
- `GET /movie/{movie_id}/external_ids` - IDs externes d'un film
- `GET /movie/{movie_id}/images` - Images d'un film
- `GET /movie/{movie_id}/keywords` - Mots-clés d'un film
- `GET /movie/{movie_id}/lists` - Listes contenant un film
- `GET /movie/{movie_id}/recommendations` - Recommandations basées sur un film
- `GET /movie/{movie_id}/release_dates` - Dates de sortie d'un film
- `GET /movie/{movie_id}/reviews` - Critiques d'un film
- `GET /movie/{movie_id}/similar` - Films similaires
- `GET /movie/{movie_id}/translations` - Traductions d'un film
- `GET /movie/{movie_id}/videos` - Vidéos d'un film
- `GET /movie/{movie_id}/watch/providers` - Fournisseurs de streaming pour un film
- `POST /movie/{movie_id}/rating` - Noter un film
- `DELETE /movie/{movie_id}/rating` - Supprimer la note d'un film
- `GET /movie/latest` - Dernier film ajouté
- `GET /movie/now_playing` - Films actuellement au cinéma
- `GET /movie/popular` - Films populaires
- `GET /movie/top_rated` - Films les mieux notés
- `GET /movie/upcoming` - Films à venir

## People
- `GET /person/{person_id}` - Détails d'une personne
- `GET /person/{person_id}/changes` - Changements d'une personne
- `GET /person/{person_id}/combined_credits` - Crédits combinés d'une personne
- `GET /person/{person_id}/external_ids` - IDs externes d'une personne
- `GET /person/{person_id}/images` - Images d'une personne
- `GET /person/{person_id}/movie_credits` - Crédits films d'une personne
- `GET /person/{person_id}/tv_credits` - Crédits TV d'une personne
- `GET /person/latest` - Dernière personne ajoutée
- `GET /person/popular` - Personnes populaires

## Search
- `GET /search/collection` - Rechercher des collections
- `GET /search/company` - Rechercher des compagnies
- `GET /search/keyword` - Rechercher des mots-clés
- `GET /search/movie` - Rechercher des films
- `GET /search/multi` - Recherche multi-contenu (films, séries, personnes)
- `GET /search/person` - Rechercher des personnes
- `GET /search/tv` - Rechercher des séries TV

## Trending
- `GET /trending/{media_type}/{time_window}` - Contenu en tendance
  - `media_type`: all, movie, tv, person
  - `time_window`: day, week

## TV (Séries)
- `GET /tv/{series_id}` - Détails d'une série TV
- `GET /tv/{series_id}/account_states` - États du compte pour une série
- `GET /tv/{series_id}/aggregate_credits` - Crédits agrégés d'une série
- `GET /tv/{series_id}/alternative_titles` - Titres alternatifs d'une série
- `GET /tv/{series_id}/changes` - Changements d'une série
- `GET /tv/{series_id}/content_ratings` - Classifications de contenu d'une série
- `GET /tv/{series_id}/credits` - Crédits d'une série
- `GET /tv/{series_id}/episode_groups` - Groupes d'épisodes d'une série
- `GET /tv/{series_id}/external_ids` - IDs externes d'une série
- `GET /tv/{series_id}/images` - Images d'une série
- `GET /tv/{series_id}/keywords` - Mots-clés d'une série
- `GET /tv/{series_id}/recommendations` - Recommandations basées sur une série
- `GET /tv/{series_id}/reviews` - Critiques d'une série
- `GET /tv/{series_id}/screened_theatrically` - Épisodes diffusés au cinéma
- `GET /tv/{series_id}/similar` - Séries similaires
- `GET /tv/{series_id}/translations` - Traductions d'une série
- `GET /tv/{series_id}/videos` - Vidéos d'une série
- `GET /tv/{series_id}/watch/providers` - Fournisseurs de streaming pour une série
- `POST /tv/{series_id}/rating` - Noter une série
- `DELETE /tv/{series_id}/rating` - Supprimer la note d'une série
- `GET /tv/latest` - Dernière série ajoutée
- `GET /tv/airing_today` - Séries diffusées aujourd'hui
- `GET /tv/on_the_air` - Séries actuellement diffusées
- `GET /tv/popular` - Séries populaires
- `GET /tv/top_rated` - Séries les mieux notées

## TV Seasons (Saisons)
- `GET /tv/{series_id}/season/{season_number}` - Détails d'une saison
- `GET /tv/{series_id}/season/{season_number}/account_states` - États du compte pour une saison
- `GET /tv/{series_id}/season/{season_number}/aggregate_credits` - Crédits agrégés d'une saison
- `GET /tv/{series_id}/season/{season_number}/changes` - Changements d'une saison
- `GET /tv/{series_id}/season/{season_number}/credits` - Crédits d'une saison
- `GET /tv/{series_id}/season/{season_number}/external_ids` - IDs externes d'une saison
- `GET /tv/{series_id}/season/{season_number}/images` - Images d'une saison
- `GET /tv/{series_id}/season/{season_number}/translations` - Traductions d'une saison
- `GET /tv/{series_id}/season/{season_number}/videos` - Vidéos d'une saison

## TV Episodes (Épisodes)
- `GET /tv/{series_id}/season/{season_number}/episode/{episode_number}` - Détails d'un épisode
- `GET /tv/{series_id}/season/{season_number}/episode/{episode_number}/account_states` - États du compte pour un épisode
- `GET /tv/{series_id}/season/{season_number}/episode/{episode_number}/changes` - Changements d'un épisode
- `GET /tv/{series_id}/season/{season_number}/episode/{episode_number}/credits` - Crédits d'un épisode
- `GET /tv/{series_id}/season/{season_number}/episode/{episode_number}/external_ids` - IDs externes d'un épisode
- `GET /tv/{series_id}/season/{season_number}/episode/{episode_number}/images` - Images d'un épisode
- `GET /tv/{series_id}/season/{season_number}/episode/{episode_number}/translations` - Traductions d'un épisode
- `GET /tv/{series_id}/season/{season_number}/episode/{episode_number}/videos` - Vidéos d'un épisode
- `POST /tv/{series_id}/season/{season_number}/episode/{episode_number}/rating` - Noter un épisode
- `DELETE /tv/{series_id}/season/{season_number}/episode/{episode_number}/rating` - Supprimer la note d'un épisode

## Notes importantes

### Base URL
- API: `https://api.themoviedb.org/3`
- Images: `https://image.tmdb.org/t/p/`

### Authentification
- Utiliser un Bearer Token dans l'en-tête Authorization
- Format: `Authorization: Bearer YOUR_ACCESS_TOKEN`

### Paramètres communs
- `language`: Code de langue (ex: 'fr-FR', 'en-US')
- `page`: Numéro de page pour la pagination (défaut: 1)
- `append_to_response`: Ajouter des données supplémentaires à la réponse

### Tailles d'images disponibles
- **Posters**: w92, w154, w185, w342, w500, w780, original
- **Backdrops**: w300, w780, w1280, original
- **Profils**: w45, w185, h632, original
