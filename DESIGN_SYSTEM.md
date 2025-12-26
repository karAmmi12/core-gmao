# Guide du Système de Design - GMAO

## Vue d'ensemble

Le style de l'application a été centralisé et optimisé pour réduire la répétition des classes Tailwind et faciliter la maintenance. Le système est composé de trois éléments principaux :

## 1. Configuration Tailwind (`src/app/globals.css`)

**Note** : Avec Tailwind v4, la configuration se fait directement dans le fichier CSS via `@theme`.

### Palette de couleurs personnalisée

- **Primary** (Orange) : Couleur principale de l'application
  - `primary-50` à `primary-900` : Échelle de nuances

- **Neutral** (Gris) : Couleurs neutres pour le texte et les arrière-plans
  - `neutral-50` à `neutral-900` : Échelle de nuances

- **Success** (Vert) : États de succès
  - `success-50` à `success-900`

- **Warning** (Jaune) : États d'avertissement
  - `warning-50` à `warning-900`

- **Danger** (Rouge) : États d'erreur/danger
  - `danger-50` à `danger-900`

### Design Tokens

Les tokens sont définis dans `@theme` au début du fichier `globals.css` :

```css
@theme {
  --color-primary-600: #ea580c;
  --color-neutral-200: #e2e8f0;
  /* etc. */
}
```

## 2. Classes CSS Réutilisables (`src/app/globals.css`)

### Containers

- `.container-page` : Conteneur principal de page (max-width: 6xl)
- `.container-narrow` : Conteneur étroit (max-width: 4xl)

### Cards

- `.card-base` : Style de base pour les cartes
- `.card-stat` : Style pour les cartes de statistiques

### Buttons

- `.btn-base` : Base commune pour tous les boutons
- `.btn-primary` : Bouton principal (orange)
- `.btn-secondary` : Bouton secondaire (gris)
- `.btn-success` : Bouton de succès (vert)
- `.btn-danger` : Bouton de danger (rouge)

### Inputs

- `.input-base` : Style de base pour les champs de formulaire

### Typography

- `.text-heading` : Titres
- `.text-label` : Labels en majuscules
- `.text-value` : Valeurs numériques importantes
- `.text-subtitle` : Sous-titres

### Badges

- `.badge-base` : Base commune
- `.badge-success` : Badge vert
- `.badge-warning` : Badge jaune
- `.badge-danger` : Badge rouge
- `.badge-neutral` : Badge gris

### Links

- `.link-primary` : Lien orange (principal)
- `.link-neutral` : Lien gris (secondaire)

### Layouts

- `.grid-stats` : Grille pour les statistiques (1 col mobile, 4 cols desktop)
- `.grid-table` : Grille pour les tableaux (12 colonnes)

### Status

Classes pour les différents états des assets :

- `.status-running` : Fond vert pour équipements en marche
- `.status-stopped` : Fond jaune pour équipements arrêtés
- `.status-broken` : Fond rouge pour équipements en panne
- `.status-neutral` : Fond gris pour état neutre

Et leurs équivalents texte :
- `.text-status-running`, `.text-status-value-running`
- `.text-status-stopped`, `.text-status-value-stopped`
- `.text-status-broken`, `.text-status-value-broken`

## 3. Configuration TypeScript (`src/styles/theme.ts`)

### Exports disponibles

```typescript
// Variants de composants
export const buttonVariants = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  success: 'btn-success',
  danger: 'btn-danger',
}

export const buttonSizes = {
  sm: 'py-1.5 px-3 text-xs',
  md: 'py-2.5 px-4 text-sm',
  lg: 'py-3 px-6 text-base',
}

export const badgeVariants = { ... }

// Configuration des status d'assets
export const assetStatusConfig = {
  RUNNING: { ... },
  STOPPED: { ... },
  BROKEN: { ... },
  TOTAL: { ... },
}

// Classes de layout
export const layoutClasses = { ... }
export const gridClasses = { ... }
```

### Types TypeScript

