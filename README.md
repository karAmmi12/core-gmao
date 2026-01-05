# Core GMAO

Application web de gestion de maintenance assistée par ordinateur construite avec Next.js et TypeScript, suivant les principes de Clean Architecture.

**Demo:** [https://core-gmao.vercel.app](https://core-gmao.vercel.app)  
**Login:** `admin@gmao.local` / `Admin123!`

## À propos

Système complet de GMAO permettant de gérer le cycle de vie de la maintenance industrielle. L'application couvre la gestion des équipements, des interventions, du stock de pièces détachées et de la planification préventive avec un système de permissions basé sur les rôles.

## Fonctionnalités

**Gestion d'assets**
- Structure hiérarchique (Sites → Bâtiments → Lignes → Machines → Composants)
- Suivi de l'état et de l'historique des équipements
- Indicateurs de performance par asset

**Work orders**
- Création et assignation d'interventions
- Workflow multi-étapes (draft → pending → in progress → completed)
- Système de validation Manager
- Historique complet des interventions

**Gestion de stock**
- Catalogue de pièces détachées
- Demandes de pièces liées aux interventions
- Suivi des mouvements de stock
- Alertes de stock bas

**Maintenance préventive**
- Planification automatique basée sur la fréquence
- Notifications et rappels
- Génération d'interventions préventives

**Dashboard & Analytics**
- KPIs temps réel (assets, interventions, coûts)
- Statistiques par technicien
- Suivi des interventions en attente

**Système de rôles**
- Admin : Gestion complète du système
- Manager : Validation et supervision
- Technicien : Exécution des interventions
- Stock : Gestion des pièces

## Stack technique

**Frontend**
- Next.js 15 (App Router, Server Components)
- TypeScript (strict mode)
- Tailwind CSS
- React 19

**Backend**
- PostgreSQL (Neon)
- Prisma ORM
- NextAuth.js (authentification)
- Zod (validation)

**Tests & Déploiement**
- Jest + React Testing Library
- Vercel (CI/CD automatique)

## Architecture

Le projet suit Clean Architecture avec séparation en couches :

```
src/
├── core/
│   ├── domain/           # Entités métier et interfaces
│   ├── application/      # Use cases et services
│   └── infrastructure/   # Implémentation Prisma + DI
├── presentation/         # Composants React et hooks
└── app/                 # Routes Next.js
```

**Patterns utilisés**
- Repository Pattern pour l'abstraction de la couche données
- Dependency Injection via container DI
- DTO pour le transfert de données entre couches
- Use Cases pour la logique métier isolée

## Installation

**Prérequis**
- Node.js 18+
- PostgreSQL ou compte Neon gratuit

**Setup**

```bash
# Cloner le projet
git clone https://github.com/karAmmi12/core-gmao.git
cd core-gmao

# Installer les dépendances
npm install

# Configurer l'environnement
cp .env.example .env
# Éditer .env avec vos credentials

# Initialiser la base de données
npx prisma db push
npx tsx prisma/seed.ts

# Lancer l'application
npm run dev
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000)

**Login par défaut:** `admin@gmao.local` / `Admin123!`

## Tests

```bash
npm test              # Lancer tous les tests
npm test -- --watch   # Mode watch
npm test -- --coverage # Coverage
```

## Déploiement

L'application est déployée sur Vercel avec PostgreSQL hébergé sur Neon.

**Variables d'environnement requises:**
```env
DATABASE_URL=postgresql://...
NEXTAUTH_URL=https://votre-app.vercel.app
NEXTAUTH_SECRET=xxxxx  # Générer avec: openssl rand -base64 32
```

Le déploiement est automatique via GitHub. Chaque push sur la branche main déclenche un nouveau déploiement.

## Optimisations

Plusieurs optimisations ont été mises en place pour améliorer les performances :

- Batch loading pour éviter les problèmes N+1
- Pagination côté serveur pour les grandes listes
- Requêtes parallélisées sur le dashboard
- Index PostgreSQL sur les colonnes critiques
- Cache Next.js avec revalidation
- Transactions avec retry automatique

## 📝 Scripts disponibles

```bash
npm run dev      # Serveur de développement
npm run build    # Build de production
npm run start    # Serveur de production
npm run lint     # Linter ESLint
```

## 📁 Structure du projet

```
src/
├── core/                    # Logique métier
│   ├── domain/             # Entités et interfaces
│   ├── application/        # Use Cases et Services
│   └── infrastructure/     # Implémentations (Prisma, DI)
├── presentation/            # Composants React
│   └── components/
│       ├── ui/             # Composants réutilisables
│       ├── features/       # Composants métier
│       ├── forms/          # Formulaires
│       └── layouts/        # Layouts
├── app/                     # Next.js App Router
└── config/                  # Configuration
```

## ✨ Fonctionnalités

- ✅ Gestion des équipements (Assets)
- ✅ Gestion des ordres de travail (Work Orders)
- ✅ Dashboard avec statistiques en temps réel
- ✅ Historique des interventions
- ✅ Validation des formulaires avec Zod
- ✅ Architecture scalable et testable

## 🔒 Sécurité

⚠️ **Ne commitez jamais** :
- `.env` (contient des informations sensibles)
- `prisma/dev.db` (base de données locale)
- `node_modules/`

Ces fichiers sont déjà dans `.gitignore`.

## 🤝 Contribution

1. Forkez le projet
2. Créez une branche (`git checkout -b feature/AmazingFeature`)
3. Commitez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Pushez vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📄 Licence

MIT

## 📚 Documentation

- [Architecture détaillée](ARCHITECTURE.md)
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
