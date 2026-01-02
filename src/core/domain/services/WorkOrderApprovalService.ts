// =============================================================================
// WORK ORDER APPROVAL SERVICE - Logique d'approbation des interventions
// =============================================================================
// Détermine automatiquement si une intervention nécessite une approbation
// selon le type et le rôle de l'utilisateur créateur.
// 
// RÈGLES STANDARD GMAO :
// 1. PREVENTIVE : Jamais d'approbation (générées depuis plannings validés)
// 2. CORRECTIVE par TECHNICIAN : Toujours approbation MANAGER
// 3. CORRECTIVE par MANAGER/ADMIN : Pas d'approbation (auto-validé)
// =============================================================================

export interface WorkOrderApprovalInput {
  type: 'PREVENTIVE' | 'CORRECTIVE';
  priority: 'LOW' | 'HIGH';
  createdByRole?: 'ADMIN' | 'MANAGER' | 'TECHNICIAN' | 'STOCK_MANAGER' | 'OPERATOR' | 'VIEWER';
}

export class WorkOrderApprovalService {

  /**
   * Détermine si une intervention nécessite une approbation
   * 
   * Règles métier STANDARD GMAO :
   * 1. PREVENTIVE = Jamais d'approbation
   *    → Générées automatiquement depuis plannings déjà validés par MANAGER
   * 
   * 2. CORRECTIVE créée par TECHNICIAN = Toujours approbation MANAGER
   *    → Le manager valide, priorise et assigne l'intervention
   *    → Permet optimisation des ressources et priorisation centralisée
   * 
   * 3. CORRECTIVE créée par MANAGER/ADMIN = Pas d'approbation
   *    → Auto-validée, passe directement en PLANNED
   * 
   * Note : Pour les urgences, communication verbale + validation rapide
   */
  static requiresApproval(input: WorkOrderApprovalInput): boolean {
    const { type, createdByRole } = input;

    // Règle 1 : PREVENTIVE = jamais d'approbation
    // Les interventions préventives sont générées depuis des plannings
    // qui ont déjà été validés par le MANAGER lors de leur création
    if (type === 'PREVENTIVE') {
      return false;
    }

    // Règle 2 : CORRECTIVE créée par MANAGER/ADMIN = pas d'approbation
    // Le responsable se valide lui-même, l'intervention passe en PLANNED
    if (createdByRole === 'ADMIN' || createdByRole === 'MANAGER') {
      return false;
    }

    // Règle 3 : CORRECTIVE créée par TECHNICIAN = toujours approbation
    // Validation obligatoire par le MANAGER pour :
    // - Prioriser par rapport aux autres interventions
    // - Assigner le technicien le plus adapté
    // - Valider la justification et les ressources nécessaires
    return true;
  }

  /**
   * Détermine le niveau d'approbation requis
   * 
   * @returns 'MANAGER' | null
   */
  static getRequiredApprovalLevel(input: WorkOrderApprovalInput): 'MANAGER' | null {
    if (!this.requiresApproval(input)) {
      return null;
    }

    // Toutes les approbations sont validées par le MANAGER
    return 'MANAGER';
  }

  /**
   * Détermine le statut initial d'une intervention
   */
  static getInitialStatus(input: WorkOrderApprovalInput): string {
    if (this.requiresApproval(input)) {
      return 'PENDING';  // En attente d'approbation
    }
    return 'PLANNED';    // Prête pour assignation
  }

  /**
   * Valide qu'une transition de statut est autorisée
   */
  static isValidStatusTransition(
    currentStatus: string,
    newStatus: string,
    requiresApproval: boolean
  ): boolean {
    // Workflows possibles selon le type d'intervention

    // Avec approbation : DRAFT → PENDING → APPROVED/REJECTED → PLANNED → ...
    if (requiresApproval) {
      const validTransitions: Record<string, string[]> = {
        'DRAFT': ['PENDING', 'CANCELLED'],
        'PENDING': ['APPROVED', 'REJECTED', 'CANCELLED'],
        'APPROVED': ['PLANNED', 'CANCELLED'],
        'REJECTED': ['DRAFT', 'CANCELLED'],  // Peut être retravaillée
        'PLANNED': ['ASSIGNED', 'CANCELLED'],
        'ASSIGNED': ['IN_PROGRESS', 'CANCELLED'],
        'IN_PROGRESS': ['ON_HOLD', 'COMPLETED', 'CANCELLED'],
        'ON_HOLD': ['IN_PROGRESS', 'CANCELLED'],
        'COMPLETED': [],  // État final
        'CANCELLED': [],  // État final
      };

      return validTransitions[currentStatus]?.includes(newStatus) ?? false;
    }

    // Sans approbation : DRAFT → PLANNED → ASSIGNED → ...
    const validTransitions: Record<string, string[]> = {
      'DRAFT': ['PLANNED', 'CANCELLED'],
      'PLANNED': ['ASSIGNED', 'CANCELLED'],
      'ASSIGNED': ['IN_PROGRESS', 'CANCELLED'],
      'IN_PROGRESS': ['ON_HOLD', 'COMPLETED', 'CANCELLED'],
      'ON_HOLD': ['IN_PROGRESS', 'CANCELLED'],
      'COMPLETED': [],  // État final
      'CANCELLED': [],  // État final
    };

    return validTransitions[currentStatus]?.includes(newStatus) ?? false;
  }

  /**
   * Message explicatif sur pourquoi une approbation est nécessaire
   */
  static getApprovalReason(input: WorkOrderApprovalInput): string {
    const { type, createdByRole } = input;

    // PREVENTIVE ne nécessite jamais d'approbation
    if (type === 'PREVENTIVE') {
      return 'Intervention préventive générée depuis planning validé';
    }

    // CORRECTIVE créée par MANAGER/ADMIN
    if (createdByRole === 'ADMIN' || createdByRole === 'MANAGER') {
      return 'Intervention créée par un responsable, auto-validée';
    }

    // CORRECTIVE créée par TECHNICIAN
    return 'Intervention corrective nécessitant validation du responsable pour priorisation et assignation';
  }

  /**
   * Recommandations pour l'approbateur (MANAGER)
   */
  static getApprovalGuidelines(input: WorkOrderApprovalInput): {
    factors: string[];
    recommendations: string[];
  } {
    const factors: string[] = [];
    const recommendations: string[] = [];

    // Facteurs à considérer pour une intervention corrective
    if (input.type === 'CORRECTIVE') {
      factors.push('Intervention corrective créée par un technicien');
      recommendations.push('Vérifier la justification et l\'urgence réelle');
      recommendations.push('Prioriser par rapport aux autres interventions en cours');
      recommendations.push('Assigner le technicien le plus adapté (compétences/disponibilité)');
      recommendations.push('Valider la disponibilité des pièces nécessaires');
      
      if (input.priority === 'HIGH') {
        factors.push('⚠️ Priorité URGENTE - Action rapide recommandée');
        recommendations.push('Traiter en priorité - impact production possible');
      }
    }

    return { factors, recommendations };
  }
}
