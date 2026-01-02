'use server';

// =============================================================================
// WORK ORDER ACTIONS - Interventions avec permissions centralisées
// =============================================================================

import { revalidatePath } from 'next/cache';
import DIContainer from '@/core/infrastructure/di/DIContainer';
import type { ActionState } from '@/core/application/types/ActionState';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/shared/lib/auth';
import { PermissionService, type WorkOrderContext } from '@/core/domain/authorization/PermissionService';
import type { UserRole } from '@/core/domain/entities/User';

// =============================================================================
// UPDATE WORK ORDER - Modifier une intervention
// =============================================================================

export async function updateWorkOrderAction(
  workOrderId: string,
  formData: FormData
): Promise<ActionState> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return { success: false, error: 'Non authentifié' };
    }

    // Récupérer l'intervention pour avoir le contexte
    const workOrderRepo = DIContainer.getWorkOrderRepository();
    const workOrder = await workOrderRepo.findById(workOrderId);

    if (!workOrder) {
      return { success: false, error: 'Intervention introuvable' };
    }

    // Construire le contexte pour la vérification des permissions
    // Note: createdById n'existe pas encore dans l'entité WorkOrder
    // Pour l'instant, on utilise undefined - à implémenter plus tard
    const context: WorkOrderContext = {
      createdById: undefined, // workOrder.createdById, // À ajouter dans l'entité WorkOrder
      assignedToId: workOrder.assignedToId,
      status: workOrder.status,
    };

    // Vérification centralisée des permissions
    const canUpdate = PermissionService.canPerformWorkOrderAction(
      session.user.role as UserRole,
      session.user.id,
      'update',
      context
    );

    if (!canUpdate) {
      return {
        success: false,
        error: PermissionService.getPermissionErrorMessage('update', session.user.role as UserRole)
      };
    }

    // Mettre à jour l'intervention
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const priority = formData.get('priority') as string;

    // Logique de mise à jour ici...
    // workOrder.update({ title, description, priority });
    // await workOrderRepo.update(workOrder);

    revalidatePath('/work-orders');
    return { success: true };
  } catch (error: any) {
    console.error('Erreur modification intervention:', error);
    return { success: false, error: error.message || 'Erreur lors de la modification' };
  }
}

// =============================================================================
// DELETE WORK ORDER - Supprimer une intervention
// =============================================================================

export async function deleteWorkOrderAction(workOrderId: string): Promise<ActionState> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return { success: false, error: 'Non authentifié' };
    }

    const workOrderRepo = DIContainer.getWorkOrderRepository();
    const workOrder = await workOrderRepo.findById(workOrderId);

    if (!workOrder) {
      return { success: false, error: 'Intervention introuvable' };
    }

    const context: WorkOrderContext = {
      createdById: undefined, // workOrder.createdById, // À ajouter dans l'entité WorkOrder
      assignedToId: workOrder.assignedToId,
      status: workOrder.status,
    };

    // Vérification centralisée
    const canDelete = PermissionService.canPerformWorkOrderAction(
      session.user.role as UserRole,
      session.user.id,
      'delete',
      context
    );

    if (!canDelete) {
      return {
        success: false,
        error: PermissionService.getPermissionErrorMessage('delete', session.user.role as UserRole)
      };
    }

    // Supprimer l'intervention
    // await workOrderRepo.delete(workOrderId);

    revalidatePath('/work-orders');
    return { success: true };
  } catch (error: any) {
    console.error('Erreur suppression intervention:', error);
    return { success: false, error: error.message || 'Erreur lors de la suppression' };
  }
}

// =============================================================================
// START WORK ORDER - Démarrer une intervention
// =============================================================================

export async function startWorkOrderAction(workOrderId: string): Promise<ActionState> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return { success: false, error: 'Non authentifié' };
    }

    const workOrderRepo = DIContainer.getWorkOrderRepository();
    const workOrder = await workOrderRepo.findById(workOrderId);

    if (!workOrder) {
      return { success: false, error: 'Intervention introuvable' };
    }

    const context: WorkOrderContext = {
      createdById: undefined, // workOrder.createdById, // À ajouter dans l'entité WorkOrder
      assignedToId: workOrder.assignedToId,
      status: workOrder.status,
    };

    // Vérification centralisée
    const canStart = PermissionService.canPerformWorkOrderAction(
      session.user.role as UserRole,
      session.user.id,
      'start',
      context
    );

    if (!canStart) {
      return {
        success: false,
        error: PermissionService.getPermissionErrorMessage('start', session.user.role as UserRole)
      };
    }

    // Démarrer l'intervention
    workOrder.startWork();
    await workOrderRepo.update(workOrder);

    revalidatePath('/work-orders');
    return { success: true };
  } catch (error: any) {
    console.error('Erreur démarrage intervention:', error);
    return { success: false, error: error.message || 'Erreur lors du démarrage' };
  }
}

