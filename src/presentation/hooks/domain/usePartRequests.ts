/**
 * Hook métier pour gérer l'état et la logique des demandes de pièces
 * Extrait la logique répétée de PartRequestsContent
 */

'use client';

import { useMemo } from 'react';
import { useFiltersWithStats } from './useFilters';

export interface PartRequest {
  id: string;
  partId: string;
  partReference: string;
  partName: string;
  quantity: number;
  requestedById: string;
  requestedByName: string;
  reason: string;
  urgency: 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'DELIVERED' | 'CANCELLED';
  workOrderId?: string;
  workOrderTitle?: string;
  assetId?: string;
  assetName?: string;
  approvedByName?: string;
  approvedAt?: string;
  rejectionReason?: string;
  deliveredAt?: string;
  createdAt: string;
}

export interface PartRequestStats {
  total: number;
  pending: number;
  approved: number;
  delivered: number;
  rejected: number;
  cancelled: number;
}

export interface UsePartRequestsOptions {
  initialStatusFilter?: string;
  initialUrgencyFilter?: string;
}

export interface UsePartRequestsReturn {
  // Data
  requests: PartRequest[];
  allRequests: PartRequest[];
  
  // Stats
  stats: PartRequestStats;
  filteredStats: PartRequestStats;
  
  // Filters
  filters: {
    status: string;
    urgency?: string;
  };
  updateFilter: (key: string, value: any) => void;
  resetFilters: () => void;
  
  // Computed
  hasPendingRequests: boolean;
  activeFiltersCount: number;
}

/**
 * Calcule les statistiques des demandes de pièces
 */
function calculateStats(requests: PartRequest[]): PartRequestStats {
  return {
    total: requests.length,
    pending: requests.filter((r) => r.status === 'PENDING').length,
    approved: requests.filter((r) => r.status === 'APPROVED').length,
    delivered: requests.filter((r) => r.status === 'DELIVERED').length,
    rejected: requests.filter((r) => r.status === 'REJECTED').length,
    cancelled: requests.filter((r) => r.status === 'CANCELLED').length,
  };
}

/**
 * Hook pour gérer l'état et la logique des demandes de pièces
 * 
 * @example
 * const {
 *   requests,
 *   stats,
 *   filters,
 *   updateFilter,
 *   hasPendingRequests
 * } = usePartRequests(initialRequests, {
 *   initialStatusFilter: 'all'
 * });
 * 
 * <Select 
 *   value={filters.status} 
 *   onChange={(e) => updateFilter('status', e.target.value)}
 * >
 *   <option value="all">Tous ({stats.total})</option>
 *   <option value="PENDING">En attente ({stats.pending})</option>
 * </Select>
 */
export function usePartRequests(
  initialRequests: PartRequest[],
  options: UsePartRequestsOptions = {}
): UsePartRequestsReturn {
  const { 
    initialStatusFilter = 'all',
    initialUrgencyFilter = 'all'
  } = options;

  // Use filters with stats
  const {
    filteredItems,
    filters,
    updateFilter,
    resetFilters,
    stats,
    filteredStats,
    activeFiltersCount,
  } = useFiltersWithStats(initialRequests, {
    initialFilters: {
      status: initialStatusFilter,
      urgency: initialUrgencyFilter,
    },
    statsCalculator: calculateStats,
  });

  // Computed values
  const hasPendingRequests = useMemo(
    () => stats.pending > 0,
    [stats.pending]
  );

  return {
    requests: filteredItems,
    allRequests: initialRequests,
    stats,
    filteredStats,
    filters: filters as { status: string; urgency?: string },
    updateFilter,
    resetFilters,
    hasPendingRequests,
    activeFiltersCount,
  };
}

/**
 * Hook pour filtrer les demandes par utilisateur
 */
export function usePartRequestsByUser(
  requests: PartRequest[],
  userId: string
) {
  const userRequests = useMemo(
    () => requests.filter((r) => r.requestedById === userId),
    [requests, userId]
  );

  return {
    requests: userRequests,
    count: userRequests.length,
    pendingCount: userRequests.filter((r) => r.status === 'PENDING').length,
  };
}

/**
 * Hook pour filtrer les demandes nécessitant une action manager
 */
export function usePendingPartRequests(requests: PartRequest[]) {
  const pendingRequests = useMemo(
    () => requests.filter((r) => r.status === 'PENDING'),
    [requests]
  );

  const urgentPendingRequests = useMemo(
    () => pendingRequests.filter((r) => r.urgency === 'HIGH' || r.urgency === 'CRITICAL'),
    [pendingRequests]
  );

  return {
    requests: pendingRequests,
    count: pendingRequests.length,
    urgentRequests: urgentPendingRequests,
    urgentCount: urgentPendingRequests.length,
    hasUrgent: urgentPendingRequests.length > 0,
  };
}

/**
 * Configuration des statuts pour affichage
 */
export const PART_REQUEST_STATUS_CONFIG = {
  PENDING: { label: 'En attente', variant: 'warning' as const },
  APPROVED: { label: 'Approuvé', variant: 'success' as const },
  REJECTED: { label: 'Refusé', variant: 'danger' as const },
  DELIVERED: { label: 'Livré', variant: 'primary' as const },
  CANCELLED: { label: 'Annulé', variant: 'neutral' as const },
} as const;

/**
 * Configuration de l'urgence pour affichage
 */
export const PART_REQUEST_URGENCY_CONFIG = {
  LOW: { label: 'Basse', color: 'text-gray-500' },
  NORMAL: { label: 'Normale', color: 'text-blue-500' },
  HIGH: { label: 'Haute', color: 'text-orange-500' },
  CRITICAL: { label: 'Critique', color: 'text-red-600 font-bold' },
} as const;
