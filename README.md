# Core GMAO 🏭

Application web de gestion de maintenance assistée par ordinateur (GMAO) construite avec Next.js 16, TypeScript et Clean Architecture. Intègre un **assistant IA conversationnel** alimenté par Groq (Llama 3.3) pour faciliter l'accès aux données.

**Demo:** [https://core-gmao.vercel.app](https://core-gmao.vercel.app)  
**Login:** `admin@gmao.local` / `Admin123!`

## 🎯 À propos

Système complet de GMAO permettant de gérer le cycle de vie de la maintenance industrielle. L'application couvre la gestion des équipements, des interventions, du stock de pièces détachées et de la planification préventive avec un système de permissions basé sur les rôles.

### 🤖 Nouveauté : Assistant IA

L'application intègre un assistant conversationnel intelligent qui permet aux utilisateurs d'interagir en langage naturel pour :
- Consulter l'état des équipements ("Montre-moi les machines en panne")
- Rechercher des interventions ("Liste les ordres assignés à Jean Dupont")
- Obtenir des statistiques en temps réel
- Créer des ordres de travail par simple conversation

L'IA comprend +30 synonymes français et utilise un système de mapping intelligent pour traduire le langage naturel en requêtes précises.

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
- Stock Manager : Gestion des pièces
- Operator : Consultation et demandes
- Viewer : Lecture seule

**🤖 Assistant IA**
- Chat conv6.1.1 (App Router, Server Components, Turbopack)
- TypeScript (strict mode)
- Tailwind CSS (custom orange/amber theme)
- React 19.2.3
- Lucide React (icons)

**Backend**
- PostgreSQL (Neon) avec indexes de performance
- Prisma ORM 5.19.0
- NextAuth.js 4 (authentification JWT)
- Zod (validation)

**IA & API**
- Groq SDK 0.37.0
- Llama 3.3 70B Versatile
- Function Calling pour outils métier
- TermMappingService pour synonymes français

**Tests & Déploiement**
- Jest + React Testing Library
- Vercel (CI/CD automatique)
- Coverage reports
**Backend**
- PostgreSQL (Neon)
- Prisma ORM
- NextAuth.js (authentification)
- Zod (validation)

**Tests & Déploiement**
- Jest + React Testing Library
- Vercel (CI/CD automatique)
 (WorkOrder, Asset, User...)
│   ├── application/      # Use cases et services (TermMappingService, AI tools...)
│   └── infrastructure/   # Implémentation (Prisma, Groq, DI container)
├── presentation/         # Composants React et hooks
│   └── components/
│       ├── features/     # ChatDrawer, AssetCard, WorkOrderCard...
│       ├── ui/           # Composants réutilisables
│       └── forms/        # Formulaires avec validation
└── app/                 # Routes Next.js (API routes + pages)
```

**Patterns utilisés**
- Repository Pattern pour l'abstraction de la couche données
- Dependency Injection via container DI
- Use Cases pour la logique métier isolée (GetWorkOrdersToolUseCase, CreateWorkOrderToolUseCase...)
- Service Layer pour la logique transversale (TermMappingService, AIToolService)
- DTO pour le transfert de données entre couchesact et hooks
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
# Database (Neon PostgreSQL)
DATABASE_URL=postgresql://user:pass@host.neon.tech/dbname?sslmode=require

# NextAuth
NEXTAUTH_URL=https://votre-app.vercel.app
NEXTAUTH_SECRET=xxxxx  # Générer avec: openssl rand -base64 32

# Groq IA (gratuit: 100k tokens/jour)
GROQ_API_KEY=gsk_xxxxx  # Obtenir sur: https://console.groq.com
```

Le déploiement est automatique via GitHub. Chaque push sur la branche main déclenche un nouveau déploiement.

**⚠️ Notes importantes:**
- Groq plan gratuit : 100 000 tokens/jour (suffisant pour usage modéré)
- Neon PostgreSQL gratuit : 0.5 GB storage, 1 compute
- Vérifiez que `.env.local` est bien dans `.gitignore`
NEXTAUTH_URL=https://votre-app.vercel.app
NEXTAUTH_SECRET=xxxxx  # Générer avec: openssl rand -base64 32
```

Le déploiement es      # Serveur de développement (Turbopack)
npm run build          # Build de production (avec Prisma generate)
npm run start          # Serveur de production
npm run lint           # Linter ESLint
npm run test           # Tests Jest
npm run test:watch     # Tests en mode watch
npm run test:coverage  # Coverage report
npm run db:seed        # Populer la BD avec données de tes
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
### Core GMAO
- ✅ Gestion des équipements (Assets) avec hiérarchie
- ✅ Gestion des ordres de travail (Work Orders) avec workflow
- ✅ Dashboard avec statistiques en temps réel
- ✅ Système de permissions basé sur les rôles (6 rôles)
- ✅ Gestion de stock et pièces détachées
- ✅ Maintenance préventive avec planning
- ✅ Historique complet des interventions
- ✅ Validation des formulaires avec Zod
- ✅ AFichiers ignorés par Git** (voir `.gitignore`) :
- `.env*` (sauf `.env.example`)
- `node_modules/`
- `.next/` et `/out/`
- `prisma/*.db*` (bases SQLite locales)
- Coverage reports
- Documentation interne (PHASE*.md, etc.)

**Bonnes pratiques:**
- Utilisez `.env.local` pour le développement local
- Générez toujours un nouveau `NEXTAUTH_SECRET` en production
- Rotation régulière de `GROQ_API_KEY` si partagé
- Les clés API ne doivent jamais être committées analytics, création)
- ✅ Système de synonymes (30+ termes français)
- ✅ Gestion d'erreurs conviviale
- ✅ Recherche par nom de technicien
- ✅ Filtrage intelligent sans valeurs "ALL"
- ✅ Count system précis (affichage vs total réel)nts réutilisables
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
- ✅Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Groq API Documentation](https://console.groq.com/docs)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

## 🎨 Crédits

- Design System: Orange/Amber theme custom
- Icons: Lucide React
- Fonts: System fonts (SF Pro, Segoe UI, Roboto)
- IA Model: Meta Llama 3.3 70B via Groq

---

Développé avec ❤️ en Clean Architecture

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