// =============================================================================
// ASSIGN WORK ORDER - Assigner un technicien
// =============================================================================

export async function assignWorkOrderAction(
  workOrderId: string,
  technicianId: string
): Promise<ActionState> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return { success: false, error: 'Non authentifié' };
    }

    // Vérification centralisée (pas besoin de contexte pour 'assign')
    const canAssign = PermissionService.canPerformWorkOrderAction(
      session.user.role as UserRole,
      session.user.id,
      'assign'
    );

    if (!canAssign) {
      return {
        success: false,
        error: PermissionService.getPermissionErrorMessage('assign', session.user.role as UserRole)
      };
    }

    const workOrderRepo = DIContainer.getWorkOrderRepository();
    const workOrder = await workOrderRepo.findById(workOrderId);

    if (!workOrder) {
      return { success: false, error: 'Intervention introuvable' };
    }

    // Assigner le technicien
    // workOrder.assignTo(technicianId);
    // await workOrderRepo.update(workOrder);

    revalidatePath('/work-orders');
    return { success: true };
  } catch (error: any) {
    console.error('Erreur assignation intervention:', error);
    return { success: false, error: error.message || 'Erreur lors de l\'assignation' };
  }
}

// =============================================================================
// APPROVE WORK ORDER - Approuver une intervention
// =============================================================================

export async function approveWorkOrderAction(
  workOrderId: string,
): Promise<ActionState> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return { success: false, error: 'Non authentifié' };
    }

    // Vérification des permissions
    const canApprove = PermissionService.canPerformWorkOrderAction(
      session.user.role as UserRole,
      session.user.id,
      'approve'
    );

    if (!canApprove) {
      return { 
        success: false, 
        error: PermissionService.getPermissionErrorMessage('approve', session.user.role as UserRole)
      };
    }

    // Récupérer l'intervention
    const workOrderRepo = DIContainer.getWorkOrderRepository();
    const workOrder = await workOrderRepo.findById(workOrderId);

    if (!workOrder) {
      return { success: false, error: 'Intervention introuvable' };
    }

    // Vérifier le statut
    if (workOrder.status !== 'PENDING') {
      return { 
        success: false, 
        error: 'Seules les interventions en attente peuvent être approuvées' 
      };
    }

    // Approuver l'intervention (mise à jour directe via Prisma pour l'instant)
    const prisma = (await import('@/lib/prisma')).prisma;
    await prisma.workOrder.update({
      where: { id: workOrderId },
      data: {
        status: 'APPROVED',
        approvedById: session.user.id,
        approvedAt: new Date(),
      },
    });

    revalidatePath('/work-orders');
    return { 
      success: true
    };
  } catch (error: any) {
    console.error('Erreur approbation intervention:', error);
    return { 
      success: false, 
      error: error.message || 'Erreur lors de l\'approbation' 
    };
  }
}

// =============================================================================
// REJECT WORK ORDER - Rejeter une intervention
// =============================================================================

export async function rejectWorkOrderAction(
  workOrderId: string,
  rejectionReason: string
): Promise<ActionState> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return { success: false, error: 'Non authentifié' };
    }

    // Validation
    if (!rejectionReason || rejectionReason.trim() === '') {
      return { 
        success: false, 
        error: 'Une raison de rejet est requise' 
      };
    }

    // Vérification des permissions
    const canReject = PermissionService.canPerformWorkOrderAction(
      session.user.role as UserRole,
      session.user.id,
      'reject'
    );

    if (!canReject) {
      return { 
        success: false, 
        error: PermissionService.getPermissionErrorMessage('reject', session.user.role as UserRole)
      };
    }

    // Récupérer l'intervention
    const workOrderRepo = DIContainer.getWorkOrderRepository();
    const workOrder = await workOrderRepo.findById(workOrderId);

    if (!workOrder) {
      return { success: false, error: 'Intervention introuvable' };
    }

    // Vérifier le statut
    if (workOrder.status !== 'PENDING') {
      return { 
        success: false, 
        error: 'Seules les interventions en attente peuvent être rejetées' 
      };
    }

    // Rejeter l'intervention (mise à jour directe via Prisma pour l'instant)
    const prisma = (await import('@/lib/prisma')).prisma;
    await prisma.workOrder.update({
      where: { id: workOrderId },
      data: {
        status: 'REJECTED',
        approvedById: session.user.id,
        approvedAt: new Date(),
        rejectionReason: rejectionReason.trim(),
      },
    });

    revalidatePath('/work-orders');
    return { 
      success: true
    };
  } catch (error: any) {
    console.error('Erreur rejet intervention:', error);
    return { 
      success: false, 
      error: error.message || 'Erreur lors du rejet' 
    };
  }
}
