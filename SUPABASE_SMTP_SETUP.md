# 📧 Configuration SMTP pour la production

## 🌟 Option 1 : Resend (Recommandé)

### Avantages :

- ✅ **Gratuit** : 3,000 emails/mois
- ✅ **Simple** : Configuration en 5 minutes
- ✅ **Moderne** : API REST facile
- ✅ **Fiable** : Très bon taux de délivrabilité

### Configuration :

1. **Créez un compte Resend**

   - https://resend.com/signup

2. **Vérifiez votre domaine (ou utilisez leur domaine de test)**

   - Domaine de test : `onboarding.resend.dev` (gratuit, limité)
   - Votre domaine : ajoutez les DNS records

3. **Générez une API Key**

   - Dashboard → API Keys → Create API Key

4. **Dans Supabase :**

   ```
   Project Settings → Auth → SMTP Settings
   ```

5. **Remplissez avec les valeurs Resend :**

   ```
   Enable Custom SMTP: ✅ ON

   Sender email: noreply@votredomaine.com
   Sender name: WatchWhat

   Host: smtp.resend.com
   Port: 465
   Username: resend
   Password: [Votre API Key Resend]

   Minimum interval: 60 seconds
   Rate limit: 10 emails per hour
   ```

6. **Testez l'envoi d'email**
   - Créez un compte → vous devriez recevoir l'email

---

## 📮 Option 2 : SendGrid

### Avantages :

- ✅ **Gratuit** : 100 emails/jour
- ✅ **Entreprise** : Très scalable
- ✅ **Analytics** : Statistiques détaillées

### Configuration :

1. **Créez un compte SendGrid**

   - https://signup.sendgrid.com/

2. **Créez une API Key**

   - Settings → API Keys → Create API Key
   - Choisissez "Full Access"

3. **Vérifiez un sender**

   - Settings → Sender Authentication
   - Ajoutez votre email ou domaine

4. **Dans Supabase SMTP Settings :**

   ```
   Enable Custom SMTP: ✅ ON

   Sender email: votre-email-verifié@example.com
   Sender name: WatchWhat

   Host: smtp.sendgrid.net
   Port: 465
   Username: apikey
   Password: [Votre API Key SendGrid]
   ```

---

## 🔧 Option 3 : Gmail (Développement uniquement)

### ⚠️ Limites :

- ❌ Limite : 500 emails/jour
- ❌ Complexité : App Password requis
- ❌ Non recommandé pour production

### Configuration :

1. **Activez l'authentification 2FA sur Gmail**

2. **Générez un App Password**

   - https://myaccount.google.com/apppasswords

3. **Dans Supabase SMTP Settings :**

   ```
   Enable Custom SMTP: ✅ ON

   Sender email: votre-email@gmail.com
   Sender name: WatchWhat

   Host: smtp.gmail.com
   Port: 465
   Username: votre-email@gmail.com
   Password: [Votre App Password - 16 caractères]
   ```

---

## 🎨 Personnalisation des emails

Une fois le SMTP configuré :

1. **Allez dans Authentication → Email Templates**

2. **Copiez les templates depuis :**

   ```
   SUPABASE_EMAIL_TEMPLATES.html
   ```

3. **Personnalisez chaque template :**
   - **Confirm signup** : Email de bienvenue
   - **Reset password** : Réinitialisation du mot de passe
   - **Change email** : Changement d'adresse email

---

## 📊 Comparaison

| Service  | Gratuit/mois | Facilité   | Production | Recommandation   |
| -------- | ------------ | ---------- | ---------- | ---------------- |
| Resend   | 3,000 emails | ⭐⭐⭐⭐⭐ | ✅ Oui     | 🏆 **Meilleur**  |
| SendGrid | 100/jour     | ⭐⭐⭐⭐   | ✅ Oui     | ✅ Très bien     |
| Gmail    | 500/jour     | ⭐⭐⭐     | ❌ Non     | 🧪 Dev seulement |

---

## ✅ Checklist de configuration :

- [ ] Compte créé sur le service SMTP
- [ ] Domaine vérifié (ou domaine de test)
- [ ] API Key / App Password généré
- [ ] SMTP configuré dans Supabase
- [ ] Email de test envoyé avec succès
- [ ] Templates personnalisés copiés
- [ ] Confirmation email réactivée dans Auth Settings

---

## 🐛 Troubleshooting :

### "Error sending confirmation email"

- ✅ Vérifiez que "Enable Custom SMTP" est ON
- ✅ Vérifiez les credentials SMTP
- ✅ Vérifiez que le sender email est vérifié
- ✅ Testez avec le domaine de test du service

### "Email not delivered"

- ✅ Vérifiez les spams
- ✅ Vérifiez les DNS records du domaine
- ✅ Attendez 5-10 minutes (propagation DNS)
- ✅ Vérifiez les logs dans le dashboard du service SMTP

### "SMTP authentication failed"

- ✅ Utilisez "apikey" comme username pour SendGrid
- ✅ Utilisez "resend" comme username pour Resend
- ✅ Vérifiez que l'API Key n'a pas expiré
