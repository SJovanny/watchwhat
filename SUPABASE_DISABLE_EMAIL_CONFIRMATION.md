# 🚀 Désactiver la confirmation d'email (Développement)

## Étapes à suivre :

1. **Allez sur Supabase Dashboard**

   - https://supabase.com/dashboard

2. **Sélectionnez votre projet WatchWhat**

3. **Navigation :**

   ```
   Authentication → Providers → Email
   ```

4. **Décochez ces options :**

   - ❌ **"Confirm email"** (Email confirmation)
   - ❌ **"Secure email change"** (si activé)

5. **Cliquez sur "Save"**

## ✅ Résultat :

- Les utilisateurs pourront créer un compte immédiatement
- Pas besoin d'email de confirmation
- Connexion instantanée après inscription

## ⚠️ Important :

Cette configuration est **recommandée pour le développement** seulement.

Pour la production, vous devrez configurer un service SMTP (voir fichier suivant).

---

## 🧪 Test après désactivation :

1. Créez un nouveau compte avec email/password
2. Vous devriez être connecté immédiatement
3. Vérifiez que l'utilisateur apparaît dans :
   - `auth.users` table
   - `public.users` table (grâce au trigger)
