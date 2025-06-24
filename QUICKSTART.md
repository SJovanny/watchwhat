# Guide de démarrage rapide - WatchWhat

## 🚀 Première utilisation

### 1. Configuration de l'API TMDB

Avant de pouvoir utiliser WatchWhat, vous devez configurer votre clé API TMDB :

1. **Créez un compte TMDB gratuit** sur [https://www.themoviedb.org/](https://www.themoviedb.org/)
2. **Obtenez votre clé API** :
   - Allez dans votre profil → Paramètres → API
   - Demandez une clé API (gratuite)
   - Copiez votre clé API

3. **Configurez l'environnement** :
   ```bash
   # Copiez le fichier d'exemple
   cp .env.local.example .env.local
   
   # Éditez le fichier .env.local
   nano .env.local
   ```

4. **Ajoutez votre clé API** dans `.env.local` :
   ```env
   NEXT_PUBLIC_TMDB_API_KEY=votre_cle_api_ici
   ```

### 2. Installation et lancement

```bash
# Installer les dépendances
npm install

# Lancer l'application en mode développement
npm run dev
```

L'application sera accessible sur `http://localhost:3000`

## ✨ Fonctionnalités principales

### 🔍 Recherche et découverte
- **Recherche globale** : Utilisez la barre de recherche en haut de page
- **Catégories** : Explorez les séries populaires, mieux nojovannysimon@mac WatchWhat % npm run dev
npm error Missing script: "dev"
npm error
npm error To see a list of scripts, run:
npm error   npm run
npm error A complete log of this run can be found in: /Users/jovannysimon/.npm/_logs/2025-06-23T21_41_44_042Z-debug-0.log
jovannysimon@mac WatchWhat % npm install 
npm error code EACCES
npm error syscall open
npm error path /Users/jovannysimon/package-lock.json
npm error errno -13
npm error Error: EACCES: permission denied, open '/Users/jovannysimon/package-lock.json'
npm error     at async open (node:internal/fs/promises:639:25)
npm error     at async writeFile (node:internal/fs/promises:1212:14)
npm error     at async Promise.all (index 0)
npm error     at async [saveIdealTree] (/usr/local/lib/node_modules/npm/node_modules/@npmcli/arborist/lib/arborist/reify.js:1526:7)
npm error     at async Arborist.reify (/usr/local/lib/node_modules/npm/node_modules/@npmcli/arborist/lib/arborist/reify.js:148:5)
npm error     at async Install.exec (/usr/local/lib/node_modules/npm/lib/commands/install.js:150:5)
npm error     at async Npm.exec (/usr/local/lib/node_modules/npm/lib/npm.js:207:9)
npm error     at async module.exports (/usr/local/lib/node_modules/npm/lib/cli/entry.js:74:5) {
npm error   errno: -13,
npm error   code: 'EACCES',
npm error   syscall: 'open',
npm error   path: '/Users/jovannysimon/package-lock.json'
npm error }
npm error
npm error The operation was rejected by your operating system.
npm error It is likely you do not have the permissions to access this file as the current user
npm error
npm error If you believe this might be a permissions issue, please double-check the
npm error permissions of the file and its containing directories, or try running
npm error the command again as root/Administrator.
npm error A complete log of this run can be found in: /Users/jovannysimon/.npm/_logs/2025-06-23T21_42_04_834Z-debug-0.log
jovannysimon@mac WatchWhat % tées, tendances
- **Filtres avancés** : Filtrez par genre, note, année, etc.

### ❤️ Gestion personnelle
- **Favoris** : Cliquez sur le cœur pour ajouter à vos favoris
- **Historique** : Marquez les séries comme vues avec le bouton play
- **Notes** : Donnez votre avis sur les séries vues

### 🎯 Recommandations
- Plus vous utilisez l'app, plus les recommandations deviennent précises
- L'algorithme apprend de vos goûts et exclut ce que vous avez déjà vu
- Configurez vos préférences pour de meilleures suggestions

## 📱 Navigation

### Desktop
- **Barre de navigation** en haut avec tous les liens principaux
- **Recherche globale** accessible partout
- **Filtres** dans la page découverte

### Mobile
- **Navigation en bas** pour un accès rapide
- **Interface adaptée** au tactile
- **Recherche optimisée** pour mobile

## 🛠️ Personnalisation

### Préférences utilisateur
Accédez à votre profil pour :
- Définir vos genres favoris
- Ajuster la note minimale des recommandations
- Choisir vos langues préférées
- Voir vos statistiques de visionnage

### Données
- **Export** : Sauvegardez vos données en JSON
- **Import** : Restaurez vos données depuis un fichier
- **Réinitialisation** : Supprimez toutes vos données

## 🎨 Interface

### Mode sombre
- **Automatique** : Suit les préférences de votre système
- **Design moderne** avec Tailwind CSS
- **Transitions fluides** et animations

### Responsive
- **Mobile-first** : Optimisé pour tous les écrans
- **Tablette** : Interface adaptée
- **Desktop** : Expérience complète

## 📊 Statistiques

Dans votre profil, consultez :
- **Nombre de séries vues**
- **Nombre de favoris**
- **Note moyenne** de vos évaluations
- **Temps estimé** de visionnage

## 🔧 Dépannage

### Problèmes courants

**❌ Les séries ne se chargent pas**
- Vérifiez votre clé API TMDB dans `.env.local`
- Redémarrez le serveur de développement
- Vérifiez votre connexion internet

**❌ Images manquantes**
- Normal, certaines séries n'ont pas d'images
- Des placeholders sont affichés automatiquement

**❌ Données perdues**
- Les données sont stockées localement (localStorage)
- Exportez régulièrement vos données importantes
- Évitez de vider le cache du navigateur

### Commandes utiles

```bash
# Redémarrer le serveur
npm run dev

# Construire pour la production
npm run build

# Vérifier les erreurs
npm run lint

# Installer une nouvelle dépendance
npm install package-name
```

## 🚀 Déploiement

### Vercel (recommandé)
1. Connectez votre repo GitHub à Vercel
2. Ajoutez `NEXT_PUBLIC_TMDB_API_KEY` dans les variables d'environnement
3. Déployez !

### Autres plateformes
- **Netlify** : Support Next.js complet
- **Railway** : Déploiement simple
- **Vercel** : Créé par l'équipe Next.js

## 💡 Conseils d'utilisation

### Pour de meilleures recommandations
1. **Ajoutez vos séries favorites** dès le début
2. **Marquez les séries vues** régulièrement
3. **Notez vos séries** pour affiner l'algorithme
4. **Configurez vos genres préférés** dans le profil

### Gestion des données
- **Exportez vos données** régulièrement
- **Organisez vos favoris** par suppression si besoin
- **Nettoyez votre historique** des erreurs

## 📝 Support

### Ressources
- **README.md** : Documentation complète
- **Code source** : Commenté et structuré
- **Types TypeScript** : Documentation automatique

### Contribution
- Les contributions sont les bienvenues !
- Suivez les guidelines dans le README
- Utilisez TypeScript pour tout nouveau code

---

**Bon visionnage avec WatchWhat ! 🎬✨**
