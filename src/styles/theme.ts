/**
 * Thème centralisé pour l'application GMAO
 * Contient toutes les constantes de style réutilisables
 */

// Classes de variants pour les composants
export const buttonVariants = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  success: 'btn-success',
  danger: 'btn-danger',
} as const;

export const buttonSizes = {
  sm: 'py-1.5 px-3 text-xs',
  md: 'py-2.5 px-4 text-sm',
  lg: 'py-3 px-6 text-base',
} as const;

export const badgeVariants = {
  success: 'badge-success',
  warning: 'badge-warning',
  danger: 'badge-danger',
  neutral: 'badge-neutral',
} as const;

// Configurations de status pour les assets
export const assetStatusConfig = {
  RUNNING: {
    icon: 'CheckCircle',
    label: 'Actifs',
    subtitle: 'En marche',
    cardClass: 'card-stat status-running',
    iconColor: 'text-success-600',
    labelClass: 'text-label text-status-running',
    valueClass: 'text-value text-status-value-running',
    subtitleClass: 'text-subtitle text-status-running',
    badgeClass: 'badge-success',
  },
  STOPPED: {
    icon: 'AlertCircle',
    label: 'Arrêtés',
    subtitle: 'Maintenance préventive',
    cardClass: 'card-stat status-stopped',
    iconColor: 'text-warning-600',
    labelClass: 'text-label text-status-stopped',
    valueClass: 'text-value text-status-value-stopped',
    subtitleClass: 'text-subtitle text-status-stopped',
    badgeClass: 'badge-warning',
  },
  BROKEN: {
    icon: 'Zap',
    label: 'Pannes',
    subtitle: 'Interventions urgentes',
    cardClass: 'card-stat status-broken',
    iconColor: 'text-danger-600',
    labelClass: 'text-label text-status-broken',
    valueClass: 'text-value text-status-value-broken',
    subtitleClass: 'text-subtitle text-status-broken',
    badgeClass: 'badge-danger',
  },
  TOTAL: {
    icon: 'Box',
    label: 'Total',
    subtitle: 'Équipements',
    cardClass: 'card-stat status-neutral',
    iconColor: 'text-neutral-600',
    labelClass: 'text-label text-neutral-500',
    valueClass: 'text-value text-neutral-900',
    subtitleClass: 'text-subtitle text-neutral-600',
    badgeClass: 'badge-neutral',
  },
} as const;

// Classes communes pour les layouts
export const layoutClasses = {
  page: 'container-page',
  narrowPage: 'container-narrow',
  header: 'bg-white border-b border-neutral-200 sticky top-0 z-10',
  headerContent: 'max-w-6xl mx-auto px-6 py-4 flex items-center justify-between',
  nav: 'flex gap-4 text-sm font-medium',
  main: 'pb-20',
  pageBackground: 'min-h-screen bg-neutral-50/50 font-sans text-neutral-900',
} as const;

// Classes pour les grids
export const gridClasses = {
  stats: 'grid-stats',
  table: 'grid-table',
} as const;

// Types pour TypeScript
export type ButtonVariant = keyof typeof buttonVariants;
export type ButtonSize = keyof typeof buttonSizes;
export type BadgeVariant = keyof typeof badgeVariants;
export type AssetStatus = keyof typeof assetStatusConfig;
