// Test de configuration Supabase Google OAuth
// Exécutez ce fichier dans la console du navigateur pour tester

console.log('🔍 Test de configuration Supabase Google OAuth\n');

// Vérifier les variables d'environnement
console.log('1️⃣ Variables d\'environnement:');
console.log('   NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL || '❌ Non définie');
console.log('   NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Définie' : '❌ Non définie');

// Test de connexion Supabase
console.log('\n2️⃣ Test de connexion Supabase:');

import { supabase } from './src/lib/supabase.ts';

(async () => {
  try {
    // Vérifier la session actuelle
    console.log('\n   Vérification de la session...');
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('   ❌ Erreur session:', sessionError.message);
    } else if (sessionData.session) {
      console.log('   ✅ Session active:');
      console.log('      - User ID:', sessionData.session.user.id);
      console.log('      - Email:', sessionData.session.user.email);
      console.log('      - Provider:', sessionData.session.user.app_metadata.provider);
    } else {
      console.log('   ℹ️  Aucune session active (utilisateur non connecté)');
    }

    // Vérifier les providers disponibles
    console.log('\n3️⃣ Providers OAuth disponibles:');
    
    // Test de création d'URL OAuth Google
    try {
      const { data: oauthData, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          skipBrowserRedirect: true, // Ne pas rediriger, juste obtenir l'URL
        },
      });

      if (oauthError) {
        console.error('   ❌ Google OAuth non disponible:', oauthError.message);
      } else {
        console.log('   ✅ Google OAuth configuré');
        console.log('      URL:', oauthData.url);
      }
    } catch (e) {
      console.error('   ❌ Erreur Google OAuth:', e.message);
    }

    // Vérifier les tables Supabase
    console.log('\n4️⃣ Vérification des tables:');
    
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (usersError) {
      if (usersError.code === '42P01') {
        console.log('   ⚠️  Table "users" n\'existe pas encore');
        console.log('      → Exécutez les migrations SQL depuis GOOGLE_AUTH_FIX.md');
      } else {
        console.error('   ❌ Erreur:', usersError.message);
      }
    } else {
      console.log('   ✅ Table "users" existe');
    }

    // Résumé
    console.log('\n' + '='.repeat(60));
    console.log('📊 RÉSUMÉ DU DIAGNOSTIC\n');
    
    if (!sessionData.session) {
      console.log('📝 Actions requises:');
      console.log('   1. Configurez Google OAuth dans Google Cloud Console');
      console.log('   2. Configurez le Provider Google dans Supabase');
      console.log('   3. Testez la connexion sur http://localhost:3000/auth/supabase');
      console.log('\n   Consultez GOOGLE_AUTH_FIX.md pour les instructions détaillées.');
    } else {
      console.log('✅ Configuration OK ! Utilisateur connecté.');
    }
    
    console.log('='.repeat(60));

  } catch (error) {
    console.error('\n❌ Erreur lors du diagnostic:', error);
  }
})();
