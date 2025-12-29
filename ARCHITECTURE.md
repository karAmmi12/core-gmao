# Structure du projet CORE GMAO

Ce document décrit l'architecture et l'organisation du projet pour faciliter l'ajout de nouvelles fonctionnalités.

## 🏗️ Architecture

Le projet suit les principes de la **Clean Architecture** avec une séparation stricte en couches :

```
src/
├── core/                           # 🔵 Cœur métier (Business Logic)
│   ├── domain/                     # Couche Domain
│   │   ├── entities/              # Entités métier (Asset, WorkOrder...)
│   │   ├── repositories/          # Interfaces des repositories (contrats)
│   │   └── interfaces/            # Interfaces communes
│   ├── application/                # Couche Application
│   │   ├── use-cases/             # Cas d'utilisation métier
│   │   ├── services/              # Services d'orchestration
│   │   ├── dto/                   # Data Transfer Objects
│   │   ├── validation/            # Schémas de validation Zod
│   │   └── types/                 # Types TypeScript
│   └── infrastructure/             # Couche Infrastructure
│       ├── repositories/          # Implémentations Prisma
│       └── di/                    # Dependency Injection Container
│
├── presentation/                   # 🟢 Couche Présentation (UI)
│   ├── components/                # Composants React
│   │   ├── ui/                   # Composants atomiques (Button, Card, Input...)
│   │   ├── composite/            # Composants composites (DataTable, Tabs...)
│   │   ├── features/             # Composants métier par domaine
│   │   ├── forms/                # Composants de formulaires
│   │   ├── common/               # Composants communs (Loading, ErrorBoundary)
│   │   ├── layouts/              # Layouts (MainLayout)
│   │   └── index.ts              # Export centralisé
│   ├── views/                     # Vues de pages (composants clients)
│   │   ├── dashboard/            # DashboardContent.tsx
│   │   ├── hierarchy/            # HierarchyContent.tsx
│   │   ├── technicians/          # TechniciansContent.tsx
│   │   ├── inventory/            # InventoryContent.tsx
│   │   ├── maintenance/          # MaintenanceContent.tsx
│   │   └── reporting/            # ReportingContent.tsx
│   ├── hooks/                     # Custom React hooks
│   ├── styles/                    # Design System (design-system.ts)
│   └── contexts/                  # Contextes React
│
├── shared/                         # 🟡 Utilitaires partagés
│   └── lib/                       # Librairies (prisma.ts)
│
├── app/                            # 🔴 Next.js App Router (Routing only)
│   ├── page.tsx                   # Route Dashboard
│   ├── actions.ts                 # Server Actions
│   ├── layout.tsx                 # Layout racine
│   └── [feature]/                 # Routes par feature
│       └── page.tsx               # RSC qui charge les données
│
└── config/                         # Configuration
    └── app.config.ts              # Configuration centralisée
```

## 🎯 Principes de la Clean Architecture

### Règle de dépendance
Les dépendances pointent **vers l'intérieur** :
- `app/` → `presentation/` → `core/application/` → `core/domain/`
- `core/infrastructure/` → `core/domain/` (implémente les interfaces)

### Séparation des responsabilités
- **Domain** : Règles métier pures, aucune dépendance externe
- **Application** : Orchestration, cas d'utilisation
- **Infrastructure** : Accès aux données (Prisma)
- **Presentation** : UI React, composants
- **App** : Routing Next.js uniquement

## 📦 Ajout d'une nouvelle fonctionnalité

### Exemple : Ajouter la gestion des "Fournisseurs" (Suppliers)

#### 1. **Domain Layer** (`src/core/domain/`)

Créer l'entité :
```typescript
// src/core/domain/entities/Supplier.ts
export class Supplier {
  constructor(
    public readonly id: string,
    public name: string,
    public email: string,
    public phone: string
  ) {}

  static create(name: string, email: string, phone: string): Supplier {
    // Validation
    if (name.length < 3) {
      throw new Error("Le nom doit faire au moins 3 caractères");
    }
    return new Supplier(crypto.randomUUID(), name, email, phone);
  }
}
```

Créer l'interface du repository :
```typescript
// src/core/domain/repositories/SupplierRepository.ts
export interface SupplierRepository {
  findById(id: string): Promise<Supplier | null>;
  findAll(): Promise<Supplier[]>;
  save(supplier: Supplier): Promise<void>;
}
```

#### 2. **Application Layer** (`src/core/application/`)

Créer les Use Cases :
```typescript
// src/core/application/use-cases/CreateSupplierUseCase.ts
export class CreateSupplierUseCase {
  constructor(private supplierRepo: SupplierRepository) {}

  async execute(name: string, email: string, phone: string): Promise<void> {
    const supplier = Supplier.create(name, email, phone);
    await this.supplierRepo.save(supplier);
  }
}
```

