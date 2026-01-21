# 🎨 Presentation Layer - Core GMAO

> Couche présentation organisée selon les principes Clean Architecture et Clean Code

## 📁 Structure

```
src/presentation/
├── components/          # Composants réutilisables
│   ├── ui/             # Composants atomiques (Button, Card, Input)
│   ├── composite/      # Patterns composites (PageHeader, DataTable)
│   ├── forms/          # Composants formulaires (SearchInput, FilterBar)
│   ├── domain/         # 🆕 Composants métier (part-requests, work-orders)
│   ├── features/       # Composants features spécifiques
│   ├── layouts/        # Layouts (MainLayout)
│   └── index.ts        # Export centralisé
│
├── hooks/              # Hooks personnalisés
│   ├── domain/         # 🆕 Hooks métier (usePartRequests, useWorkOrders)
│   ├── useSearch.ts    # Hook recherche
│   ├── usePagination.ts
│   └── index.ts
│
├── views/              # Pages Next.js (composition)
│   ├── part-requests/
│   ├── work-orders/
│   └── assets/
│
├── providers/          # Context providers
└── styles/             # Design system & utilities
```

## 🚀 Quick Start

### Importer les nouveaux hooks

```tsx
import { 
  useServerAction,
  useFilters,
  usePartRequests,
  useWorkOrders 
} from '@/presentation/hooks/domain';

// ou depuis l'index global
import { useServerAction } from '@/presentation/hooks';
```

### Importer les composants domain

```tsx
import {
  PartRequestCard,
  PartRequestList,
  PartRequestFilters
} from '@/presentation/components/domain/part-requests';

// ou depuis l'index global
import { PartRequestCard } from '@/components/domain';
```

### Exemple complet

```tsx
export function MyPage({ initialData }) {
  // Hook métier - gère filtres + stats
  const { requests, stats, filters, updateFilter } = usePartRequests(initialData);
  
  // Hook actions - gère loading + errors
  const { execute: approve, isPending } = useServerAction(approvePartRequest);

  return (
    <div>
      <PageHeader title="Demandes de Pièces" />
      <PartRequestStatsDisplay stats={stats} />
      <PartRequestFilters filters={filters} onFilterChange={updateFilter} />
      <PartRequestList 
        requests={requests}
        onApprove={approve}
        isPending={isPending}
      />
    </div>
  );
}
```

## 📖 Documentation

- **[FRONTEND_ARCHITECTURE.md](../../../FRONTEND_ARCHITECTURE.md)** - Guide complet architecture
- **[FRONTEND_QUICK_START.md](../../../FRONTEND_QUICK_START.md)** - Guide démarrage rapide
- **[FRONTEND_OPTIMIZATION_PLAN.md](../../../FRONTEND_OPTIMIZATION_PLAN.md)** - Plan détaillé
- **[FRONTEND_FILES_CREATED.md](../../../FRONTEND_FILES_CREATED.md)** - Liste des fichiers

## 🎯 Principes

### 1. Single Responsibility
Chaque composant/hook a **une seule responsabilité**

```tsx
// ✅ GOOD
function PartRequestCard({ request, onApprove }) { /* 60 lignes */ }
function PartRequestList({ requests }) { /* 40 lignes */ }

// ❌ BAD
function PartRequests() { /* 482 lignes - fait tout */ }
```

### 2. Composition over Props Drilling

```tsx
// ✅ GOOD - Composition
<PageHeader 
  title="Interventions"
  actions={<Button>Créer</Button>}
/>

// ❌ BAD - Props drilling
<PageHeader title="Interventions" showButton buttonText="Créer" />
```

### 3. Hooks pour la Logique

```tsx
// ✅ GOOD - Logique dans hooks
const { requests, filters, updateFilter } = usePartRequests(data);

// ❌ BAD - Logique inline
const [filters, setFilters] = useState({});
const filtered = requests.filter(r => ...);
```

## 🧩 Hiérarchie des Composants

```
UI Components (Atomic)
  ↓
Composite Components
  ↓
Domain Components
  ↓
Views (Pages)
```

### UI Components
- **Responsabilité:** Présentation pure
- **Props:** Simples et génériques
- **Exemples:** Button, Card, Input
- **Taille:** 20-80 lignes

### Composite Components
- **Responsabilité:** Patterns réutilisables
- **Props:** Configuration
- **Exemples:** PageHeader, DataTable, StatsGrid
- **Taille:** 50-150 lignes

### Domain Components
- **Responsabilité:** Logique métier spécifique
- **Props:** Entités métier + callbacks
- **Exemples:** PartRequestCard, WorkOrderList
- **Taille:** 40-160 lignes

### Views (Pages)
- **Responsabilité:** Composition
- **Utilise:** Hooks domain + Composants domain
- **Taille:** 50-150 lignes

## 🔧 Hooks Domain

### useServerAction

Gère les actions serveur avec loading et erreurs

```tsx
const { execute, isPending, error } = useServerAction(serverAction);

<Button onClick={() => execute(id)} disabled={isPending}>
  {isPending ? 'Chargement...' : 'Approuver'}
</Button>
```

### useFilters

Filtrage multi-critères générique

```tsx
const { filteredItems, filters, updateFilter } = useFilters(items, {
  initialFilters: { status: 'all' }
});
```

### usePartRequests / useWorkOrders

Logique métier spécialisée

```tsx
const { requests, stats, filters, updateFilter } = usePartRequests(data);
```

## 📦 Composants Domain

### Part Requests

- `PartRequestCard` - Carte demande individuelle
- `PartRequestList` - Grille responsive
- `PartRequestFilters` - Barre de filtrage
- `PartRequestActions` - Boutons d'action
- `PartRequestStatusBadge` - Badge statut
- `PartRequestUrgencyBadge` - Badge urgence
- `PartRequestStatsDisplay` - Statistiques

### Work Orders (À créer)

- `WorkOrderCard`
- `WorkOrderList`
- `WorkOrderFilters`
- etc.

## ✅ Guidelines

### DO

- ✅ Composants < 150 lignes
- ✅ Extraire logique dans hooks
- ✅ Props typées strictement
- ✅ Nommage explicite
- ✅ Mémoiser valeurs calculées
- ✅ Utiliser hooks domain

### DON'T

- ❌ Composants > 300 lignes
- ❌ Dupliquer logique
- ❌ `useTransition` direct
- ❌ Props non typées
- ❌ Logique inline complexe

## 🧪 Tests

### Tester les hooks

```tsx
import { renderHook } from '@testing-library/react';
import { usePartRequests } from './usePartRequests';

test('filters by status', () => {
  const { result } = renderHook(() => usePartRequests(mockData));
  
  act(() => {
    result.current.updateFilter('status', 'PENDING');
  });
  
  expect(result.current.requests).toHaveLength(5);
});
```

### Tester les composants

```tsx
import { render, screen } from '@testing-library/react';
import { PartRequestCard } from './PartRequestCard';

test('renders request info', () => {
  render(<PartRequestCard request={mockRequest} />);
  expect(screen.getByText(mockRequest.partName)).toBeInTheDocument();
});
```

## 🎓 Ressources

- [React Patterns](https://www.patterns.dev/posts/reactjs)
- [Clean Code](https://github.com/ryanmcdermott/clean-code-javascript)
- [Atomic Design](https://bradfrost.com/blog/post/atomic-web-design/)

---

**Dernière mise à jour:** Décembre 2024  
**Maintenu par:** Frontend Team
