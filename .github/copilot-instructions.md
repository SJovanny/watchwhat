<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Instructions Copilot pour WatchWhat

## Contexte du projet
WatchWhat est une application web Next.js qui recommande des séries TV personnalisées en utilisant l'API TMDB. L'application permet aux utilisateurs de :
- Rechercher des séries
- Gérer leurs favoris et leur historique de visionnage
- Recevoir des recommandations personnalisées
- Filtrer les contenus par genres, notes, etc.

## Technologies principales
- **Next.js 15** avec App Router
- **TypeScript** strict
- **Tailwind CSS** pour le styling
- **API TMDB** pour les données des séries
- **localStorage** pour la persistance des données utilisateur

## Guidelines de développement

### Structure des composants
- Utiliser TypeScript pour tous les nouveaux fichiers
- Exporter les composants par défaut
- Définir les interfaces/types avant le composant
- Utiliser des props explicites et typées

### Gestion des états
- Utiliser `useState` pour l'état local des composants
- Préférer les custom hooks pour la logique réutilisable
- Utiliser le service `storageService` pour la persistance

### Styling
- Utiliser exclusivement Tailwind CSS
- Respecter le design system avec les couleurs définies
- Assurer la responsivité mobile-first
- Utiliser le mode sombre avec les classes `dark:`

### API TMDB
- Toujours utiliser le service `tmdbService` pour les appels API
- Gérer les erreurs avec try/catch
- Utiliser les types définis dans `src/types/index.ts`
- Respecter les limites de rate limiting de TMDB

### Performance
- Lazy loading pour les images avec Next.js Image
- Débouncing pour les recherches
- Pagination pour les listes longues
- Gestion des états de chargement

### Accessibilité
- Utiliser des éléments sémantiques HTML
- Ajouter des attributs ARIA appropriés
- Assurer la navigation au clavier
- Contraste de couleurs suffisant

## Conventions de nommage
- Fichiers: PascalCase pour les composants, camelCase pour les utilitaires
- Variables: camelCase
- Types/Interfaces: PascalCase
- Constantes: UPPER_SNAKE_CASE

## Exemples de patterns à suivre

### Composant type
```tsx
interface ComponentProps {
  serie: Serie;
  onAction?: (serie: Serie) => void;
}

export default function SerieComponent({ serie, onAction }: ComponentProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleClick = () => {
    onAction?.(serie);
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg">
      {/* JSX */}
    </div>
  );
}
```

### Service API
```tsx
export const apiService = {
  async getData(): Promise<ResponseType> {
    try {
      const response = await tmdbApi.get('/endpoint');
      return response.data;
    } catch (error) {
      console.error('Error fetching data:', error);
      throw error;
    }
  }
};
```

## Points d'attention
- Toujours vérifier que `NEXT_PUBLIC_TMDB_API_KEY` est configurée
- Gérer les cas où les images TMDB ne sont pas disponibles
- Optimiser pour le mobile (navigation bottom bar)
- Prévoir les états vides et d'erreur
- Tester la fonctionnalité hors ligne pour localStorage
