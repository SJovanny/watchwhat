# 🔧 Guide de configuration Google OAuth pour Supabase

## ❌ Problème actuel

Erreur lors du callback OAuth :
```
Unable to exchange external code: 4/0Ab32j92...
```

Cette erreur indique que la configuration OAuth entre Google et Supabase n'est pas correcte.

## ✅ Solution complète

### Étape 1 : Configuration Google Cloud Console

1. **Accédez à [Google Cloud Console](https://console.cloud.google.com)**

2. **Créez ou sélectionnez votre projet**
   - Si vous n'avez pas de projet, créez-en un nouveau
   - Nom suggéré : `WatchWhat`

3. **Activez l'API Google+ (si nécessaire)**
   - Menu : APIs & Services → Library
   - Recherchez "Google+ API"
   - Cliquez sur "Enable"

4. **Créez des identifiants OAuth 2.0**
   - Menu : APIs & Services → Credentials
   - Cliquez sur "Create Credentials" → "OAuth client ID"
   
5. **Configurez l'écran de consentement OAuth** (si demandé)
   - Type : External (pour tester) ou Internal (si vous avez Google Workspace)
   - Nom de l'application : `WatchWhat`
   - Email de support : votre email
   - Logo : optionnel
   - Domaines autorisés : `supabase.co`
   - Scopes : email, profile, openid (par défaut)

6. **Créez le OAuth Client ID**
   - Type d'application : **Web application**
   - Nom : `WatchWhat Supabase Auth`
   
   **Origines JavaScript autorisées :**
   ```
   http://localhost:3000
   https://ofojgbhosmnfarnestby.supabase.co
   ```
   
   **URI de redirection autorisés :**
   ```
   https://ofojgbhosmnfarnestby.supabase.co/auth/v1/callback
   http://localhost:3000/auth/callback
   ```

7. **⚠️ IMPORTANT : Copiez vos identifiants**
   - **Client ID** : ressemble à `123456789-abc123.apps.googleusercontent.com`
   - **Client Secret** : ressemble à `GOCSPX-abc123def456`
   
   **NE PARTAGEZ JAMAIS CES IDENTIFIANTS !**

### Étape 2 : Configuration Supabase

1. **Accédez à votre [Dashboard Supabase](https://supabase.com/dashboard)**

2. **Sélectionnez votre projet** : `ofojgbhosmnfarnestby`

3. **Configuration du Provider Google**
   - Menu : Authentication → Providers
   - Trouvez "Google" dans la liste
   - Cliquez sur "Enable"
   - Collez :
     - **Client ID (for OAuth)** : (votre Client ID de Google)
     - **Client Secret (for OAuth)** : (votre Client Secret de Google)
   - Cliquez sur "Save"

4. **Configuration des URLs (Important)**
   - Menu : Authentication → URL Configuration
   - **Site URL** : `http://localhost:3000`
   - **Redirect URLs** : 
     ```
     http://localhost:3000/auth/callback
     http://localhost:3000/
     ```

### Étape 3 : Test de la configuration

1. **Démarrez votre serveur de développement**
   ```powershell
   npm run dev
   ```

2. **Accédez à la nouvelle page de connexion**
   ```
   http://localhost:3000/auth/supabase
   ```

3. **Cliquez sur "Continuer avec Google"**

4. **Sélectionnez votre compte Google**

5. **Autorisez l'application**

6. **Vous devriez être redirigé vers** :
   - `/auth/callback` (traitement)
   - `/` (accueil, connecté)

### Étape 4 : Vérification de la session

Ouvrez la console du navigateur et exécutez :
```javascript
import { supabase } from '@/lib/supabase'

// Vérifier la session actuelle
const { data } = await supabase.auth.getSession()
console.log('Session:', data.session)
console.log('User:', data.session?.user)
```

## 🔍 Diagnostic des erreurs

### Erreur : "Unable to exchange external code"

**Causes possibles :**
1. ❌ Client ID ou Client Secret incorrects dans Supabase
2. ❌ URI de redirection non autorisé dans Google Cloud Console
3. ❌ L'URI de redirection dans le code ne correspond pas à celle configurée
4. ❌ API Google+ non activée

**Solutions :**
- Vérifiez que l'URI de redirection est exactement :
  `https://ofojgbhosmnfarnestby.supabase.co/auth/v1/callback`
- Attendez 5-10 minutes après avoir modifié la configuration Google
- Essayez en navigation privée pour éviter les problèmes de cache

### Erreur : "redirect_uri_mismatch"

**Cause :** L'URI de redirection ne correspond pas

**Solution :**
1. Vérifiez dans Google Cloud Console que vous avez bien :
   ```
   https://ofojgbhosmnfarnestby.supabase.co/auth/v1/callback
   ```
2. Pas de slash à la fin !
3. Doit être en HTTPS (sauf localhost)

### Erreur : "access_denied"

**Cause :** L'utilisateur a refusé l'autorisation ou l'app n'est pas publiée

**Solution :**
- Ajoutez votre email comme "Test user" dans Google Cloud Console
- OU publiez votre application OAuth (si prête pour la production)

## 📱 Composants créés

### `/src/components/GoogleLoginButton.tsx`
Bouton de connexion Google réutilisable avec gestion d'erreurs

### `/src/app/auth/supabase/page.tsx`
Page de connexion complète avec design moderne

### `/src/app/auth/callback/page.tsx` (mis à jour)
Gestionnaire de callback amélioré avec meilleurs messages d'erreur

## 🚀 Utilisation dans votre code

```tsx
import { supabase } from '@/lib/supabase'

// Se connecter
await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: `${window.location.origin}/auth/callback`,
  },
})

// Obtenir l'utilisateur actuel
const { data: { user } } = await supabase.auth.getUser()

// Se déconnecter
await supabase.auth.signOut()
```

## 📋 Checklist finale

- [ ] Client ID et Secret copiés depuis Google Cloud Console
- [ ] URIs de redirection configurées dans Google Cloud Console
- [ ] Provider Google activé dans Supabase
- [ ] Client ID et Secret collés dans Supabase
- [ ] Site URL configurée dans Supabase
- [ ] Variables d'environnement dans `.env.local`
- [ ] Serveur redémarré (`npm run dev`)
- [ ] Test de connexion réussi

## 🎯 URLs importantes

- **Page de connexion** : http://localhost:3000/auth/supabase
- **Callback handler** : http://localhost:3000/auth/callback
- **Google Cloud Console** : https://console.cloud.google.com
- **Supabase Dashboard** : https://supabase.com/dashboard

## 🆘 Besoin d'aide ?

Si le problème persiste :

1. Vérifiez les logs de la console navigateur (F12)
2. Vérifiez les logs Supabase (Dashboard → Logs → Auth)
3. Essayez en navigation privée
4. Attendez 10 minutes après toute modification de config
5. Vérifiez que votre projet Google Cloud n'est pas en mode "Testing" avec restrictions

---

**Note importante** : Cette application utilise deux systèmes d'authentification :
- **Supabase OAuth** (Google) : Pour la gestion des utilisateurs et données personnelles
- **TMDB OAuth** : Pour l'accès aux listes et favoris TMDB

Ils sont indépendants et peuvent être utilisés séparément.
