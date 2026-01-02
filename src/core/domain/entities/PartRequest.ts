// =============================================================================
// PART REQUEST ENTITY - Demandes urgentes de pièces
// =============================================================================
// Gère les demandes de pièces hors OT ou avant création d'OT (dépannage terrain)

export type PartRequestStatus = 
  | 'PENDING'     // En attente de validation
  | 'APPROVED'    // Approuvé par le manager
  | 'REJECTED'    // Refusé
  | 'DELIVERED'   // Pièce remise au demandeur
  | 'CANCELLED';  // Annulé par le demandeur

export type PartRequestUrgency = 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';

export interface PartRequestProps {
  id: string;
  
  // Pièce demandée
  partId: string;
  quantity: number;
  
  // Demandeur et contexte
  requestedById: string;
  reason: string;
  urgency: PartRequestUrgency;
  
  // Liens optionnels
  workOrderId?: string;
  assetId?: string;
  
  // Workflow
  status: PartRequestStatus;
  approvedById?: string;
  approvedAt?: Date;
  rejectionReason?: string;
  
  deliveredAt?: Date;
  deliveredById?: string;
  
  notes?: string;
  
  createdAt: Date;
  updatedAt: Date;
  
  // Données jointes (optionnel)
  part?: {
    id: string;
    reference: string;
    name: string;
    quantityInStock: number;
    unitPrice: number;
  };
  requestedBy?: {
    id: string;
    name: string;
    email: string;
  };
  approvedBy?: {
    id: string;
    name: string;
  };
  workOrder?: {
    id: string;
    title: string;
  };
  asset?: {
    id: string;
    name: string;
  };
}

export class PartRequest {
  private constructor(private props: PartRequestProps) {}

  // =============================================================================
  // FACTORY METHODS
  // =============================================================================

