// =============================================================================
// PERMISSION SERVICE - Gestion centralisée des autorisations
// =============================================================================
// Ce service centralise toute la logique d'autorisation pour les interventions
// et les demandes de pièces, avec des règles métier fines basées sur le rôle
// et le contexte (ex: propriétaire de la ressource).
// =============================================================================

import type { UserRole } from '../entities/User';

// =============================================================================
// TYPES DE PERMISSIONS
// =============================================================================

export type WorkOrderAction = 
  | 'create'      // Créer une intervention
  | 'read'        // Voir une intervention
  | 'update'      // Modifier une intervention
  | 'delete'      // Supprimer une intervention
  | 'assign'      // Assigner un technicien
  | 'start'       // Démarrer les travaux
  | 'complete'    // Marquer comme terminée
  | 'approve'     // Approuver une intervention
  | 'reject';     // Rejeter une intervention

export type PartRequestAction = 
  | 'create'      // Créer une demande de pièce
  | 'read'        // Voir une demande
  | 'update'      // Modifier une demande
  | 'delete'      // Supprimer une demande
  | 'approve'     // Approuver une demande
  | 'reject'      // Rejeter une demande
  | 'deliver'     // Livrer une demande
  | 'cancel';     // Annuler une demande

// =============================================================================
// CONTEXTE DE LA RESSOURCE
// =============================================================================

export interface WorkOrderContext {
  createdById?: string;      // Qui a créé l'intervention
  assignedToId?: string;     // À qui elle est assignée
  status?: string;           // Statut actuel
}

export interface PartRequestContext {
  requestedById?: string;    // Qui a demandé la pièce
  status?: string;           // Statut actuel (PENDING, APPROVED, REJECTED, DELIVERED)
}

// =============================================================================
// SERVICE DE PERMISSIONS
// =============================================================================

export class PermissionService {
  
  // ===========================================================================
  // PERMISSIONS WORK ORDERS (Interventions)
  // ===========================================================================

  /**
   * Vérifie si un utilisateur peut effectuer une action sur une intervention
   */
  static canPerformWorkOrderAction(
    userRole: UserRole,
    userId: string,
    action: WorkOrderAction,
    context?: WorkOrderContext
  ): boolean {
    switch (action) {
      case 'create':
        // ADMIN, MANAGER, TECHNICIAN, OPERATOR peuvent créer
        return ['ADMIN', 'MANAGER', 'TECHNICIAN', 'OPERATOR'].includes(userRole);

      case 'read':
        // Tous peuvent voir (contrôle d'accès fait par le repository si nécessaire)
        return ['ADMIN', 'MANAGER', 'STOCK_MANAGER', 'TECHNICIAN', 'OPERATOR', 'VIEWER'].includes(userRole);

      case 'update':
        // ADMIN et MANAGER peuvent tout modifier
        if (['ADMIN', 'MANAGER'].includes(userRole)) return true;
        
        // TECHNICIAN peut modifier UNIQUEMENT les interventions qui lui sont assignées
        if (userRole === 'TECHNICIAN' && context) {
          return context.assignedToId === userId;
        }

        // OPERATOR ne peut PAS modifier les interventions (seulement créer)
        return false;

      case 'delete':
        // Seuls ADMIN et MANAGER peuvent supprimer/annuler des interventions
        // TECHNICIAN ne peut PAS supprimer d'interventions (même les siennes)
        return ['ADMIN', 'MANAGER'].includes(userRole);

      case 'assign':
        // Seuls ADMIN et MANAGER peuvent assigner des techniciens
        return ['ADMIN', 'MANAGER'].includes(userRole);

      case 'start':
        // ADMIN, MANAGER, et TECHNICIAN assigné peuvent démarrer
        if (['ADMIN', 'MANAGER'].includes(userRole)) return true;
        
        if (userRole === 'TECHNICIAN' && context) {
          return context.assignedToId === userId;
        }

        return false;

      case 'complete':
        // ADMIN, MANAGER peuvent toujours marquer comme terminée
        if (['ADMIN', 'MANAGER'].includes(userRole)) return true;
        
        // TECHNICIAN peut terminer SI assigné
        if (userRole === 'TECHNICIAN' && context) {
          return context.assignedToId === userId;
        }

        return false;

      case 'approve':
        // Seuls ADMIN et MANAGER peuvent approuver des interventions
        return ['ADMIN', 'MANAGER'].includes(userRole);

      case 'reject':
        // Seuls ADMIN et MANAGER peuvent rejeter des interventions
        return ['ADMIN', 'MANAGER'].includes(userRole);

      default:
        return false;
    }
  }

  // ===========================================================================
  // PERMISSIONS PART REQUESTS (Demandes de pièces)
  // ===========================================================================