Créer les DTOs :
```typescript
// src/core/application/dto/SupplierDTO.ts
export interface SupplierDTO {
  id: string;
  name: string;
  email: string;
  phone: string;
}
```

Créer la validation Zod :
```typescript
// src/core/application/validation/SupplierSchemas.ts
export const CreateSupplierSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  phone: z.string().min(10),
});
```

Créer le Service :
```typescript
// src/core/application/services/SupplierService.ts
export class SupplierService {
  private supplierRepo = DIContainer.getSupplierRepository();

  async getAllSuppliers(): Promise<SupplierDTO[]> {
    const suppliers = await this.supplierRepo.findAll();
    return SupplierMapper.toDTOList(suppliers);
  }
}
```

#### 3. **Infrastructure Layer** (`src/core/infrastructure/`)

Implémenter le repository :
```typescript
// src/core/infrastructure/repositories/PrismaSupplierRepository.ts
export class PrismaSupplierRepository implements SupplierRepository {
  async save(supplier: Supplier): Promise<void> {
    await prisma.supplier.create({
      data: {
        id: supplier.id,
        name: supplier.name,
        email: supplier.email,
        phone: supplier.phone,
      },
    });
  }

  async findAll(): Promise<Supplier[]> {
    const raw = await prisma.supplier.findMany();
    return raw.map(s => new Supplier(s.id, s.name, s.email, s.phone));
  }
}
```

Ajouter au DIContainer :
```typescript
// src/core/infrastructure/di/DIContainer.ts
static getSupplierRepository(): SupplierRepository {
  if (!this.supplierRepo) {
    this.supplierRepo = new PrismaSupplierRepository();
  }
  return this.supplierRepo;
}
```

#### 4. **Presentation Layer** (`src/presentation/components/`)

Créer les composants :
```typescript
// src/presentation/components/features/suppliers/SupplierTable.tsx
export const SupplierTable = ({ suppliers }: { suppliers: SupplierDTO[] }) => {
  return (
    <Card>
      <table>
        {/* Table content */}
      </table>
    </Card>
  );
};
```

#### 5. **App Layer** (`src/app/`)

Créer la page :
```typescript
// src/app/suppliers/page.tsx
export default async function SuppliersPage() {
  const service = new SupplierService();
  const suppliers = await service.getAllSuppliers();

  return (
    <MainLayout>
      <SupplierTable suppliers={suppliers} />
    </MainLayout>
  );
}
```

Créer les Server Actions :
```typescript
// src/app/actions.ts
export async function createSupplierAction(formData: FormData): Promise<ActionState> {
  const validation = CreateSupplierSchema.safeParse(rawData);
  // ...
}
```

## 🎯 Principes à respecter

### 1. **Dépendances**
- ❌ Domain ne doit **jamais** importer Application ou Infrastructure
- ❌ Application ne doit **jamais** importer Infrastructure
- ✅ Infrastructure peut importer Domain et Application
- ✅ Presentation importe uniquement Application (DTOs, Services)

### 2. **Validation**
- ✅ Validation métier dans les Entities (Domain)
- ✅ Validation des inputs dans les Schemas Zod (Application)

### 3. **Composants**
- ✅ Composants UI réutilisables dans `ui/`
- ✅ Composants métier spécifiques dans `features/`
- ✅ Toujours typer les props avec TypeScript

### 4. **Tests**
- ✅ Tester les Use Cases (logique métier)
- ✅ Tester les Entities (règles métier)
- ✅ Tester les composants critiques

## 🚀 Features Flags

Utilisez `src/config/app.config.ts` pour activer/désactiver des fonctionnalités :

```typescript
features: {
  enableNotifications: true,
  enableExport: true,
  enableSuppliers: false, // ← Nouvelle feature
}
```

## 📝 Conventions de nommage

- **Entities** : PascalCase (ex: `Asset`, `WorkOrder`)
- **Use Cases** : `{Action}{Entity}UseCase` (ex: `CreateAssetUseCase`)
- **DTOs** : `{Entity}DTO` (ex: `AssetDTO`)
- **Services** : `{Entity}Service` (ex: `AssetService`)
- **Components** : PascalCase (ex: `AssetTable`, `DashboardStats`)
- **Actions** : `{action}{Entity}Action` (ex: `createAssetAction`)

## 🔧 Outils disponibles

- **ErrorBoundary** : Gestion des erreurs React
- **Loading Skeletons** : États de chargement
- **ActionState** : Type pour les retours des Server Actions
- **DIContainer** : Injection de dépendances
- **Zod** : Validation des données

Cette architecture garantit la scalabilité et facilite l'ajout de nouvelles fonctionnalités sans casser l'existant ! 🎉
