-- Script pour synchroniser les utilisateurs existants dans auth.users vers public.users
-- À exécuter si vous avez des utilisateurs dans auth.users mais pas dans public.users
-- (Par exemple après avoir supprimé des données de public.users)

-- Insérer tous les utilisateurs de auth.users qui n'existent pas dans public.users
INSERT INTO public.users (id, email, "firstName", "lastName", avatar, created_at, updated_at)
SELECT 
  auth_user.id,
  auth_user.email,
  COALESCE(
    auth_user.raw_user_meta_data->>'given_name', 
    split_part(COALESCE(auth_user.raw_user_meta_data->>'name', auth_user.raw_user_meta_data->>'full_name', auth_user.email), ' ', 1)
  ) as "firstName",
  COALESCE(
    auth_user.raw_user_meta_data->>'family_name', 
    NULLIF(split_part(COALESCE(auth_user.raw_user_meta_data->>'name', auth_user.raw_user_meta_data->>'full_name', ''), ' ', 2), '')
  ) as "lastName",
  auth_user.raw_user_meta_data->>'avatar_url' as avatar,
  auth_user.created_at,
  NOW() as updated_at
FROM auth.users auth_user
LEFT JOIN public.users public_user ON auth_user.id = public_user.id
WHERE public_user.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Vérifier combien d'utilisateurs ont été synchronisés
SELECT 
  (SELECT COUNT(*) FROM auth.users) as total_auth_users,
  (SELECT COUNT(*) FROM public.users) as total_public_users,
  (SELECT COUNT(*) FROM auth.users) - (SELECT COUNT(*) FROM public.users) as difference;
