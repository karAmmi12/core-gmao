# 🚀 Guide de Déploiement - GMAO Core sur Vercel

*Date : 5 janvier 2026*

## 📋 Prérequis

- ✅ Compte GitHub avec votre projet
- ✅ Compte Vercel (gratuit)
- ✅ Compte Neon (PostgreSQL gratuit)

## 🎯 Étape 1 : Créer une Base de Données PostgreSQL (Gratuit)

### Option A : Neon (RECOMMANDÉ - Gratuit)

1. **Aller sur [neon.tech](https://neon.tech)**
2. **S'inscrire avec GitHub** (gratuit, pas de carte bancaire)
3. **Créer un projet** :
   - Nom : `gmao-core-db`
   - Région : Europe (Frankfurt ou Paris)
   - PostgreSQL version : 16

4. **Copier la connection string** :
   ```
   postgresql://username:password@ep-xxx.eu-central-1.aws.neon.tech/neondb?sslmode=require
   ```

### Option B : Vercel Postgres ($20/mois - Skip pour l'instant)

Pour plus tard si vous voulez tout sur Vercel.

## 🗄️ Étape 2 : Migrer de SQLite vers PostgreSQL

### 2.1 Modifier le schema Prisma

```bash
# Ouvrir prisma/schema.prisma
# Remplacer la datasource
```

**Avant (SQLite) :**
```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

**Après (PostgreSQL) :**
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### 2.2 Créer un .env.production local

```bash
# Créer le fichier
touch .env.production
```

**Contenu de .env.production :**
```env
# Coller votre connection string Neon ici
DATABASE_URL="postgresql://username:password@ep-xxx.eu-central-1.aws.neon.tech/neondb?sslmode=require"

# Générer un secret pour NextAuth
NEXTAUTH_SECRET="votre-secret-genere"
NEXTAUTH_URL="https://votre-app.vercel.app"
```

**Générer NEXTAUTH_SECRET :**
```bash
openssl rand -base64 32
# Copier le résultat dans .env.production
```

### 2.3 Créer les tables sur PostgreSQL

```bash
# Utiliser la nouvelle DATABASE_URL
export DATABASE_URL="votre-connection-string-neon"

# Créer les tables
npx prisma migrate deploy

# Ou si première fois
npx prisma db push

# Seed avec les données de test
npx prisma db seed
```

### 2.4 Tester localement avec PostgreSQL

```bash
# Démarrer avec la prod DB
npm run build
npm start

# Vérifier que tout fonctionne
# Se connecter avec admin@gmao.local / Admin123!
```

## 🌐 Étape 3 : Déployer sur Vercel

### 3.1 Pusher sur GitHub

```bash
# S'assurer que tout est commité
git add .
git commit -m "Prêt pour déploiement Vercel"
git push origin main
```

### 3.2 Connecter Vercel

1. **Aller sur [vercel.com](https://vercel.com)**
2. **Cliquer sur "Sign Up" → Utiliser GitHub**
3. **Cliquer sur "Add New Project"**
4. **Importer votre repo "core-gmao"**

### 3.3 Configuration du projet

**Framework Preset :** Next.js (détecté automatiquement)

**Build Settings :**
- Build Command : `prisma generate && next build`
- Output Directory : `.next` (par défaut)
- Install Command : `npm install`

**Root Directory :** `.` (racine)

### 3.4 Variables d'environnement

**Ajouter dans Vercel Dashboard → Settings → Environment Variables :**

```env
# Base de données
DATABASE_URL = postgresql://username:password@ep-xxx.neon.tech/neondb?sslmode=require

# NextAuth
NEXTAUTH_URL = https://votre-app.vercel.app
NEXTAUTH_SECRET = votre-secret-genere

# Optionnel - Node version
NODE_VERSION = 20
```

**Important :** 
- ✅ Cocher "Production", "Preview", et "Development"
- ✅ Vérifier que DATABASE_URL contient `?sslmode=require`

### 3.5 Déployer

1. **Cliquer sur "Deploy"**
2. **Attendre 2-3 minutes** ⏱️
3. **Boom ! Votre app est en ligne** 🎉

**URL par défaut :**
```
https://core-gmao-xyz.vercel.app
```

## ✅ Étape 4 : Vérification Post-Déploiement

### 4.1 Vérifier le build

```
✅ Build réussi
✅ Prisma generate OK
✅ Next.js build OK
✅ Déploiement terminé
```

### 4.2 Tester l'application

1. **Ouvrir l'URL Vercel**
2. **Tester la connexion :**
   - Email : `admin@gmao.local`
   - Password : `Admin123!`

3. **Vérifier les fonctionnalités :**
   - ✅ Dashboard charge
   - ✅ Work Orders affichés
   - ✅ Pagination fonctionne
   - ✅ Pas d'erreurs console

### 4.3 Vérifier les performances

**Ouvrir DevTools → Network :**
- ✅ TTI (Time to Interactive) < 3s
- ✅ LCP (Largest Contentful Paint) < 2.5s
- ✅ API responses < 500ms

## 🔧 Étape 5 : Domaine Personnalisé (Optionnel)

### 5.1 Ajouter un domaine

**Dans Vercel Dashboard → Settings → Domains :**

1. **Ajouter votre domaine** : `gmao.votre-entreprise.com`
2. **Configurer DNS** :
   ```
   Type: CNAME
   Name: gmao
   Value: cname.vercel-dns.com
   ```
3. **Attendre propagation** (5-30 minutes)
4. **HTTPS automatique** ✅

## 📊 Étape 6 : Monitoring (Optionnel mais recommandé)

### 6.1 Analytics Vercel (Gratuit)

**Settings → Analytics → Enable**
- ✅ Page views
- ✅ Performance metrics
- ✅ Web Vitals

### 6.2 Error Tracking avec Sentry (Gratuit)

```bash
npm install @sentry/nextjs

npx @sentry/wizard@latest -i nextjs
```

## 🚀 Workflow de Déploiement Continu

### Déploiement automatique

**Chaque fois que vous pushez :**
```bash
git add .
git commit -m "Nouvelle feature"
git push origin main
# → Vercel déploie automatiquement !
```

**Preview deployments (branches) :**
```bash
git checkout -b feature/nouvelle-fonctionnalite
git push origin feature/nouvelle-fonctionnalite
# → Vercel crée une URL de preview unique !
```

## 🐛 Troubleshooting

### Erreur : "Prisma Client not found"

**Solution :**
```json
// package.json
{
  "scripts": {
    "postinstall": "prisma generate"
  }
}
```

### Erreur : "DATABASE_URL not defined"

**Solution :**
- Vérifier les variables d'environnement dans Vercel
- Redéployer : Settings → Deployments → Redeploy

### Erreur : "SSL connection required"

**Solution :**
```env
# Ajouter ?sslmode=require à la fin
DATABASE_URL="postgresql://...?sslmode=require"
```

### Build timeout

**Solution :**
```json
// vercel.json
{
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next",
      "config": {
        "maxDuration": 60
      }
    }
  ]
}
```

## 📈 Optimisations Production

### 1. Cache des pages statiques

```typescript
// app/page.tsx
export const revalidate = 60; // Déjà fait ✅
```

### 2. Images optimisées

```typescript
// next.config.ts
images: {
  domains: ['votre-cdn.com'],
  formats: ['image/avif', 'image/webp'],
}
```

### 3. Monitoring Prisma

```typescript
// lib/prisma.ts
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query'] : [],
});
```

## 💰 Coûts Estimés

| Service | Plan | Coût |
|---------|------|------|
| **Vercel** | Hobby | **GRATUIT** ✅ |
| **Neon** | Free Tier | **GRATUIT** ✅ |
| **Total** | - | **0€/mois** 🎉 |

**Limites gratuites :**
- Vercel : 100 GB bande passante/mois
- Neon : 0.5 GB stockage, 3 GB transfer/mois
- Largement suffisant pour 50-100 utilisateurs

## 🎯 Prochaines Étapes

### Court terme
- ✅ Application en ligne
- ✅ Déploiements automatiques
- ✅ HTTPS activé

### Moyen terme
- 📊 Configurer analytics
- 🔔 Ajouter monitoring
- 🌍 Ajouter domaine personnalisé

### Long terme
- 📈 Passer à Vercel Pro si >100 utilisateurs
- 🗄️ Passer à Neon Pro si besoin plus de stockage
- 🚀 Optimisations avancées

## 📞 Support

**En cas de problème :**
1. Vérifier les logs : Vercel Dashboard → Deployments → Logs
2. Vérifier la DB : Neon Dashboard → Monitoring
3. Documentation : https://vercel.com/docs
4. Community : https://github.com/vercel/next.js/discussions

## ✅ Checklist Finale

Avant de dire "C'est en prod !" :

- [ ] Build réussi sur Vercel
- [ ] Variables d'environnement configurées
- [ ] Database migrée vers PostgreSQL
- [ ] Seed des données de test effectué
- [ ] Login fonctionne (admin@gmao.local)
- [ ] Dashboard affiche les stats
- [ ] Work Orders paginés
- [ ] Pas d'erreurs console
- [ ] Performance < 3s TTI
- [ ] HTTPS actif

**Félicitations ! Votre GMAO est en production ! 🎉**
