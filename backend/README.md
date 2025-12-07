# Backend WatchWhat

## Structure

```
backend/
├── prisma/           # Schémas et migrations Prisma
│   └── schema.prisma
├── src/
│   ├── db.ts        # Client Prisma
│   └── supabase.ts  # Client Supabase
└── README.md
```

## Services utilisés

- **Supabase** : Authentification et base de données principale
- **Prisma** : ORM pour la gestion des données (si besoin)
- **TMDB API** : Données des films et séries

## Configuration

Les variables d'environnement sont définies dans `.env.local` à la racine du projet :

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_TMDB_API_KEY=
```

## Migrations Prisma

```bash
cd backend
npx prisma generate
npx prisma migrate dev
```
