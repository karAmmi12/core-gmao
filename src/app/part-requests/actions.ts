'use server';

// =============================================================================
// PART REQUEST ACTIONS - Demandes de pièces
// =============================================================================

import { revalidatePath } from 'next/cache';
import DIContainer from '@/core/infrastructure/di/DIContainer';
import type { PartRequestUrgency, PartRequestStatus } from '@/core/domain/entities/PartRequest';
import type { ActionState } from '@/core/application/types/ActionState';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/shared/lib/auth';
import { CreatePartRequestUseCase } from '@/core/application/use-cases/CreatePartRequestUseCase';
import { ApprovePartRequestUseCase } from '@/core/application/use-cases/ApprovePartRequestUseCase';
import { RejectPartRequestUseCase } from '@/core/application/use-cases/RejectPartRequestUseCase';
import { DeliverPartRequestUseCase } from '@/core/application/use-cases/DeliverPartRequestUseCase';
import { PermissionService } from '@/core/domain/authorization/PermissionService';
import type { UserRole } from '@/core/domain/entities/User';

// =============================================================================
// CREATE PART REQUEST - Technicien crée une demande
// =============================================================================

export async function createPartRequest(formData: FormData): Promise<ActionState> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return { success: false, error: 'Non authentifié' };
    }

    const partId = formData.get('partId') as string;
    const quantity = parseInt(formData.get('quantity') as string, 10);
    const reason = formData.get('reason') as string;
    const urgency = (formData.get('urgency') as PartRequestUrgency) || 'NORMAL';
    const workOrderId = formData.get('workOrderId') as string | null;
    const assetId = formData.get('assetId') as string | null;

    if (!partId || !quantity || !reason) {
      return { success: false, error: 'Pièce, quantité et raison sont obligatoires' };
    }

    const partRequestRepo = DIContainer.getPartRequestRepository();
    const partRepo = DIContainer.getPartRepository();
    const useCase = new CreatePartRequestUseCase(partRequestRepo, partRepo);

    const result = await useCase.execute({
      partId,
      quantity,
      requestedById: session.user.id,
      reason,
      urgency,
      workOrderId: workOrderId || undefined,
      assetId: assetId || undefined,
    });

    revalidatePath('/part-requests');
    revalidatePath('/work-orders');

    return { 
      success: true, 
      data: { id: result.id }
    };
  } catch (error: any) {
    console.error('Erreur création demande pièce:', error);
    return { success: false, error: error.message || 'Erreur lors de la création de la demande' };
  }
}

// =============================================================================
// APPROVE PART REQUEST - Manager approuve une demande
// =============================================================================

export async function approvePartRequest(id: string, notes?: string): Promise<ActionState> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return { success: false, error: 'Non authentifié' };
    }

    // Vérification centralisée des permissions
    const canApprove = PermissionService.canPerformPartRequestAction(
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

    const partRequestRepo = DIContainer.getPartRequestRepository();
    const partRepo = DIContainer.getPartRepository();
    const useCase = new ApprovePartRequestUseCase(partRequestRepo, partRepo);

    await useCase.execute({
      partRequestId: id,
      approvedById: session.user.id,
      notes,
    });

    revalidatePath('/part-requests');

    return { success: true };
  } catch (error: any) {
    console.error('Erreur approbation demande:', error);
    return { success: false, error: error.message || 'Erreur lors de l\'approbation' };
  }
}

// =============================================================================
// REJECT PART REQUEST - Manager refuse une demande
// =============================================================================

export async function rejectPartRequest(id: string, rejectionReason: string): Promise<ActionState> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return { success: false, error: 'Non authentifié' };
    }

    // Vérification centralisée des permissions
    const canReject = PermissionService.canPerformPartRequestAction(
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

    const partRequestRepo = DIContainer.getPartRequestRepository();
    const useCase = new RejectPartRequestUseCase(partRequestRepo);

    await useCase.execute({
      partRequestId: id,
      rejectedById: session.user.id,
      rejectionReason,
    });

    revalidatePath('/part-requests');

    return { success: true };
  } catch (error: any) {
    console.error('Erreur rejet demande:', error);
    return { success: false, error: error.message || 'Erreur lors du rejet' };
  }
}

// =============================================================================
// DELIVER PART REQUEST - Magasinier remet la pièce
// =============================================================================

