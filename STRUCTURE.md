# Guide de la Nouvelle Structure

## Vue d'ensemble

Le projet a été réorganisé en architecture monorepo avec une séparation claire entre le frontend et le backend.

## Structure

```
watchwhat/
├── frontend/          # Application Next.js complète
│   ├── src/
│   │   ├── app/      # Pages et routes Next.js
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── lib/      # Services frontend (TMDB, storage, etc.)
│   │   └── types/
│   ├── public/       # Images et assets statiques
│   └── *.config.*    # Configurations Next.js, Tailwind, etc.
│
└── backend/          # Services et configuration backend
    ├── src/
    │   ├── db.ts     # Client Prisma
    │   └── supabase.ts # Client Supabase
    └── prisma/       # Schéma de base de données
```

## Avantages de cette structure

### 1. Séparation des préoccupations

- **Frontend** : Interface utilisateur, composants React, hooks
- **Backend** : Configuration BDD, services API, logique métier

### 2. Scalabilité

- Facilite l'ajout d'une vraie API backend plus tard
- Possibilité de déployer frontend et backend séparément
- Structure prête pour un backend Node.js/Express si nécessaire

### 3. Maintenance

- Code mieux organisé et plus facile à naviguer
- Dépendances clairement séparées
- Tests plus faciles à organiser

## Utilisation

### Développement du frontend

```bash
# Depuis la racine
npm run dev

# Depuis le dossier frontend
cd frontend
npm run dev
```

### Gestion de la base de données

```bash
# Générer le client Prisma
npm run backend:generate

# Créer/appliquer des migrations
npm run backend:migrate

# Ouvrir Prisma Studio
cd backend
npx prisma studio
```

## Configuration des variables d'environnement

Le fichier `.env.local` reste à la racine du projet :

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# TMDB API
NEXT_PUBLIC_TMDB_API_KEY=
```

## Imports et références

### Dans le frontend

Les imports restent les mêmes grâce à la configuration TypeScript :

```tsx
// Imports depuis le frontend
import { Serie } from "@/types";
import { tmdbService } from "@/lib/tmdb";
import SerieCard from "@/components/SerieCard";

// Import depuis le backend (si nécessaire)
import { supabase } from "@backend/supabase";
```

### Alias de chemins configurés

- `@/*` → `frontend/src/*`
- `@/components/*` → `frontend/src/components/*`
- `@/lib/*` → `frontend/src/lib/*`
- `@/types/*` → `frontend/src/types/*`
- `@backend/*` → `backend/src/*`

## Migration et changements

### Fichiers déplacés

1. **Frontend** (`src/` → `frontend/src/`)

   - Tous les composants React
   - Pages Next.js
   - Hooks personnalisés
   - Services TMDB et storage
   - Types TypeScript

2. **Backend** (`prisma/` → `backend/prisma/`)

   - Schéma Prisma
   - Migrations
   - Configuration Supabase

3. **Configuration**
   - `next.config.ts` → `frontend/next.config.ts`
   - `tailwind.config.ts` → `frontend/tailwind.config.ts`
   - `tsconfig.json` → `frontend/tsconfig.json` + `backend/tsconfig.json`

### Fichiers non modifiés

- `.env.local` reste à la racine
- `.gitignore` mis à jour pour les deux dossiers
- `package.json` principal configuré en monorepo

## Prochaines étapes possibles

### Court terme

- ✅ Structure séparée frontend/backend
- ⏳ Tests unitaires organisés par dossier
- ⏳ CI/CD séparé pour frontend et backend

### Long terme

- 🔮 Backend API complet (Express/NestJS)
- 🔮 Authentification backend dédiée
- 🔮 Services backend en microservices
- 🔮 Déploiement séparé (Vercel + AWS Lambda)

## Commandes utiles

```bash
# Installation des dépendances (toutes)
npm install

# Nettoyer et réinstaller
rm -rf node_modules frontend/node_modules backend/node_modules
npm install

# Build de production
npm run build

# Vérifier la structure
tree -L 2 frontend backend
```

## Support

En cas de problème avec la nouvelle structure :

1. Vérifier que les imports utilisent les bons alias (`@/` ou `@backend/`)
2. S'assurer que `.env.local` est à la racine
3. Relancer `npm install` à la racine
4. Vérifier que les chemins dans `tsconfig.json` sont corrects