  /**
   * Crée une nouvelle demande urgente de pièce
   */
  static create(params: {
    id: string;
    partId: string;
    quantity: number;
    requestedById: string;
    reason: string;
    urgency?: PartRequestUrgency;
    workOrderId?: string;
    assetId?: string;
    notes?: string;
  }): PartRequest {
    if (params.quantity <= 0) {
      throw new Error('La quantité doit être supérieure à 0');
    }

    if (!params.reason.trim()) {
      throw new Error('La raison de la demande est obligatoire');
    }

    return new PartRequest({
      ...params,
      urgency: params.urgency ?? 'NORMAL',
      status: 'PENDING',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  /**
   * Reconstruit depuis la base de données
   */
  static fromPersistence(data: PartRequestProps): PartRequest {
    return new PartRequest(data);
  }

  // =============================================================================
  // GETTERS
  // =============================================================================

  get id(): string { return this.props.id; }
  get partId(): string { return this.props.partId; }
  get quantity(): number { return this.props.quantity; }
  get requestedById(): string { return this.props.requestedById; }
  get reason(): string { return this.props.reason; }
  get urgency(): PartRequestUrgency { return this.props.urgency; }
  get workOrderId(): string | undefined { return this.props.workOrderId; }
  get assetId(): string | undefined { return this.props.assetId; }
  get status(): PartRequestStatus { return this.props.status; }
  get approvedById(): string | undefined { return this.props.approvedById; }
  get approvedAt(): Date | undefined { return this.props.approvedAt; }
  get rejectionReason(): string | undefined { return this.props.rejectionReason; }
  get deliveredAt(): Date | undefined { return this.props.deliveredAt; }
  get deliveredById(): string | undefined { return this.props.deliveredById; }
  get notes(): string | undefined { return this.props.notes; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }
  
  get part() { return this.props.part; }
  get requestedBy() { return this.props.requestedBy; }
  get approvedBy() { return this.props.approvedBy; }
  get workOrder() { return this.props.workOrder; }
  get asset() { return this.props.asset; }

  // =============================================================================
  // COMPUTED PROPERTIES
  // =============================================================================

  /** En attente de validation */
  get isPending(): boolean {
    return this.props.status === 'PENDING';
  }

  /** A été approuvée */
  get isApproved(): boolean {
    return this.props.status === 'APPROVED' || this.props.status === 'DELIVERED';
  }

  /** Peut être annulée */
  get canBeCancelled(): boolean {
    return this.props.status === 'PENDING';
  }

  /** Peut être livrée */
  get canBeDelivered(): boolean {
    return this.props.status === 'APPROVED';
  }

  /** Coût estimé */
  get estimatedCost(): number {
    return this.props.part 
      ? this.props.quantity * this.props.part.unitPrice 
      : 0;
  }

  /** Niveau d'urgence en nombre (pour tri) */
  get urgencyLevel(): number {
    const levels: Record<PartRequestUrgency, number> = {
      LOW: 1,
      NORMAL: 2,
      HIGH: 3,
      CRITICAL: 4,
    };
    return levels[this.props.urgency];
  }

  // =============================================================================
  // BUSINESS METHODS
  // =============================================================================

  /**
   * Approuve la demande
   */
  approve(approvedById: string, notes?: string): void {
    if (this.props.status !== 'PENDING') {
      throw new Error('Seule une demande en attente peut être approuvée');
    }

    this.props.status = 'APPROVED';
    this.props.approvedById = approvedById;
    this.props.approvedAt = new Date();
    
    if (notes) {
      this.addNote(`Approuvé: ${notes}`);
    }
    
    this.props.updatedAt = new Date();
  }

  /**
   * Rejette la demande
   */
  reject(approvedById: string, rejectionReason: string): void {
    if (this.props.status !== 'PENDING') {
      throw new Error('Seule une demande en attente peut être rejetée');
    }

    if (!rejectionReason.trim()) {
      throw new Error('La raison du refus est obligatoire');
    }

    this.props.status = 'REJECTED';
    this.props.approvedById = approvedById;
    this.props.approvedAt = new Date();
    this.props.rejectionReason = rejectionReason;
    this.props.updatedAt = new Date();
  }

  /**
   * Marque comme livrée (pièce remise au technicien)
   */
  deliver(deliveredById: string): void {
    if (this.props.status !== 'APPROVED') {
      throw new Error('Seule une demande approuvée peut être livrée');
    }

    this.props.status = 'DELIVERED';
    this.props.deliveredById = deliveredById;
    this.props.deliveredAt = new Date();
    this.props.updatedAt = new Date();
  }

  /**
   * Annule la demande
   */
  cancel(): void {
    if (!this.canBeCancelled) {
      throw new Error('Cette demande ne peut plus être annulée');
    }

    this.props.status = 'CANCELLED';
    this.props.updatedAt = new Date();
  }

  /**
   * Modifie la quantité (avant approbation)
   */
  updateQuantity(newQuantity: number): void {
    if (this.props.status !== 'PENDING') {
      throw new Error('Impossible de modifier une demande déjà traitée');
    }

    if (newQuantity <= 0) {
      throw new Error('La quantité doit être supérieure à 0');
    }

    this.props.quantity = newQuantity;
    this.props.updatedAt = new Date();
  }

  /**
   * Modifie l'urgence (avant approbation)
   */
  updateUrgency(urgency: PartRequestUrgency): void {
    if (this.props.status !== 'PENDING') {
      throw new Error('Impossible de modifier une demande déjà traitée');
    }

    this.props.urgency = urgency;
    this.props.updatedAt = new Date();
  }

  /**
   * Lie à un OT
   */
  linkToWorkOrder(workOrderId: string): void {
    this.props.workOrderId = workOrderId;
    this.props.updatedAt = new Date();
  }

  /**
   * Ajoute une note
   */
  addNote(note: string): void {
    const timestamp = new Date().toLocaleString('fr-FR');
    const formattedNote = `[${timestamp}] ${note}`;
    
    this.props.notes = this.props.notes 
      ? `${this.props.notes}\n${formattedNote}`
      : formattedNote;
    this.props.updatedAt = new Date();
  }

  // =============================================================================
  // SERIALIZATION
  // =============================================================================

  toPersistence(): Omit<PartRequestProps, 'part' | 'requestedBy' | 'approvedBy' | 'deliveredBy' | 'workOrder' | 'asset'> {
    return {
      id: this.props.id,
      partId: this.props.partId,
      quantity: this.props.quantity,
      requestedById: this.props.requestedById,
      reason: this.props.reason,
      urgency: this.props.urgency,
      workOrderId: this.props.workOrderId,
      assetId: this.props.assetId,
      status: this.props.status,
      approvedById: this.props.approvedById,
      approvedAt: this.props.approvedAt,
      rejectionReason: this.props.rejectionReason,
      deliveredAt: this.props.deliveredAt,
      deliveredById: this.props.deliveredById,
      notes: this.props.notes,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
    };
  }
}
