# Configuration Supabase pour l'authentification

## Problème : "Email déjà existant" alors que c'est faux

### Vérifications à faire dans Supabase Dashboard :

1. **Désactiver la confirmation d'email (pour les tests)**

   - Allez dans : **Authentication** > **Providers** > **Email**
   - Décochez **"Confirm email"** (temporairement pour tester)
   - Cliquez sur **Save**

2. **Vérifier les utilisateurs existants**

   - Allez dans : **Authentication** > **Users**
   - Vérifiez si l'email existe déjà dans la liste
   - Si oui, supprimez l'utilisateur pour pouvoir recréer le compte

3. **Vérifier la table public.users**

   - Allez dans : **Table Editor** > **users**
   - Vérifiez si l'email existe dans cette table
   - Si oui, supprimez la ligne correspondante

4. **Nettoyer complètement un email pour tester**

   ```sql
   -- Exécuter dans SQL Editor
   -- Remplacez 'votre@email.com' par l'email à nettoyer

   -- Supprimer de public.users
   DELETE FROM public.users WHERE email = 'votre@email.com';

   -- Supprimer de auth.users (nécessite des permissions service_role)
   -- Utilisez plutôt le Dashboard pour supprimer de auth.users
   ```

5. **Activer les logs d'authentification**
   - Allez dans : **Authentication** > **Configuration**
   - Vérifiez les paramètres de sécurité
   - Regardez les **Logs** pour voir les erreurs détaillées

### Test après modifications :

1. Essayez de créer un compte avec un **nouvel email** que vous n'avez jamais utilisé
2. Vérifiez la console du navigateur pour voir les messages d'erreur détaillés
3. Vérifiez que les triggers SQL sont bien créés (SUPABASE_FIX_DUPLICATES.sql)

### Note importante :

Supabase peut mettre en cache les tentatives de connexion. Si vous testez plusieurs fois avec le même email, attendez 1-2 minutes ou utilisez un email complètement différent.
