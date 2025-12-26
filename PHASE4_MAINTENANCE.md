# Phase 4: Maintenance Préventive - Documentation

## Vue d'ensemble

Le système de maintenance préventive permet de planifier automatiquement des interventions récurrentes sur les équipements. Les maintenances sont définies par une fréquence (quotidienne, hebdomadaire, mensuelle, trimestrielle, annuelle) et génèrent automatiquement des ordres de travail lorsqu'elles arrivent à échéance.

## Architecture

### Domain Layer

#### MaintenanceSchedule Entity
**Fichier**: `src/core/domain/entities/MaintenanceSchedule.ts`

Entité métier représentant un planning de maintenance préventive.

**Propriétés principales**:
- `id`: Identifiant unique
- `assetId`: ID de l'équipement concerné
- `title`: Titre de la maintenance
- `frequency`: Fréquence (DAILY, WEEKLY, MONTHLY, QUARTERLY, YEARLY)
- `intervalValue`: Multiplicateur de fréquence (ex: 2 pour "tous les 2 mois")
- `nextDueDate`: Prochaine date d'exécution prévue
- `lastExecutedAt`: Date de dernière exécution
- `isActive`: Statut actif/inactif
- `priority`: Priorité (LOW, HIGH)

**Méthodes clés**:
- `isDue()`: Vérifie si la maintenance est en retard
- `calculateNextDueDate()`: Calcule la prochaine date basée sur la fréquence
- `markAsExecuted(executedAt)`: Marque comme exécutée et calcule la prochaine date

#### MaintenanceScheduleRepository Interface
**Fichier**: `src/core/domain/repositories/MaintenanceScheduleRepository.ts`

Interface définissant les opérations de persistance.

**Méthodes**:
- `save(schedule)`: Créer un nouveau planning
- `findById(id)`: Trouver par ID
- `findByAssetId(assetId)`: Trouver tous les plannings d'un équipement
- `findDueSchedules()`: Trouver les maintenances en retard ou à échéance
- `findAll()`: Liste complète
- `update(schedule)`: Mettre à jour
- `delete(id)`: Supprimer

### Infrastructure Layer

#### PrismaMaintenanceScheduleRepository
**Fichier**: `src/core/infrastructure/repositories/PrismaMaintenanceScheduleRepository.ts`

Implémentation Prisma du repository.

**Points clés**:
- Conversion entre modèle Prisma et entité domain
- Utilise `restore()` pour hydrater les entités depuis la DB
- Filtre `isActive: true` et `nextDueDate <= now` pour `findDueSchedules()`

### Application Layer

#### Use Cases

**CreateMaintenanceScheduleUseCase**
**Fichier**: `src/core/application/use-cases/CreateMaintenanceScheduleUseCase.ts`

Créer un nouveau planning de maintenance.

**Étapes**:
1. Vérifier que l'équipement existe
2. Créer l'entité MaintenanceSchedule via factory method
3. Sauvegarder dans le repository

**ExecuteMaintenanceScheduleUseCase**
**Fichier**: `src/core/application/use-cases/ExecuteMaintenanceScheduleUseCase.ts`

Exécuter une maintenance préventive (génère un ordre de travail).

**Étapes**:
1. Trouver le planning par ID
2. Vérifier qu'il est actif
3. Créer un WorkOrder de type PREVENTIVE avec préfixe "[Maintenance Préventive]"
4. Appeler `markAsExecuted()` sur le planning pour mettre à jour les dates
5. Sauvegarder le planning mis à jour

**GetDueMaintenanceSchedulesUseCase**
**Fichier**: `src/core/application/use-cases/GetDueMaintenanceSchedulesUseCase.ts`

Récupérer toutes les maintenances en retard.

#### Service Layer

**MaintenanceScheduleService**
**Fichier**: `src/core/application/services/MaintenanceScheduleService.ts`

Service orchestrant la logique métier et enrichissant les DTOs.

**Méthodes**:
- `getScheduleById(id)`: Récupère un planning avec nom d'équipement et technicien
- `getSchedulesByAssetId(assetId)`: Liste pour un équipement
- `getAllSchedules()`: Liste complète enrichie
- `getDueSchedules()`: Maintenances en retard avec données enrichies

#### DTOs

**MaintenanceScheduleDTO**
**Fichier**: `src/core/application/dto/MaintenanceScheduleDTO.ts`

DTO pour les Client Components.

**Champs supplémentaires**:
- `assetName`: Nom de l'équipement (jointure)
- `assignedToName`: Nom du technicien assigné (jointure)
- `isDue`: Booléen calculé par l'entité

**MaintenanceScheduleMapper**: Conversion entity → DTO avec dates ISO

#### Validation

**MaintenanceScheduleSchemas**
**Fichier**: `src/core/application/validation/MaintenanceScheduleSchemas.ts`

Schémas Zod pour validation.

