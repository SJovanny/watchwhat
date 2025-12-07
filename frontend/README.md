# Frontend WatchWhat

Application Next.js 15 pour recommander des séries TV personnalisées.

## Structure

```
frontend/
├── src/
│   ├── app/              # Pages Next.js (App Router)
│   ├── components/       # Composants React réutilisables
│   ├── hooks/           # Hooks personnalisés
│   ├── lib/             # Services et utilitaires
│   └── types/           # Types TypeScript
├── public/              # Fichiers statiques
└── next.config.ts       # Configuration Next.js
```

## Scripts

```bash
npm run dev      # Démarrer le serveur de développement
npm run build    # Build de production
npm run start    # Démarrer le serveur de production
npm run lint     # Linter le code
```

## Technologies

- **Next.js 15** avec App Router
- **TypeScript** strict
- **Tailwind CSS** pour le styling
- **Supabase** pour l'authentification
- **TMDB API** pour les données des films/séries

## Configuration

Créer un fichier `.env.local` à la racine du projet avec :

```env
NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_clé_supabase
NEXT_PUBLIC_TMDB_API_KEY=votre_clé_tmdb
```
