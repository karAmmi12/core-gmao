// =============================================================================
// WORK ORDER PART ENTITY - Pièces liées aux Ordres de Travail
// =============================================================================
// Gère le workflow des pièces planifiées, réservées et consommées pour un OT

export type WorkOrderPartStatus = 
  | 'PLANNED'            // Pièce planifiée mais pas encore réservée
  | 'RESERVED'           // Stock réservé (bloqué pour cet OT)
  | 'PARTIALLY_RESERVED' // Partiellement réservé (stock insuffisant)
  | 'CONSUMED'           // Pièce consommée (OT terminé)
  | 'CANCELLED';         // Annulé

export interface WorkOrderPartProps {
  id: string;
  workOrderId: string;
  partId: string;
  
  // Quantités avec workflow
  quantityPlanned: number;    // Quantité demandée initialement
  quantityReserved: number;   // Quantité effectivement réservée en stock
  quantityConsumed: number;   // Quantité réellement utilisée
  
  status: WorkOrderPartStatus;
  
  // Prix
  unitPrice: number;
  totalPrice: number;
  
  // Traçabilité
  requestedById?: string;
  approvedById?: string;
  approvedAt?: Date;
  consumedAt?: Date;
  notes?: string;
  
  createdAt: Date;
  updatedAt: Date;
  
  // Données jointes (optionnel)
  part?: {
    id: string;
    reference: string;
    name: string;
    quantityInStock: number;
  };
  workOrder?: {
    id: string;
    title: string;
    status: string;
  };
}

export class WorkOrderPart {
  private constructor(private props: WorkOrderPartProps) {}

  // =============================================================================
  // FACTORY METHODS
  // =============================================================================

  /**
   * Crée une nouvelle demande de pièce pour un OT
   */
  static create(params: {
    id: string;
    workOrderId: string;
    partId: string;
    quantityPlanned: number;
    unitPrice: number;
    requestedById?: string;
    notes?: string;
  }): WorkOrderPart {
    if (params.quantityPlanned <= 0) {
      throw new Error('La quantité doit être supérieure à 0');
    }

    return new WorkOrderPart({
      ...params,
      quantityReserved: 0,
      quantityConsumed: 0,
      status: 'PLANNED',
      totalPrice: 0, // Calculé à la consommation
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  /**
   * Reconstruit depuis la base de données
   */
  static fromPersistence(data: WorkOrderPartProps): WorkOrderPart {
    return new WorkOrderPart(data);
  }

  // =============================================================================
  // GETTERS
  // =============================================================================

  get id(): string { return this.props.id; }
  get workOrderId(): string { return this.props.workOrderId; }
  get partId(): string { return this.props.partId; }
  get quantityPlanned(): number { return this.props.quantityPlanned; }
  get quantityReserved(): number { return this.props.quantityReserved; }
  get quantityConsumed(): number { return this.props.quantityConsumed; }
  get status(): WorkOrderPartStatus { return this.props.status; }
  get unitPrice(): number { return this.props.unitPrice; }
  get totalPrice(): number { return this.props.totalPrice; }
  get requestedById(): string | undefined { return this.props.requestedById; }
  get approvedById(): string | undefined { return this.props.approvedById; }
  get approvedAt(): Date | undefined { return this.props.approvedAt; }
  get consumedAt(): Date | undefined { return this.props.consumedAt; }
  get notes(): string | undefined { return this.props.notes; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }
  get part() { return this.props.part; }
  get workOrder() { return this.props.workOrder; }

  // =============================================================================
  // COMPUTED PROPERTIES
  // =============================================================================

  /** Quantité manquante (non réservée) */
  get quantityMissing(): number {
    return Math.max(0, this.props.quantityPlanned - this.props.quantityReserved);
  }

  /** Est entièrement réservé */
  get isFullyReserved(): boolean {
    return this.props.quantityReserved >= this.props.quantityPlanned;
  }

  /** Est prêt pour exécution (réservé ou partiellement) */
  get isReadyForExecution(): boolean {
    return this.props.status === 'RESERVED' || this.props.status === 'PARTIALLY_RESERVED';
  }

  /** Coût estimé total */
  get estimatedCost(): number {
    return this.props.quantityPlanned * this.props.unitPrice;
  }

  // =============================================================================
  // BUSINESS METHODS
  // =============================================================================

  /**
   * Réserve une quantité en stock pour cet OT
   */
  reserve(quantity: number, approvedById: string): void {
    if (this.props.status === 'CONSUMED' || this.props.status === 'CANCELLED') {
      throw new Error('Impossible de réserver une pièce déjà consommée ou annulée');
    }

    if (quantity <= 0) {
      throw new Error('La quantité à réserver doit être positive');
    }

    this.props.quantityReserved = Math.min(
      this.props.quantityReserved + quantity,
      this.props.quantityPlanned
    );
    
    this.props.approvedById = approvedById;
    this.props.approvedAt = new Date();
    
    // Mettre à jour le statut
    if (this.props.quantityReserved >= this.props.quantityPlanned) {
      this.props.status = 'RESERVED';
    } else if (this.props.quantityReserved > 0) {
      this.props.status = 'PARTIALLY_RESERVED';
    }
    
    this.props.updatedAt = new Date();
  }

  /**
   * Marque la pièce comme consommée (à la clôture de l'OT)
   */
  consume(actualQuantity?: number): void {
    if (this.props.status === 'CONSUMED') {
      throw new Error('Pièce déjà consommée');
    }

    if (this.props.status === 'CANCELLED') {
      throw new Error('Impossible de consommer une pièce annulée');
    }

    // Si pas de quantité spécifiée, on consomme ce qui était réservé
    const qty = actualQuantity ?? this.props.quantityReserved;
    
    if (qty < 0) {
      throw new Error('La quantité consommée ne peut pas être négative');
    }

    this.props.quantityConsumed = qty;
    this.props.totalPrice = qty * this.props.unitPrice;
    this.props.consumedAt = new Date();
    this.props.status = 'CONSUMED';
    this.props.updatedAt = new Date();
  }

  /**
   * Annule la demande de pièce
   */
  cancel(): void {
    if (this.props.status === 'CONSUMED') {
      throw new Error('Impossible d\'annuler une pièce déjà consommée');
    }

    this.props.status = 'CANCELLED';
    this.props.updatedAt = new Date();
  }

  /**
   * Met à jour la quantité planifiée (avant réservation)
   */
  updateQuantity(newQuantity: number): void {
    if (this.props.status !== 'PLANNED') {
      throw new Error('Impossible de modifier la quantité après réservation');
    }

    if (newQuantity <= 0) {
      throw new Error('La quantité doit être supérieure à 0');
    }

    this.props.quantityPlanned = newQuantity;
    this.props.updatedAt = new Date();
  }

  /**
   * Ajoute une note
   */
  addNote(note: string): void {
    this.props.notes = this.props.notes 
      ? `${this.props.notes}\n${note}`
      : note;
    this.props.updatedAt = new Date();
  }

  // =============================================================================
  // SERIALIZATION
  // =============================================================================

  toPersistence(): WorkOrderPartProps {
    return { ...this.props };
  }
}
