// =============================================================================
// PART REQUEST REPOSITORY INTERFACE
// =============================================================================

import type { PartRequest, PartRequestStatus, PartRequestUrgency } from '../entities/PartRequest';

export interface PartRequestFilters {
  status?: PartRequestStatus | PartRequestStatus[];
  urgency?: PartRequestUrgency | PartRequestUrgency[];
  requestedById?: string;
  partId?: string;
  workOrderId?: string;
  assetId?: string;
}

export interface IPartRequestRepository {
  /**
   * Récupère une demande par son ID
   */
  findById(id: string): Promise<PartRequest | null>;

  /**
   * Récupère toutes les demandes selon des filtres
   */
  findAll(filters?: PartRequestFilters): Promise<PartRequest[]>;

  /**
   * Récupère les demandes en attente de validation
   */
  findPending(): Promise<PartRequest[]>;

  /**
   * Récupère les demandes d'un utilisateur
   */
  findByRequestedBy(userId: string): Promise<PartRequest[]>;

  /**
   * Compte les demandes en attente
   */
  countPending(): Promise<number>;

  /**
   * Sauvegarde une demande
   */
  save(partRequest: PartRequest): Promise<void>;

  /**
   * Supprime une demande
   */
  delete(id: string): Promise<void>;
}
