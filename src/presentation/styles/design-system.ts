/**
 * GMAO Design System - Configuration centralisée
 * Toutes les constantes, couleurs, et configurations UI
 */

// =============================================================================
// COULEURS & VARIANTS
// =============================================================================

export const colors = {
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
  },
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
  },
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
  },
  danger: {
    50: '#fef2f2',
    100: '#fee2e2',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
  },
  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
  },
} as const;

// =============================================================================
// STATUTS - Configuration centralisée pour tous les statuts
// =============================================================================

export type AssetStatus = 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE' | 'OUT_OF_SERVICE';
export type WorkOrderStatus = 'DRAFT' | 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type WorkOrderType = 'PREVENTIVE' | 'CORRECTIVE';
export type StockStatus = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
export type Frequency = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';

export const STATUS_CONFIG = {
  asset: {
    ACTIVE: { label: 'Actif', color: 'success', icon: '✓' },
    INACTIVE: { label: 'Inactif', color: 'warning', icon: '⏸' },
    MAINTENANCE: { label: 'En maintenance', color: 'primary', icon: '🔧' },
    OUT_OF_SERVICE: { label: 'Hors service', color: 'danger', icon: '✕' },
  },
  workOrder: {
    DRAFT: { label: 'Brouillon', color: 'neutral', icon: '📝' },
    PLANNED: { label: 'Planifié', color: 'primary', icon: '📅' },
    IN_PROGRESS: { label: 'En cours', color: 'warning', icon: '▶' },
    COMPLETED: { label: 'Terminé', color: 'success', icon: '✓' },
    CANCELLED: { label: 'Annulé', color: 'neutral', icon: '✕' },
  },
  priority: {
    LOW: { label: 'Basse', color: 'neutral', icon: '↓' },
    MEDIUM: { label: 'Moyenne', color: 'primary', icon: '→' },
    HIGH: { label: 'Haute', color: 'warning', icon: '↑' },
    URGENT: { label: 'Urgente', color: 'danger', icon: '🔥' },
  },
  type: {
    PREVENTIVE: { label: 'Préventif', color: 'success', icon: '🛡️' },
    CORRECTIVE: { label: 'Correctif', color: 'warning', icon: '🔧' },
  },
  stock: {
    IN_STOCK: { label: 'En stock', color: 'success' },
    LOW_STOCK: { label: 'Stock bas', color: 'warning' },
    OUT_OF_STOCK: { label: 'Rupture', color: 'danger' },
  },
  frequency: {
    DAILY: { label: 'Quotidien', short: 'Jour', color: 'danger' },
    WEEKLY: { label: 'Hebdomadaire', short: 'Sem.', color: 'warning' },
    MONTHLY: { label: 'Mensuel', short: 'Mois', color: 'primary' },
    QUARTERLY: { label: 'Trimestriel', short: 'Trim.', color: 'success' },
    YEARLY: { label: 'Annuel', short: 'An', color: 'neutral' },
  },
} as const;

// =============================================================================
// VARIANTS DE COMPOSANTS (Mobile-First)
// =============================================================================

export type ColorVariant = 'primary' | 'success' | 'warning' | 'danger' | 'neutral';
export type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export const BUTTON_STYLES = {
  base: 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.98] touch-manipulation',
  variant: {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 focus:ring-primary-500',
    secondary: 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 active:bg-neutral-300 focus:ring-neutral-400',
    success: 'bg-success-600 text-white hover:bg-success-700 active:bg-success-800 focus:ring-success-500',
    warning: 'bg-warning-500 text-white hover:bg-warning-600 active:bg-warning-700 focus:ring-warning-400',
    danger: 'bg-danger-600 text-white hover:bg-danger-700 active:bg-danger-800 focus:ring-danger-500',
    ghost: 'bg-transparent text-neutral-600 hover:bg-neutral-100 active:bg-neutral-200 focus:ring-neutral-400',
    outline: 'border-2 border-neutral-300 bg-transparent text-neutral-700 hover:bg-neutral-50 active:bg-neutral-100 focus:ring-neutral-400',
  },
  size: {
    xs: 'px-2 py-1 text-xs min-h-[28px]',
    sm: 'px-3 py-1.5 text-sm min-h-[32px]',
    md: 'px-4 py-2 text-sm min-h-[40px] sm:min-h-[36px]',
    lg: 'px-5 py-2.5 text-base min-h-[44px] sm:min-h-[40px]',
    xl: 'px-6 py-3 text-lg min-h-[52px] sm:min-h-[48px]',
  },
} as const;

export const BADGE_STYLES = {
  base: 'inline-flex items-center gap-1 font-medium rounded-full sm:font-semibold',
  variant: {
    primary: 'bg-primary-100 text-primary-700',
    success: 'bg-success-100 text-success-700',
    warning: 'bg-warning-100 text-warning-700',
    danger: 'bg-danger-100 text-danger-700',
    neutral: 'bg-neutral-100 text-neutral-600',
  },
  size: {
    xs: 'px-1.5 py-0.5 text-[10px]',
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2 py-0.5 text-xs sm:px-2.5 sm:py-1',
    lg: 'px-2.5 py-1 text-xs sm:px-3 sm:py-1.5 sm:text-sm',
  },
} as const;

export const CARD_STYLES = {
  base: 'bg-white rounded-lg border border-neutral-200 shadow-sm sm:rounded-xl',
  padding: {
    none: '',
    sm: 'p-3 sm:p-4',
    md: 'p-4 sm:p-6',
    lg: 'p-5 sm:p-8',
  },
  hover: 'hover:shadow-md active:shadow-sm transition-shadow duration-200',
} as const;

