/**
 * Hook métier pour gérer l'état et la logique des bons de travail
 * Extrait la logique répétée de WorkOrdersContent
 */

'use client';

import { useMemo } from 'react';
import { useFiltersWithSearch } from './useFilters';

export interface WorkOrder {
  id: string;
  title: string;
  description: string;
  status: 'DRAFT' | 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  priority: 'LOW' | 'HIGH';
  maintenanceType: 'CORRECTIVE' | 'PREVENTIVE' | 'PREDICTIVE' | 'CONDITIONAL';
  assetId: string;
  assetName: string;
  assignedToId?: string;
  assignedToName?: string;
  scheduledDate?: string;
  startedAt?: string;
  completedAt?: string;
  estimatedDuration?: number;
  actualDuration?: number;
  createdAt: string;
  updatedAt: string;
}

export interface WorkOrderStats {
  total: number;
  draft: number;
  planned: number;
  inProgress: number;
  completed: number;
  cancelled: number;
  urgent: number;
}

export type WorkOrderStatusFilter = 'ALL' | WorkOrder['status'];
export type WorkOrderPriorityFilter = 'ALL' | WorkOrder['priority'];
export type WorkOrderTypeFilter = 'ALL' | WorkOrder['maintenanceType'];

export interface UseWorkOrdersOptions {
  initialStatusFilter?: WorkOrderStatusFilter;
  initialPriorityFilter?: WorkOrderPriorityFilter;
  initialTypeFilter?: WorkOrderTypeFilter;
  initialTechnicianFilter?: string;
}

export interface UseWorkOrdersReturn {
  // Data
  workOrders: WorkOrder[];
  allWorkOrders: WorkOrder[];
  
  // Search
  query: string;
  setQuery: (query: string) => void;
  clearSearch: () => void;
  
  // Filters
  filters: {
    status: WorkOrderStatusFilter;
    priority: WorkOrderPriorityFilter;
    type: WorkOrderTypeFilter;
    technician?: string;
  };
  updateFilter: (key: string, value: any) => void;
  resetFilters: () => void;
  
  // Stats
  stats: WorkOrderStats;
  
  // Computed
  hasUrgentOrders: boolean;
  activeFiltersCount: number;
}

/**
 * Calcule les statistiques des bons de travail
 */
function calculateStats(workOrders: WorkOrder[]): WorkOrderStats {
  return {
    total: workOrders.length,
    draft: workOrders.filter((wo) => wo.status === 'DRAFT').length,
    planned: workOrders.filter((wo) => wo.status === 'PLANNED').length,
    inProgress: workOrders.filter((wo) => wo.status === 'IN_PROGRESS').length,
    completed: workOrders.filter((wo) => wo.status === 'COMPLETED').length,
    cancelled: workOrders.filter((wo) => wo.status === 'CANCELLED').length,
    urgent: workOrders.filter((wo) => wo.priority === 'HIGH').length,
  };
}

/**
 * Hook pour gérer l'état et la logique des bons de travail
 * 
 * @example
 * const {
 *   workOrders,
 *   query,
 *   setQuery,
 *   filters,
 *   updateFilter,
 *   stats,
 *   hasUrgentOrders
 * } = useWorkOrders(initialWorkOrders, {
 *   initialStatusFilter: 'ALL',
 *   initialPriorityFilter: 'ALL'
 * });
 * 
 * <SearchInput 
 *   value={query} 
 *   onChange={setQuery} 
 *   placeholder="Rechercher..." 
 * />
 * 
 * <Select 
 *   value={filters.status} 
 *   onChange={(e) => updateFilter('status', e.target.value)}
 * >
 *   <option value="ALL">Tous ({stats.total})</option>
 *   <option value="PLANNED">Planifiés ({stats.planned})</option>
 * </Select>
 */
