# Design System GMAO - Documentation

## 📁 Structure des composants

```
src/
├── components/
│   ├── index.ts              # Export centralisé
│   ├── ui/
│   │   └── index.tsx         # Composants atomiques (Button, Badge, Card, Input...)
│   ├── composite/
│   │   └── index.tsx         # Composants composites (PageHeader, DataTable, StatCard...)
│   ├── forms/
│   │   └── index.tsx         # Composants de formulaires (Form, FormSection, SearchInput...)
│   ├── layouts/
│   │   └── MainLayout.tsx    # Layouts réutilisables
│   └── domain/
│       └── index.tsx         # Composants métier GMAO (AssetCard, WorkOrderCard...)
├── hooks/
│   └── index.ts              # Hooks personnalisés (usePagination, useSearch, useFilter...)
└── lib/
    └── design-system.ts      # Configuration centralisée (couleurs, statuts, styles)
```

## 🎨 Import simplifié

```tsx
// Un seul import pour tous les composants
import { 
  Button, 
  Card, 
  PageHeader, 
  DataTable, 
  AssetCard,
  useTable 
} from '@/components';

// Configuration et helpers
import { 
  STATUS_CONFIG, 
  formatDate, 
  formatCurrency,
  cn 
} from '@/lib/design-system';
```

## 🧱 Composants Atomiques (`ui/`)

### Button

```tsx
<Button variant="primary" size="md" loading={false} icon="➕">
  Créer
</Button>

// Variants: primary, secondary, success, warning, danger, ghost, outline
// Sizes: xs, sm, md, lg, xl
```

### Badge

```tsx
<Badge color="success" size="md">Actif</Badge>
<Badge variant="warning">En attente</Badge>

// Colors/Variants: primary, success, warning, danger, neutral
```

### StatusBadge

```tsx
// Badge automatique selon le type de statut
<StatusBadge type="asset" status="ACTIVE" />
<StatusBadge type="workOrder" status="IN_PROGRESS" />
<StatusBadge type="priority" status="HIGH" />
```

### Card

```tsx
<Card padding="md" hover>
  Contenu de la carte
</Card>

// Padding: none, sm, md, lg
```

### Input / Textarea / Select

```tsx
<Input 
  label="Nom" 
  name="name" 
  error="Ce champ est requis"
  placeholder="Entrez un nom"
/>

<Select label="Type" name="type" options={[
  { value: 'A', label: 'Option A' },
  { value: 'B', label: 'Option B' },
]} />
```

## 📦 Composants Composites (`composite/`)

### PageHeader

```tsx
<PageHeader
  title="Équipements"
  description="Gestion de la hiérarchie des équipements"
  icon="🏭"
  breadcrumbs={[
    { label: 'Accueil', href: '/' },
    { label: 'Équipements' },
  ]}
  actions={<Button>Ajouter</Button>}
/>
```

### StatsGrid & StatCard

```tsx
<StatsGrid columns={4}>
  <StatCard
    label="Total"
    value={150}
    subtitle="équipements"
    icon={<span>🏭</span>}
    color="primary"
    trend={{ value: 5.2, label: 'vs mois dernier' }}
    href="/assets"
  />
</StatsGrid>
```

### DataTable

```tsx
const columns: Column<Asset>[] = [
  { 
    key: 'name', 
    header: 'Nom',
    render: (row) => <strong>{row.name}</strong>
  },
  { 
    key: 'status', 
    header: 'Statut',
    align: 'center'
  },
];

<DataTable
  columns={columns}
  data={assets}
  keyField="id"
  onRowClick={(row) => router.push(`/assets/${row.id}`)}
  loading={isLoading}
  emptyState={{
    icon: <span>📭</span>,
    title: 'Aucun équipement',
    description: 'Créez votre premier équipement',
    action: <Button>Créer</Button>,
  }}
/>
```

### TableCard

```tsx
<TableCard
  title="Équipements"
  subtitle="150 au total"
  actions={<Button>Exporter</Button>}
>
  <DataTable ... />
</TableCard>
```

### Tabs

```tsx
<Tabs 
  tabs={[
    { id: 'overview', label: 'Vue d\'ensemble', icon: '📊' },
    { id: 'details', label: 'Détails', icon: '📋' },
  ]}
  activeTab={activeTab}
  onChange={setActiveTab}
/>
```

### Alert

```tsx
<Alert variant="success" title="Succès" onClose={() => {}}>
  L'opération a été effectuée avec succès.
</Alert>
```

### ProgressBar

```tsx
<ProgressBar value={75} max={100} color="success" showLabel />
```

### Avatar

```tsx
<Avatar name="Jean Dupont" size="lg" />
```

## 📝 Composants Formulaires (`forms/`)

### FormSection & FormRow

```tsx
<Form onSubmit={handleSubmit}>
  <FormSection title="Informations générales" description="Détails de base">
    <FormRow cols={2}>
      <Input label="Nom" name="name" required />
      <Input label="Email" name="email" type="email" />
    </FormRow>
  </FormSection>
  
  <FormActions>
    <Button variant="ghost" type="button">Annuler</Button>
    <Button type="submit">Enregistrer</Button>
  </FormActions>
</Form>
```

### SearchInput & FilterSelect

```tsx
<FiltersBar onReset={resetFilters}>
  <SearchInput 
    value={search} 
    onChange={setSearch}
    placeholder="Rechercher..."
  />
  <FilterSelect
    label="Statut"
    value={statusFilter}
    onChange={setStatusFilter}
    options={[
      { value: 'ACTIVE', label: 'Actif' },
      { value: 'INACTIVE', label: 'Inactif' },
    ]}
  />
</FiltersBar>
```