```typescript
export type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';
export type BadgeVariant = 'success' | 'warning' | 'danger' | 'neutral';
export type AssetStatus = 'RUNNING' | 'STOPPED' | 'BROKEN' | 'TOTAL';
```

## Exemples d'utilisation

### 1. Utiliser un bouton

```tsx
import { Button } from '@/presentation/components/ui/Button';

// Avant
<button className="bg-orange-600 hover:bg-orange-500 text-white py-2.5 px-4 text-sm font-bold rounded-lg">
  Click me
</button>

// Après
<Button variant="primary" size="md">
  Click me
</Button>
```

### 2. Utiliser les couleurs du thème

```tsx
// Avant
<div className="bg-orange-50 border border-orange-200">
  <p className="text-orange-600">Message</p>
</div>

// Après
<div className="bg-primary-50 border border-primary-200">
  <p className="text-primary-600">Message</p>
</div>
```

### 3. Utiliser une carte

```tsx
// Avant
<div className="rounded-xl shadow-sm border border-slate-200 bg-white p-6">
  Content
</div>

// Après
<div className="card-base">
  Content
</div>

// Ou avec le composant
<Card>Content</Card>
```

### 4. Utiliser les status d'assets

```tsx
import { assetStatusConfig } from '@/styles/theme';

const config = assetStatusConfig.RUNNING;

<div className={config.cardClass}>
  <span className={config.labelClass}>{config.label}</span>
  <span className={config.valueClass}>{value}</span>
</div>
```

### 5. Container de page

```tsx
// Avant
<div className="max-w-6xl mx-auto px-6 py-8">
  Content
</div>

// Après
<div className="container-page">
  Content
</div>
```

## Avantages du système

✅ **Cohérence** : Les couleurs et espacements sont uniformes partout
✅ **Maintenabilité** : Changement centralisé (modifier une seule fois au lieu de 50)
✅ **Performance** : Classes réutilisées = CSS plus léger
✅ **DX** : Autocomplétion TypeScript pour les variants
✅ **Lisibilité** : Code plus court et plus expressif
✅ **Évolutivité** : Facile d'ajouter de nouveaux variants

## Règles de codage

1. **Toujours utiliser les couleurs du thème** : `primary-*`, `neutral-*`, `success-*`, etc. au lieu de `orange-*`, `slate-*`, `green-*`

2. **Utiliser les classes préfabriquées quand elles existent** : `.btn-primary` au lieu de reconstruire le style

3. **Préférer les composants UI** : `<Button>` au lieu de `<button className="...">`

4. **Utiliser les classes de layout** : `.container-page`, `.grid-stats`, etc.

5. **Pour les nouveaux patterns** : Ajouter une classe dans `globals.css` plutôt que répéter

## Migration des anciennes classes

| Ancien | Nouveau |
|--------|---------|
| `orange-*` | `primary-*` |
| `slate-*` | `neutral-*` |
| `green-*` | `success-*` |
| `yellow-*` | `warning-*` |
| `red-*` | `danger-*` |
| `max-w-6xl mx-auto px-6 py-8` | `container-page` |
| Longue chaîne de classes button | Composant `<Button>` |
| Longue chaîne de classes card | `.card-base` ou `<Card>` |

## Étendre le système

### Ajouter une nouvelle couleur

Dans `src/app/globals.css` (section `@theme`) :
```css
@theme {
  /* Couleurs info */
  --color-info-50: #...;
  --color-info-100: #...;
  --color-info-600: #...;
  /* ... */
}
```

Puis ajouter les classes dans `globals.css` :
```css
@layer components {
  .badge-info {
    @apply inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-info-100 text-info-700;
  }
}
```

Et enfin dans `theme.ts` :
```typescript
export const badgeVariants = {
  // ...
  info: 'badge-info',
}
```

### Ajouter un nouveau pattern

Dans `globals.css` :
```css
@layer components {
  .mon-nouveau-pattern {
    @apply flex items-center gap-2 p-4 rounded-lg;
  }
}
```

## Support

Pour toute question ou suggestion d'amélioration du système de design, consulter ce document ou l'équipe frontend.