export async function deliverPartRequest(id: string): Promise<ActionState> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return { success: false, error: 'Non authentifié' };
    }

    // Vérification centralisée des permissions
    const canDeliver = PermissionService.canPerformPartRequestAction(
      session.user.role as UserRole,
      session.user.id,
      'deliver'
    );

    if (!canDeliver) {
      return { 
        success: false, 
        error: PermissionService.getPermissionErrorMessage('deliver', session.user.role as UserRole)
      };
    }

    const partRequestRepo = DIContainer.getPartRequestRepository();
    const partRepo = DIContainer.getPartRepository();
    const stockMovementRepo = DIContainer.getStockMovementRepository();
    const useCase = new DeliverPartRequestUseCase(partRequestRepo, partRepo, stockMovementRepo);

    await useCase.execute({
      partRequestId: id,
      deliveredById: session.user.id,
    });

    revalidatePath('/part-requests');
    revalidatePath('/inventory');

    return { success: true };
  } catch (error: any) {
    console.error('Erreur livraison:', error);
    return { success: false, error: error.message || 'Erreur lors de la livraison' };
  }
}

// =============================================================================
// CANCEL PART REQUEST - Annuler sa propre demande
// =============================================================================

export async function cancelPartRequest(id: string): Promise<ActionState> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return { success: false, error: 'Non authentifié' };
    }

    const partRequestRepo = DIContainer.getPartRequestRepository();
    const partRequest = await partRequestRepo.findById(id);

    if (!partRequest) {
      return { success: false, error: 'Demande non trouvée' };
    }

    // Seul le demandeur ou un admin peut annuler
    const isOwner = partRequest.requestedById === session.user.id;
    const isAdmin = session.user.role === 'ADMIN';
    
    if (!isOwner && !isAdmin) {
      return { success: false, error: 'Vous ne pouvez annuler que vos propres demandes' };
    }

    if (!partRequest.canBeCancelled) {
      return { success: false, error: 'Cette demande ne peut plus être annulée' };
    }

    partRequest.cancel();
    await partRequestRepo.save(partRequest);

    revalidatePath('/part-requests');

    return { success: true };
  } catch (error) {
    console.error('Erreur annulation:', error);
    return { success: false, error: 'Erreur lors de l\'annulation' };
  }
}

// =============================================================================
// GET PENDING COUNT - Nombre de demandes en attente
// =============================================================================

export async function getPendingPartRequestsCount(): Promise<number> {
  try {
    const partRequestRepo = DIContainer.getPartRequestRepository();
    return await partRequestRepo.countPending();
  } catch (error) {
    console.error('Erreur comptage demandes:', error);
    return 0;
  }
}

// =============================================================================
// GET ALL PART REQUESTS - Liste des demandes
// =============================================================================

export async function getPartRequests(filters?: {
  status?: PartRequestStatus;
  myRequestsOnly?: boolean;
}): Promise<{
  requests: Array<{
    id: string;
    partId: string;
    partReference: string;
    partName: string;
    quantity: number;
    requestedById: string;
    requestedByName: string;
    reason: string;
    urgency: string;
    status: string;
    workOrderId?: string;
    workOrderTitle?: string;
    assetId?: string;
    assetName?: string;
    approvedByName?: string;
    approvedAt?: string;
    rejectionReason?: string;
    deliveredAt?: string;
    createdAt: string;
  }>;
}> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return { requests: [] };
    }

    const partRequestRepo = DIContainer.getPartRequestRepository();
    
    const filterOptions: { status?: PartRequestStatus; requestedById?: string } = {};
    
    if (filters?.status) {
      filterOptions.status = filters.status;
    }
    
    // Utiliser PermissionService pour déterminer qui peut voir quelles demandes
    // ADMIN, MANAGER et STOCK_MANAGER voient toutes les demandes
    // Les autres (TECHNICIAN, OPERATOR) ne voient que leurs propres demandes
    const canReadAll = PermissionService.canPerformPartRequestAction(
      session.user.role as UserRole,
      session.user.id,
      'read'
    );

    if (filters?.myRequestsOnly || !canReadAll) {
      filterOptions.requestedById = session.user.id;
    }

    const requests = await partRequestRepo.findAll(filterOptions);

    return {
      requests: requests.map(r => ({
        id: r.id,
        partId: r.partId,
        partReference: r.part?.reference || '',
        partName: r.part?.name || '',
        quantity: r.quantity,
        requestedById: r.requestedById,
        requestedByName: r.requestedBy?.name || '',
        reason: r.reason,
        urgency: r.urgency,
        status: r.status,
        workOrderId: r.workOrderId,
        workOrderTitle: r.workOrder?.title,
        assetId: r.assetId,
        assetName: r.asset?.name,
        approvedByName: r.approvedBy?.name,
        approvedAt: r.approvedAt?.toISOString(),
        rejectionReason: r.rejectionReason,
        deliveredAt: r.deliveredAt?.toISOString(),
        createdAt: r.createdAt.toISOString(),
      })),
    };
  } catch (error) {
    console.error('Erreur récupération demandes:', error);
    return { requests: [] };
  }
}