  /**
   * Vérifie si un utilisateur peut effectuer une action sur une demande de pièce
   */
  static canPerformPartRequestAction(
    userRole: UserRole,
    userId: string,
    action: PartRequestAction,
    context?: PartRequestContext
  ): boolean {
    switch (action) {
      case 'create':
        // ADMIN, MANAGER, TECHNICIAN, STOCK_MANAGER peuvent créer des demandes
        return ['ADMIN', 'MANAGER', 'TECHNICIAN', 'STOCK_MANAGER'].includes(userRole);

      case 'read':
        // ADMIN, MANAGER, STOCK_MANAGER voient tout
        if (['ADMIN', 'MANAGER', 'STOCK_MANAGER'].includes(userRole)) return true;
        
        // TECHNICIAN voit ses propres demandes
        if (userRole === 'TECHNICIAN' && context) {
          return context.requestedById === userId;
        }

        return false;

      case 'update':
        // ADMIN et MANAGER peuvent tout modifier
        if (['ADMIN', 'MANAGER'].includes(userRole)) return true;
        
        // TECHNICIAN peut modifier uniquement ses propres demandes EN ATTENTE
        if (userRole === 'TECHNICIAN' && context) {
          const isOwner = context.requestedById === userId;
          const isPending = context.status === 'PENDING';
          return isOwner && isPending;
        }

        return false;

      case 'delete':
        // ADMIN et MANAGER peuvent supprimer
        if (['ADMIN', 'MANAGER'].includes(userRole)) return true;
        
        // TECHNICIAN peut supprimer ses propres demandes EN ATTENTE
        if (userRole === 'TECHNICIAN' && context) {
          const isOwner = context.requestedById === userId;
          const isPending = context.status === 'PENDING';
          return isOwner && isPending;
        }

        return false;

      case 'approve':
        // Seuls ADMIN et MANAGER peuvent approuver
        return ['ADMIN', 'MANAGER'].includes(userRole);

      case 'reject':
        // Seuls ADMIN et MANAGER peuvent rejeter
        return ['ADMIN', 'MANAGER'].includes(userRole);

      case 'deliver':
        // Seuls ADMIN et STOCK_MANAGER peuvent livrer physiquement les pièces
        // Le MANAGER valide/rejette (décision administrative) mais ne livre pas (gestion physique du stock)
        return ['ADMIN', 'STOCK_MANAGER'].includes(userRole);

      case 'cancel':
        // ADMIN et MANAGER peuvent annuler
        if (['ADMIN', 'MANAGER'].includes(userRole)) return true;
        
        // TECHNICIAN peut annuler ses propres demandes SI pas encore livrées
        if (userRole === 'TECHNICIAN' && context) {
          const isOwner = context.requestedById === userId;
          const canBeCanceled = ['PENDING', 'APPROVED'].includes(context.status || '');
          return isOwner && canBeCanceled;
        }

        return false;

      default:
        return false;
    }
  }

  // ===========================================================================
  // HELPER: Obtenir toutes les actions autorisées pour un rôle
  // ===========================================================================

  /**
   * Retourne la liste des actions qu'un rôle peut effectuer (sans contexte)
   * Utile pour l'UI : afficher/masquer des boutons selon le rôle
   */
  static getAvailableWorkOrderActions(userRole: UserRole): WorkOrderAction[] {
    const actions: WorkOrderAction[] = [];
    
    // Actions disponibles selon le rôle (sans contexte)
    const allActions: WorkOrderAction[] = ['create', 'read', 'update', 'delete', 'assign', 'start', 'complete', 'approve', 'reject'];
    
    for (const action of allActions) {
      // On teste avec un contexte vide - si ça retourne true, c'est que le rôle peut TOUJOURS faire cette action
      if (this.canPerformWorkOrderAction(userRole, '', action, undefined)) {
        actions.push(action);
      }
    }
    
    return actions;
  }

  /**
   * Retourne la liste des actions qu'un rôle peut effectuer sur les demandes de pièces
   */
  static getAvailablePartRequestActions(userRole: UserRole): PartRequestAction[] {
    const actions: PartRequestAction[] = [];
    
    const allActions: PartRequestAction[] = ['create', 'read', 'update', 'delete', 'approve', 'reject', 'deliver', 'cancel'];
    
    for (const action of allActions) {
      if (this.canPerformPartRequestAction(userRole, '', action, undefined)) {
        actions.push(action);
      }
    }
    
    return actions;
  }

  // ===========================================================================
  // HELPER: Messages d'erreur personnalisés
  // ===========================================================================

  /**
   * Génère un message d'erreur contextuel selon l'action refusée
   */
  static getPermissionErrorMessage(
    action: WorkOrderAction | PartRequestAction,
    userRole: UserRole
  ): string {
    // Messages spécifiques pour les demandes de pièces
    if (['approve', 'reject'].includes(action as PartRequestAction)) {
      return 'Seuls les managers (ADMIN ou MANAGER) peuvent valider ou rejeter des demandes de pièces.';
    }
    
    if (action === 'deliver') {
      return 'Seuls les gestionnaires de stock (ADMIN ou STOCK_MANAGER) peuvent livrer physiquement des pièces.';
    }

    // Messages spécifiques pour les interventions
    if (action === 'assign') {
      return 'Seuls les managers (ADMIN ou MANAGER) peuvent assigner des techniciens.';
    }

    if (['approve', 'reject'].includes(action as WorkOrderAction)) {
      return 'Seuls les managers (ADMIN ou MANAGER) peuvent approuver ou rejeter des interventions.';
    }

    // Message générique
    const resourceType = ['approve', 'reject', 'deliver'].includes(action) ? 'demande de pièce' : 'intervention';
    return `Vous n'avez pas les permissions nécessaires pour effectuer cette action sur cette ${resourceType}.`;
  }
}
