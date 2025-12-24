# CORE GMAO

Application de **Gestion de Maintenance Assistée par Ordinateur** construite avec **Next.js 15**, **Prisma**, et **Clean Architecture**.

## 🏗️ Architecture

Ce projet suit les principes de la **Clean Architecture** avec une séparation stricte en couches :

- **Domain** : Entités métier et règles business (Asset, WorkOrder)
- **Application** : Use Cases, Services, DTOs, Validation
- **Infrastructure** : Implémentation Prisma, Dependency Injection
- **Presentation** : Composants React, UI, Layouts

Voir [ARCHITECTURE.md](ARCHITECTURE.md) pour une documentation complète.

## 🚀 Installation

```bash
# 1. Cloner le projet
git clone https://github.com/votre-username/core-gmao.git
cd core-gmao

# 2. Installer les dépendances
npm install

# 3. Configurer les variables d'environnement
cp .env.example .env
# Éditez .env avec votre DATABASE_URL

# 4. Initialiser la base de données
npx prisma migrate dev

# 5. Lancer le serveur de développement
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) pour voir l'application.

## 🧪 Technologies

- **Next.js 15** - Framework React avec App Router et Server Actions
- **Prisma** - ORM avec Prisma Postgres
- **TypeScript** - Typage statique
- **Tailwind CSS** - Styling utility-first
- **Zod** - Validation des schémas
- **Lucide React** - Icônes
- **Clean Architecture** - Organisation du code

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
