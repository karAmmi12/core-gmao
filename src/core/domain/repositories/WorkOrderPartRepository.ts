// =============================================================================
// WORK ORDER PART REPOSITORY INTERFACE
// =============================================================================

import type { WorkOrderPart, WorkOrderPartStatus } from '../entities/WorkOrderPart';

export interface WorkOrderPartFilters {
  workOrderId?: string;
  partId?: string;
  status?: WorkOrderPartStatus | WorkOrderPartStatus[];
  requestedById?: string;
}

export interface IWorkOrderPartRepository {
  /**
   * Récupère une pièce d'OT par son ID
   */
  findById(id: string): Promise<WorkOrderPart | null>;

  /**
   * Récupère toutes les pièces d'un OT
   */
  findByWorkOrderId(workOrderId: string): Promise<WorkOrderPart[]>;

  /**
   * Récupère les pièces selon des filtres
   */
  findAll(filters?: WorkOrderPartFilters): Promise<WorkOrderPart[]>;

  /**
   * Récupère les pièces en attente de réservation
   */
  findPendingReservations(): Promise<WorkOrderPart[]>;

  /**
   * Sauvegarde une pièce d'OT
   */
  save(workOrderPart: WorkOrderPart): Promise<void>;

  /**
   * Supprime une pièce d'OT
   */
  delete(id: string): Promise<void>;

  /**
   * Supprime toutes les pièces d'un OT
   */
  deleteByWorkOrderId(workOrderId: string): Promise<void>;
}