export function useWorkOrders(
  initialWorkOrders: WorkOrder[],
  options: UseWorkOrdersOptions = {}
): UseWorkOrdersReturn {
  const {
    initialStatusFilter = 'ALL',
    initialPriorityFilter = 'ALL',
    initialTypeFilter = 'ALL',
    initialTechnicianFilter = 'ALL',
  } = options;

  // Custom matcher for "ALL" values
  const customMatchers = {
    status: (item: WorkOrder, value: any) => value === 'ALL' || item.status === value,
    priority: (item: WorkOrder, value: any) => value === 'ALL' || item.priority === value,
    type: (item: WorkOrder, value: any) => value === 'ALL' || item.maintenanceType === value,
    technician: (item: WorkOrder, value: any) => value === 'ALL' || item.assignedToId === value,
  };

  // Use filters with search
  const {
    filteredItems,
    query,
    setQuery,
    clearSearch,
    filters,
    updateFilter,
    resetFilters,
    activeFiltersCount,
  } = useFiltersWithSearch(initialWorkOrders, {
    initialFilters: {
      status: initialStatusFilter,
      priority: initialPriorityFilter,
      type: initialTypeFilter,
      technician: initialTechnicianFilter,
    },
    searchKeys: ['title', 'description', 'assetName'],
    customMatchers,
  });

  // Calculate stats on all work orders (not filtered)
  const stats = useMemo(() => calculateStats(initialWorkOrders), [initialWorkOrders]);

  // Computed values
  const hasUrgentOrders = useMemo(
    () => stats.urgent > 0,
    [stats.urgent]
  );

  return {
    workOrders: filteredItems,
    allWorkOrders: initialWorkOrders,
    query,
    setQuery,
    clearSearch,
    filters: filters as {
      status: WorkOrderStatusFilter;
      priority: WorkOrderPriorityFilter;
      type: WorkOrderTypeFilter;
      technician?: string;
    },
    updateFilter,
    resetFilters,
    stats,
    hasUrgentOrders,
    activeFiltersCount,
  };
}

/**
 * Hook pour filtrer les bons de travail par technicien
 */
export function useWorkOrdersByTechnician(
  workOrders: WorkOrder[],
  technicianId: string
) {
  const technicianWorkOrders = useMemo(
    () => workOrders.filter((wo) => wo.assignedToId === technicianId),
    [workOrders, technicianId]
  );

  const activeWorkOrders = useMemo(
    () => technicianWorkOrders.filter((wo) => 
      wo.status === 'PLANNED' || wo.status === 'IN_PROGRESS'
    ),
    [technicianWorkOrders]
  );

  return {
    workOrders: technicianWorkOrders,
    count: technicianWorkOrders.length,
    activeWorkOrders,
    activeCount: activeWorkOrders.length,
  };
}

/**
 * Hook pour filtrer les bons de travail urgents
 */
export function useUrgentWorkOrders(workOrders: WorkOrder[]) {
  const urgentOrders = useMemo(
    () => workOrders.filter((wo) => 
      wo.priority === 'HIGH' && 
      (wo.status === 'PLANNED' || wo.status === 'IN_PROGRESS')
    ),
    [workOrders]
  );

  return {
    workOrders: urgentOrders,
    count: urgentOrders.length,
    hasUrgent: urgentOrders.length > 0,
  };
}

/**
 * Configuration des statuts pour affichage
 */
export const WORK_ORDER_STATUS_CONFIG = {
  DRAFT: { label: 'Brouillon', variant: 'neutral' as const },
  PLANNED: { label: 'Planifiée', variant: 'primary' as const },
  IN_PROGRESS: { label: 'En cours', variant: 'warning' as const },
  COMPLETED: { label: 'Terminée', variant: 'success' as const },
  CANCELLED: { label: 'Annulée', variant: 'danger' as const },
} as const;

/**
 * Configuration des priorités pour affichage
 */
export const WORK_ORDER_PRIORITY_CONFIG = {
  LOW: { label: 'Normale', variant: 'neutral' as const },
  HIGH: { label: 'Urgente', variant: 'danger' as const },
} as const;

/**
 * Configuration des types de maintenance pour affichage
 */
export const WORK_ORDER_TYPE_CONFIG = {
  CORRECTIVE: { 
    label: 'Corrective', 
    icon: '🔧', 
    variant: 'danger' as const,
    description: 'Réparation suite à panne'
  },
  PREVENTIVE: { 
    label: 'Préventive', 
    icon: '📅', 
    variant: 'success' as const,
    description: 'Maintenance planifiée'
  },
  PREDICTIVE: { 
    label: 'Prédictive', 
    icon: '📊', 
    variant: 'primary' as const,
    description: 'Basée sur analyse données'
  },
  CONDITIONAL: { 
    label: 'Conditionnelle', 
    icon: '👁️', 
    variant: 'warning' as const,
    description: 'Basée sur inspection'
  },
} as const;