**MaintenanceScheduleCreateSchema**:
- `assetId`: required
- `title`: required, max 200 caractères
- `frequency`: enum (DAILY, WEEKLY, MONTHLY, QUARTERLY, YEARLY)
- `intervalValue`: entier 1-100
- `nextDueDate`: date
- `estimatedDuration`: nombre positif optionnel
- `assignedToId`: optionnel
- `priority`: LOW|HIGH, défaut LOW

**MaintenanceScheduleUpdateSchema**: Tous les champs optionnels

### Presentation Layer

#### Pages

**Liste des Plannings**
**Fichier**: `src/app/maintenance/page.tsx`

- Affiche tous les plannings de maintenance
- Badges: En retard (rouge), Actif (vert), Inactif (gris), Priorité
- Bouton "Exécuter" pour les maintenances en retard
- Bouton "Modifier" pour éditer
- Lien vers formulaire de création

**Création de Planning**
**Fichier**: `src/app/maintenance/new/page.tsx`

- Formulaire de création
- Sélecteurs d'équipement, technicien, fréquence, priorité
- Input interval avec aide contextuelle

#### Components

**MaintenanceScheduleForm**
**Fichier**: `src/presentation/components/features/forms/MaintenanceScheduleForm.tsx`

Formulaire client component avec:
- useActionState pour gestion de l'état
- Redirection automatique après succès
- Validation côté serveur via action
- Sélecteurs: équipement, fréquence, intervalle, date, technicien, priorité

**DashboardMaintenanceDue**
**Fichier**: `src/presentation/components/features/dashboard/DashboardMaintenanceDue.tsx`

Widget dashboard affichant:
- Nombre de maintenances en retard (badge rouge)
- Liste des 3 premières maintenances en retard
- Badges de priorité haute
- Liens vers équipements et page complète

### Server Actions

**Fichier**: `src/app/actions.ts`

**createMaintenanceScheduleAction**:
- Parse formData
- Valide avec MaintenanceScheduleCreateSchema
- Crée via CreateMaintenanceScheduleUseCase
- Revalide `/maintenance`

**executeMaintenanceScheduleAction**:
- Exécute via ExecuteMaintenanceScheduleUseCase
- Revalide `/maintenance` et `/` (dashboard)

### Database Schema

**Modèle**: `MaintenanceSchedule`
**Fichier**: `prisma/schema.prisma`

```prisma
model MaintenanceSchedule {
  id                String    @id
  assetId           String
  asset             Asset     @relation(fields: [assetId], references: [id])
  title             String
  description       String?
  frequency         String    // DAILY, WEEKLY, MONTHLY, QUARTERLY, YEARLY
  intervalValue     Int       @default(1)
  lastExecutedAt    DateTime?
  nextDueDate       DateTime
  estimatedDuration Float?
  assignedToId      String?
  assignedTo        Technician? @relation(fields: [assignedToId], references: [id])
  isActive          Boolean   @default(true)
  priority          String    @default("LOW") // LOW, HIGH
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  @@index([assetId])
  @@index([nextDueDate])
  @@index([isActive])
}
```

**Migration**: `20251226162739_add_maintenance_schedule`

**Relations**:
- `Asset.maintenanceSchedules`: Relation 1-N
- `Technician.maintenanceSchedules`: Relation 1-N optionnelle

### Dependency Injection

**DIContainer**
**Fichier**: `src/core/infrastructure/di/DIContainer.ts`

Ajouts:
- `getMaintenanceScheduleRepository()`: Retourne PrismaMaintenanceScheduleRepository
- `getMaintenanceScheduleService()`: Instancie avec repositories nécessaires
- `reset()`: Inclut les nouveaux singletons

## Utilisation

### Créer un planning de maintenance

1. Aller sur `/maintenance`
2. Cliquer "Nouveau planning"
3. Remplir le formulaire:
   - Sélectionner équipement
   - Titre descriptif (ex: "Vérification mensuelle des filtres")
   - Fréquence (ex: MONTHLY) + Intervalle (ex: 1)
   - Date de première exécution
   - Optionnel: technicien, durée estimée, priorité
4. Soumettre → redirection vers liste

### Exécuter une maintenance en retard

**Option 1**: Dashboard
- Widget "Maintenance en retard" affiche les maintenances à échéance
- Cliquer sur un planning pour voir détails

**Option 2**: Page Maintenance
- Les plannings en retard ont badge rouge "En retard"
- Bouton "Exécuter" visible
- Clique → crée WorkOrder automatiquement
- Date suivante recalculée selon fréquence

### Workflow d'exécution automatique

L'exécution crée:
1. **WorkOrder** avec:
   - Type: PREVENTIVE
   - Titre: "[Maintenance Préventive] {titre du planning}"
   - Description du planning
   - Priorité du planning
   - Technicien assigné du planning
   - Durée estimée du planning
   - Status: PENDING

2. **Mise à jour du planning**:
   - `lastExecutedAt` = date d'exécution
   - `nextDueDate` = calculée par `calculateNextDueDate()`
   - Ex: Fréquence MONTHLY, interval 2 → +2 mois

### Calcul des prochaines dates

Logique dans `MaintenanceSchedule.calculateNextDueDate()`:

- **DAILY**: `+intervalValue` jours
- **WEEKLY**: `+intervalValue * 7` jours
- **MONTHLY**: `+intervalValue` mois
- **QUARTERLY**: `+intervalValue * 3` mois
- **YEARLY**: `+intervalValue` années

Base de calcul:
- Si `lastExecutedAt` existe → depuis cette date
- Sinon → depuis `nextDueDate` actuelle

## Intégration Dashboard

Le dashboard affiche maintenant:
1. Widget **DashboardMaintenanceDue** remplace DashboardPendingOrders
2. Affiche toutes les maintenances où `nextDueDate <= NOW` et `isActive = true`
3. Badge avec compteur rouge
4. Lien "Voir tout" vers `/maintenance`

## Points d'extension futurs

### Tâche planifiée automatique (Phase 5)
Créer un job cron ou API route `/api/maintenance/check-due` qui:
1. Appelle `GetDueMaintenanceSchedulesUseCase`
2. Pour chaque planning retourné, appelle `ExecuteMaintenanceScheduleUseCase`
3. Envoie notifications aux techniciens assignés
4. Exécution quotidienne à minuit

**Exemple** (Next.js Route Handler):
```typescript
// src/app/api/maintenance/check-due/route.ts
export async function POST(request: Request) {
  // Vérifier token d'authentification
  const getDueUseCase = new GetDueMaintenanceSchedulesUseCase(/*...*/);
  const executeUseCase = new ExecuteMaintenanceScheduleUseCase(/*...*/);
  
  const dueSchedules = await getDueUseCase.execute();
  
  for (const schedule of dueSchedules) {
    await executeUseCase.execute(schedule.id);
  }
  
  return Response.json({ created: dueSchedules.length });
}
```

Trigger via **cron job externe** (GitHub Actions, Vercel Cron, etc.)

### Notifications
- Envoyer email/SMS au technicien assigné
- Alertes 24h avant échéance
- Résumé hebdomadaire des maintenances à venir

### Historique d'exécution
- Table `MaintenanceExecution` liée à `MaintenanceSchedule` et `WorkOrder`
- Suivi des délais (en avance/en retard)
- Statistiques de conformité

### Templates de maintenance
- Créer des modèles réutilisables
- Inclure checklist de tâches
- Pièces requises par défaut

## Tests recommandés

### Unit Tests
- `MaintenanceSchedule.calculateNextDueDate()` pour chaque fréquence
- `MaintenanceSchedule.isDue()` avec différentes dates
- `MaintenanceScheduleMapper.toDTO()` avec/sans relations

### Integration Tests
- CreateMaintenanceScheduleUseCase avec équipement inexistant
- ExecuteMaintenanceScheduleUseCase crée bien un WorkOrder
- Vérifier que nextDueDate est recalculée après exécution

### E2E Tests
- Créer planning → vérifier en DB
- Exécuter maintenance → vérifier WorkOrder créé
- Dashboard affiche maintenances en retard

## Exemples d'utilisation

### Exemple 1: Maintenance quotidienne
```typescript
{
  assetId: "compressor-001",
  title: "Vérification pression d'air",
  frequency: "DAILY",
  intervalValue: 1,
  nextDueDate: new Date("2024-01-15"),
  priority: "HIGH"
}
// Après exécution le 15/01:
// nextDueDate = 16/01/2024
```

### Exemple 2: Maintenance tous les 3 mois
```typescript
{
  assetId: "hvac-002",
  title: "Changement des filtres HVAC",
  frequency: "MONTHLY",
  intervalValue: 3,
  nextDueDate: new Date("2024-01-01"),
  estimatedDuration: 2.5,
  assignedToId: "tech-123"
}
// Après exécution le 01/01:
// nextDueDate = 01/04/2024
```

### Exemple 3: Maintenance annuelle
```typescript
{
  assetId: "generator-001",
  title: "Révision complète génératrice",
  frequency: "YEARLY",
  intervalValue: 1,
  nextDueDate: new Date("2024-06-01"),
  priority: "HIGH",
  estimatedDuration: 8
}
// Après exécution:
// nextDueDate = 01/06/2025
```

## Navigation

Le menu principal inclut maintenant:
- **Tableau de bord**: Vue d'ensemble + widget maintenances en retard
- **Hiérarchie**: Arbre des équipements
- **Techniciens**: Gestion techniciens
- **Inventaire**: Gestion pièces et stock
- **Maintenance**: Gestion plannings préventifs ← NOUVEAU
- **Historique**: (à venir)

## Conclusion

Le système de maintenance préventive est maintenant **fonctionnel** avec:
✅ Plannings récurrents configurables
✅ Calcul automatique des prochaines dates
✅ Génération d'ordres de travail à l'exécution
✅ Interface de gestion complète
✅ Widget dashboard pour alertes
✅ Architecture Clean avec séparation des couches

**Prochaines étapes suggérées**:
1. Implémenter le job cron automatique
2. Ajouter système de notifications
3. Créer page d'édition de planning
4. Historique et statistiques d'exécution