export const INPUT_STYLES = {
  base: 'w-full rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-base sm:text-sm',
  variant: {
    default: 'border-neutral-300 bg-white text-neutral-900 placeholder:text-neutral-400',
    error: 'border-danger-500 bg-danger-50 text-neutral-900 focus:ring-danger-500',
  },
  size: {
    sm: 'px-3 py-2 text-sm min-h-[36px] sm:py-1.5 sm:min-h-[32px]',
    md: 'px-3 py-2.5 text-base min-h-[44px] sm:px-4 sm:text-sm sm:min-h-[40px]',
    lg: 'px-4 py-3 text-base min-h-[48px] sm:min-h-[44px]',
  },
} as const;

// =============================================================================
// NAVIGATION & MENU
// =============================================================================

export const NAVIGATION = [
  { href: '/', label: 'Tableau de bord', icon: '📊' },
  { href: '/hierarchy', label: 'Hiérarchie', icon: '🏭' },
  { href: '/technicians', label: 'Techniciens', icon: '👷' },
  { href: '/inventory', label: 'Inventaire', icon: '📦' },
  { href: '/maintenance', label: 'Maintenance', icon: '🔧' },
  { href: '/reporting', label: 'Reporting', icon: '📈' },
] as const;

// =============================================================================
// LAYOUT PATTERNS - Patterns de mise en page réutilisables
// =============================================================================

export const LAYOUT_STYLES = {
  // Flex patterns
  flexRow: 'flex items-center gap-2',
  flexRowSm: 'flex items-center gap-1',
  flexRowLg: 'flex items-center gap-4',
  flexCol: 'flex flex-col gap-4',
  flexColSm: 'flex flex-col gap-2',
  flexBetween: 'flex items-center justify-between',
  flexBetweenStart: 'flex items-start justify-between',
  flexCenter: 'flex items-center justify-center',
  flexEnd: 'flex items-center justify-end',
  flexWrap: 'flex flex-wrap gap-2',
  
  // Responsive flex
  flexResponsive: 'flex flex-col gap-4 sm:flex-row sm:items-center',
  flexResponsiveBetween: 'flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between',
  
  // Grid patterns
  grid2: 'grid grid-cols-2 gap-4',
  grid3: 'grid grid-cols-3 gap-4',
  grid4: 'grid grid-cols-4 gap-4',
  grid5: 'grid grid-cols-5 gap-4',
  
  // Responsive grids
  gridResponsive2: 'grid grid-cols-1 sm:grid-cols-2 gap-4',
  gridResponsive3: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4',
  gridResponsive4: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4',
  gridResponsive: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4',
  
  // Spacing
  space2: 'space-y-2',
  space4: 'space-y-4',
  space6: 'space-y-6',
  space8: 'space-y-8',
  
  // Container
  container: 'mx-auto max-w-7xl px-4 sm:px-6 lg:px-8',
  containerNarrow: 'mx-auto max-w-4xl px-4 sm:px-6',
  containerWide: 'mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8',
} as const;

// =============================================================================
// CATÉGORIES & OPTIONS
// =============================================================================

export const ASSET_TYPES = [
  { value: 'SITE', label: 'Site', icon: '🏢' },
  { value: 'BUILDING', label: 'Bâtiment', icon: '🏗️' },
  { value: 'LINE', label: 'Ligne', icon: '🔗' },
  { value: 'MACHINE', label: 'Machine', icon: '⚙️' },
  { value: 'COMPONENT', label: 'Composant', icon: '🔩' },
] as const;

export const PART_CATEGORIES = [
  { value: 'FILTRES', label: 'Filtres' },
  { value: 'JOINTS', label: 'Joints' },
  { value: 'ROULEMENTS', label: 'Roulements' },
  { value: 'COURROIES', label: 'Courroies' },
  { value: 'LUBRIFIANTS', label: 'Lubrifiants' },
  { value: 'VISSERIE', label: 'Visserie' },
  { value: 'ELECTRICITE', label: 'Électricité' },
  { value: 'HYDRAULIQUE', label: 'Hydraulique' },
  { value: 'PNEUMATIQUE', label: 'Pneumatique' },
  { value: 'AUTRE', label: 'Autre' },
] as const;

export const TECHNICIAN_SKILLS = [
  'Mécanique',
  'Électricité',
  'Hydraulique',
  'Pneumatique',
  'Automatisme',
  'Soudure',
  'Usinage',
  'Informatique industrielle',
] as const;

// =============================================================================
// FORMATAGE & HELPERS
// =============================================================================

export const formatDate = (date: Date | string | null, options?: Intl.DateTimeFormatOptions) => {
  if (!date) return '-';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('fr-FR', options || { day: '2-digit', month: 'short', year: 'numeric' });
};

export const formatDateTime = (date: Date | string | null) => {
  if (!date) return '-';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value);
};

export const formatNumber = (value: number) => {
  return new Intl.NumberFormat('fr-FR').format(value);
};

export const getStockStatus = (current: number, min: number): StockStatus => {
  if (current === 0) return 'OUT_OF_STOCK';
  if (current <= min) return 'LOW_STOCK';
  return 'IN_STOCK';
};

export const getStatusConfig = <T extends keyof typeof STATUS_CONFIG>(
  type: T,
  status: keyof typeof STATUS_CONFIG[T]
) => {
  return STATUS_CONFIG[type][status];
};

// =============================================================================
// CLASSES UTILITAIRES
// =============================================================================

export const cn = (...classes: (string | boolean | undefined | null)[]) => {
  return classes.filter(Boolean).join(' ');
};
