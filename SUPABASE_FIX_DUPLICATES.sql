-- Script pour corriger les doublons et améliorer la gestion des utilisateurs avec firstName/lastName
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Supprimer les doublons existants (garde seulement le plus ancien)
DELETE FROM public.users a
USING public.users b
WHERE a.id = b.id 
  AND a.created_at > b.created_at;

-- 2. Renommer la colonne 'name' en 'firstName' et ajouter 'lastName' si nécessaire
-- Note: Si vous avez déjà des données avec 'name', cette requête les sépare
ALTER TABLE public.users 
  ADD COLUMN IF NOT EXISTS "firstName" TEXT,
  ADD COLUMN IF NOT EXISTS "lastName" TEXT;

-- Migrer les données existantes de 'name' vers 'firstName' et 'lastName'
UPDATE public.users 
SET 
  "firstName" = COALESCE("firstName", split_part(name, ' ', 1)),
  "lastName" = COALESCE("lastName", NULLIF(split_part(name, ' ', 2), ''))
WHERE name IS NOT NULL AND "firstName" IS NULL;

-- Supprimer l'ancienne colonne 'name' (optionnel, commentez si vous voulez garder)
-- ALTER TABLE public.users DROP COLUMN IF EXISTS name;

-- 3. S'assurer que id est bien la clé primaire
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE public.users ADD PRIMARY KEY (id);

-- 4. Supprimer l'ancienne politique d'insertion si elle existe
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Service role can insert users" ON public.users;

-- 5. Créer une politique pour permettre l'insertion (utilisée par le trigger)
CREATE POLICY "Service role can insert users" ON public.users
  FOR INSERT 
  WITH CHECK (true);

-- 6. Améliorer la fonction handle_new_user pour éviter les doublons et utiliser firstName/lastName
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Utiliser INSERT ... ON CONFLICT pour éviter les doublons
  INSERT INTO public.users (id, email, "firstName", "lastName", avatar, created_at, updated_at)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'given_name', split_part(COALESCE(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name', new.email), ' ', 1)),
    COALESCE(new.raw_user_meta_data->>'family_name', NULLIF(split_part(COALESCE(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name', ''), ' ', 2), '')),
    new.raw_user_meta_data->>'avatar_url',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    "firstName" = COALESCE(EXCLUDED."firstName", public.users."firstName"),
    "lastName" = COALESCE(EXCLUDED."lastName", public.users."lastName"),
    avatar = COALESCE(EXCLUDED.avatar, public.users.avatar),
    updated_at = NOW();
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Créer une fonction pour synchroniser les utilisateurs existants lors de la connexion
CREATE OR REPLACE FUNCTION public.handle_user_login()
RETURNS trigger AS $$
BEGIN
  -- Vérifier si l'utilisateur existe dans public.users
  IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = new.user_id) THEN
    -- Si non, le créer à partir des données d'auth
    INSERT INTO public.users (id, email, "firstName", "lastName", avatar, created_at, updated_at)
    SELECT 
      auth_user.id,
      auth_user.email,
      COALESCE(auth_user.raw_user_meta_data->>'given_name', split_part(COALESCE(auth_user.raw_user_meta_data->>'name', auth_user.raw_user_meta_data->>'full_name', auth_user.email), ' ', 1)),
      COALESCE(auth_user.raw_user_meta_data->>'family_name', NULLIF(split_part(COALESCE(auth_user.raw_user_meta_data->>'name', auth_user.raw_user_meta_data->>'full_name', ''), ' ', 2), '')),
      auth_user.raw_user_meta_data->>'avatar_url',
      NOW(),
      NOW()
    FROM auth.users auth_user
    WHERE auth_user.id = new.user_id
    ON CONFLICT (id) DO NOTHING;
  END IF;
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Recréer le trigger pour les nouveaux utilisateurs
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 9. Créer un trigger pour synchroniser lors de la connexion (via sessions)
DROP TRIGGER IF EXISTS on_user_session_created ON auth.sessions;
CREATE TRIGGER on_user_session_created
  AFTER INSERT ON auth.sessions
  FOR EACH ROW EXECUTE FUNCTION public.handle_user_login();

-- 10. Vérifier qu'il n'y a plus de doublons
SELECT id, email, COUNT(*) as count
FROM public.users
GROUP BY id, email
HAVING COUNT(*) > 1;
