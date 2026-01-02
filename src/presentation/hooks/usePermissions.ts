// =============================================================================
// HOOK PERMISSIONS - Gestion des permissions côté client
// =============================================================================

import { useMemo } from 'react';
import { PermissionService, type WorkOrderAction, type PartRequestAction, type WorkOrderContext, type PartRequestContext } from '@/core/domain/authorization/PermissionService';
import type { UserRole } from '@/core/domain/entities/User';

interface UsePermissionsProps {
  userRole: UserRole;
  userId: string;
}

/**
 * Hook pour vérifier les permissions côté client
 * Utilise le même PermissionService que le backend pour garantir la cohérence
 */
export function usePermissions({ userRole, userId }: UsePermissionsProps) {
  
  // Permissions pour les demandes de pièces
  const partRequestPermissions = useMemo(() => ({
    canCreate: PermissionService.canPerformPartRequestAction(userRole, userId, 'create'),
    canApprove: PermissionService.canPerformPartRequestAction(userRole, userId, 'approve'),
    canReject: PermissionService.canPerformPartRequestAction(userRole, userId, 'reject'),
    canDeliver: PermissionService.canPerformPartRequestAction(userRole, userId, 'deliver'),
    canReadAll: PermissionService.canPerformPartRequestAction(userRole, userId, 'read'),
    
    // Avec contexte
    canUpdate: (context: PartRequestContext) => 
      PermissionService.canPerformPartRequestAction(userRole, userId, 'update', context),
    canDelete: (context: PartRequestContext) => 
      PermissionService.canPerformPartRequestAction(userRole, userId, 'delete', context),
    canCancel: (context: PartRequestContext) => 
      PermissionService.canPerformPartRequestAction(userRole, userId, 'cancel', context),
  }), [userRole, userId]);

  // Permissions pour les interventions
  const workOrderPermissions = useMemo(() => ({
    canCreate: PermissionService.canPerformWorkOrderAction(userRole, userId, 'create'),
    canAssign: PermissionService.canPerformWorkOrderAction(userRole, userId, 'assign'),
    canRead: PermissionService.canPerformWorkOrderAction(userRole, userId, 'read'),
    canApprove: PermissionService.canPerformWorkOrderAction(userRole, userId, 'approve'),
    canReject: PermissionService.canPerformWorkOrderAction(userRole, userId, 'reject'),
    
    // Avec contexte
    canUpdate: (context: WorkOrderContext) => 
      PermissionService.canPerformWorkOrderAction(userRole, userId, 'update', context),
    canDelete: (context: WorkOrderContext) => 
      PermissionService.canPerformWorkOrderAction(userRole, userId, 'delete', context),
    canStart: (context: WorkOrderContext) => 
      PermissionService.canPerformWorkOrderAction(userRole, userId, 'start', context),
    canComplete: (context: WorkOrderContext) => 
      PermissionService.canPerformWorkOrderAction(userRole, userId, 'complete', context),
  }), [userRole, userId]);

  return {
    partRequest: partRequestPermissions,
    workOrder: workOrderPermissions,
    userRole,
    isAdmin: userRole === 'ADMIN',
    isManager: ['ADMIN', 'MANAGER'].includes(userRole),
    isStockManager: ['ADMIN', 'STOCK_MANAGER'].includes(userRole),
    isTechnician: userRole === 'TECHNICIAN',
  };
}

/**
 * Hook simplifié pour les permissions des demandes de pièces
 */
export function usePartRequestPermissions(userRole: UserRole, userId: string, requestContext?: PartRequestContext) {
  const { partRequest } = usePermissions({ userRole, userId });
  
  return {
    ...partRequest,
    // Permissions avec contexte si fourni
    ...(requestContext && {
      canUpdateThis: partRequest.canUpdate(requestContext),
      canDeleteThis: partRequest.canDelete(requestContext),
      canCancelThis: partRequest.canCancel(requestContext),
    })
  };
}

/**
 * Hook simplifié pour les permissions des interventions
 */
export function useWorkOrderPermissions(userRole: UserRole, userId: string, workOrderContext?: WorkOrderContext) {
  const { workOrder } = usePermissions({ userRole, userId });
  
  return {
    ...workOrder,
    // Permissions avec contexte si fourni
    ...(workOrderContext && {
      canUpdateThis: workOrder.canUpdate(workOrderContext),
      canDeleteThis: workOrder.canDelete(workOrderContext),
      canStartThis: workOrder.canStart(workOrderContext),
      canCompleteThis: workOrder.canComplete(workOrderContext),
    })
  };
}
