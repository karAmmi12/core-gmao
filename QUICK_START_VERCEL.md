# 🚀 Quick Start - Déployer en 10 Minutes

## Étape 1 : Base de données PostgreSQL (2 min)

1. Aller sur **[neon.tech](https://neon.tech)** → Sign up (gratuit)
2. Créer un projet : `gmao-core-db`
3. Copier la connection string :
   ```
   postgresql://xxx:xxx@ep-xxx.neon.tech/neondb?sslmode=require
   ```

## Étape 2 : Préparer le projet (3 min)

```bash
# 1. Migrer vers PostgreSQL
# Modifier prisma/schema.prisma ligne 10-12 :
# provider = "postgresql"  (au lieu de "sqlite")

# 2. Générer un secret
openssl rand -base64 32
# Copier le résultat

# 3. Créer les tables sur Neon
export DATABASE_URL="votre-connection-string-neon"
npx prisma db push
npx prisma db seed
```

## Étape 3 : Déployer sur Vercel (5 min)

1. **Push sur GitHub**
   ```bash
   git add .
   git commit -m "Ready for Vercel"
   git push origin main
   ```

2. **Aller sur [vercel.com](https://vercel.com)**
   - Sign up avec GitHub
   - Import "core-gmao"
   - Framework: Next.js ✅

3. **Ajouter les variables d'environnement :**
   ```
   DATABASE_URL = votre-connection-string-neon
   NEXTAUTH_SECRET = votre-secret-genere
   NEXTAUTH_URL = https://core-gmao-xxx.vercel.app
   ```

4. **Deploy** → Attendre 2 minutes ⏱️

## ✅ C'est en ligne !

Ouvrir `https://core-gmao-xxx.vercel.app`

**Login :** admin@gmao.local / Admin123!

---

**Guide complet :** Voir [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