## 🏭 Composants Métier (`domain/`)

### AssetCard

```tsx
<AssetCard
  id="abc123"
  name="Machine CNC"
  type="MACHINE"
  status="ACTIVE"
  location="Atelier A"
  lastMaintenance={new Date()}
  childCount={5}
  workOrderCount={3}
  href="/assets/abc123"
/>
```

### WorkOrderCard

```tsx
<WorkOrderCard
  id="wo123"
  title="Remplacement filtre"
  status="IN_PROGRESS"
  priority="HIGH"
  type="CORRECTIVE"
  assetName="Machine CNC"
  technicianName="Jean Dupont"
  dueDate={new Date()}
  href="/work-orders/wo123"
/>
```

### TechnicianCard

```tsx
<TechnicianCard
  id="tech123"
  firstName="Jean"
  lastName="Dupont"
  email="jean@example.com"
  specialization="Mécanique"
  isAvailable={true}
  activeWorkOrders={3}
  completedWorkOrders={45}
/>
```

### PartCard

```tsx
<PartCard
  id="part123"
  name="Filtre à huile"
  reference="REF-001"
  category="FILTRES"
  quantity={5}
  minQuantity={3}
  unitPrice={25.50}
  location="Rack A-12"
/>
```

### KPIDashboard

```tsx
<KPIDashboard kpis={{
  availability: 95.5,
  mttr: 2.5,
  mtbf: 168,
  completionRate: 85,
  workOrdersCompleted: 45,
  workOrdersTotal: 53,
}} />
```

## 🪝 Hooks Personnalisés (`hooks/`)

### useTable (Tout-en-un)

```tsx
const {
  data,              // Données paginées
  searchQuery,       // Query de recherche
  setSearchQuery,    // Modifier la recherche
  filters,           // Filtres actifs
  setFilter,         // Ajouter/modifier un filtre
  clearAllFilters,   // Reset filtres
  sortState,         // État du tri
  toggleSort,        // Toggle tri sur une colonne
  currentPage,       // Page actuelle
  totalPages,        // Total pages
  goToPage,          // Aller à une page
  resetAll,          // Reset tout
} = useTable(items, {
  searchKeys: ['name', 'reference'],
  initialFilters: { status: 'ACTIVE' },
  initialSort: { key: 'name', direction: 'asc' },
  pageSize: 10,
});
```

### usePagination

```tsx
const {
  data,
  currentPage,
  totalPages,
  goToPage,
  nextPage,
  previousPage,
  hasNextPage,
  hasPreviousPage,
} = usePagination(items, { initialPageSize: 20 });
```

### useSearch

```tsx
const { 
  query, 
  setQuery, 
  filteredItems, 
  clearSearch 
} = useSearch(items, { 
  searchKeys: ['name', 'email'] 
});
```

### useFilter

```tsx
const {
  filters,
  setFilter,
  clearFilter,
  clearAllFilters,
  filteredItems,
  activeFilterCount,
} = useFilter(items);

// Usage
setFilter('status', 'ACTIVE');
clearFilter('status');
```

### useSort

```tsx
const {
  sortState,
  sortedItems,
  toggleSort,
  setSort,
  clearSort,
} = useSort(items, { key: 'name', direction: 'asc' });
```

### useLocalStorage

```tsx
const [settings, setSettings, removeSettings] = useLocalStorage('app-settings', {
  theme: 'light',
  pageSize: 10,
});
```

### useToggle / useDisclosure

```tsx
// Toggle simple
const { value, toggle, setTrue, setFalse } = useToggle(false);

// Pour modals/dialogs
const { isOpen, open, close, toggle } = useDisclosure();
```

## 🎨 Design System Config (`lib/design-system.ts`)

### Statuts prédéfinis

```ts
STATUS_CONFIG.asset.ACTIVE      // { label: 'Actif', color: 'success', icon: '✓' }
STATUS_CONFIG.workOrder.DRAFT   // { label: 'Brouillon', color: 'neutral', icon: '📝' }
STATUS_CONFIG.priority.HIGH     // { label: 'Haute', color: 'warning', icon: '↑' }
```

### Types disponibles

```ts
type AssetStatus = 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE' | 'OUT_OF_SERVICE';
type WorkOrderStatus = 'DRAFT' | 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
type WorkOrderType = 'PREVENTIVE' | 'CORRECTIVE';
type StockStatus = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
type Frequency = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
```

### Helpers

```ts
formatDate(date)        // "23 déc. 2024"
formatDateTime(date)    // "23 déc. 2024, 14:30"
formatCurrency(100)     // "100,00 €"
formatNumber(1500)      // "1 500"
cn('class1', condition && 'class2')  // Merge classes conditionnellement
```

## 🚀 Migration des pages existantes

Pour migrer une page vers le nouveau système :

1. Remplacer les imports anciens par `@/components`
2. Utiliser `MainLayout` de `@/components/layouts/MainLayout`
3. Remplacer les composants manuels par les composants du design system
4. Utiliser les hooks (`useTable`, `useFilter`, etc.) pour la gestion d'état

### Exemple de migration

**Avant:**
```tsx
import { Button } from '@/presentation/components/ui/Button';
import { MainLayout } from '@/presentation/components/layouts/MainLayout';

// HTML manuel pour les cards, tables, etc.
```

**Après:**
```tsx
import { Button, Card, DataTable, PageHeader, MainLayout } from '@/components';

// Composants pré-stylés et cohérents
```
