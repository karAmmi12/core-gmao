import { v4 as uuidv4 } from 'uuid';

export type OrderStatus = 
  | 'DRAFT'
  | 'PENDING'       // En attente d'approbation
  | 'APPROVED'      // Approuvée
  | 'REJECTED'      // Rejetée
  | 'PLANNED'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'ON_HOLD'       // En attente (pièces, info, etc.)
  | 'COMPLETED'
  | 'CANCELLED';

export type OrderPriority = 'LOW' | 'HIGH';
export type MaintenanceType = 'CORRECTIVE' | 'PREVENTIVE' | 'PREDICTIVE' | 'CONDITIONAL';

export interface WorkOrderSchedule {
  scheduledAt?: Date;
  estimatedDuration?: number; // en minutes
  assignedToId?: string;
}

export interface WorkOrderCosts {
  laborCost: number;
  materialCost: number;
}

export interface WorkOrderApproval {
  requiresApproval: boolean;
  approvedById?: string;
  approvedAt?: Date;
  rejectionReason?: string;
}

export class WorkOrder {
  private constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly description: string | undefined,
    public readonly status: OrderStatus,
    public readonly priority: OrderPriority,
    public readonly type: MaintenanceType,
    public readonly assetId: string,
    public readonly scheduleId: string | undefined, // Lien vers MaintenanceSchedule si préventive
    public readonly createdAt: Date,
    public readonly scheduledAt: Date | undefined,
    public readonly startedAt: Date | undefined,
    public readonly completedAt: Date | undefined,
    public readonly estimatedDuration: number | undefined,
    public readonly actualDuration: number | undefined,
    public readonly assignedToId: string | undefined,
    public readonly laborCost: number,
    public readonly materialCost: number,
    public readonly totalCost: number,
    public readonly estimatedCost: number | undefined,
    public readonly requiresApproval: boolean,
    public readonly approvedById: string | undefined,
    public readonly approvedAt: Date | undefined,
    public readonly rejectionReason: string | undefined
  ) {}

  static create(
    title: string,
    priority: OrderPriority,
    assetId: string,
    description?: string,
    schedule?: WorkOrderSchedule,
    type: MaintenanceType = 'CORRECTIVE',
    scheduleId?: string,
    estimatedCost?: number,
    createdByRole?: 'ADMIN' | 'MANAGER' | 'TECHNICIAN' | 'STOCK_MANAGER' | 'OPERATOR' | 'VIEWER'
  ): WorkOrder {
    if (title.length < 5) {
      throw new Error("Le titre de l'intervention doit être précis (min 5 caractères).");
    }

    // Déterminer si l'approbation est requise
    const { WorkOrderApprovalService } = require('../services/WorkOrderApprovalService');
    const requiresApproval = WorkOrderApprovalService.requiresApproval({
      type,
      priority,
      createdByRole,
    });

    // Déterminer le statut initial selon si approbation nécessaire
    const status: OrderStatus = requiresApproval 
      ? 'PENDING'  // En attente d'approbation
      : (schedule?.scheduledAt ? 'PLANNED' : 'DRAFT');

    return new WorkOrder(
      uuidv4(),
      title,
      description,
      status,
      priority,
      type,
      assetId,
      scheduleId,
      new Date(),
      schedule?.scheduledAt,
      undefined, // startedAt
      undefined, // completedAt
      schedule?.estimatedDuration,
      undefined, // actualDuration
      schedule?.assignedToId,
      0, // laborCost
      0, // materialCost
      0, // totalCost
      estimatedCost,
      requiresApproval,
      undefined, // approvedById
      undefined, // approvedAt
      undefined  // rejectionReason
    );
  }

  markAsCompleted(costs?: WorkOrderCosts): void {
    if (this.status === 'COMPLETED') {
      throw new Error("Cette intervention est déjà terminée.");
    }
    
    const laborCost = costs?.laborCost || 0;
    const materialCost = costs?.materialCost || 0;
    
    (this as any).status = 'COMPLETED';
    (this as any).completedAt = new Date();
    (this as any).laborCost = laborCost;
    (this as any).materialCost = materialCost;
    (this as any).totalCost = laborCost + materialCost;
    
    // Calculer la durée réelle si startedAt existe
    if (this.startedAt) {
      const duration = Math.floor((new Date().getTime() - this.startedAt.getTime()) / (1000 * 60));
      (this as any).actualDuration = duration;
    }
  }

  startWork(): void {
    if (this.status === 'COMPLETED') {
      throw new Error("Cette intervention est déjà terminée.");
    }
    if (this.status === 'CANCELLED') {
      throw new Error("Cette intervention a été annulée.");
    }
    if (this.status === 'IN_PROGRESS') {
      throw new Error("Cette intervention est déjà en cours.");
    }
    
    (this as any).status = 'IN_PROGRESS';
    (this as any).startedAt = new Date();
  }

  cancel(reason?: string): void {
    if (this.status === 'COMPLETED') {
      throw new Error("Impossible d'annuler une intervention terminée.");
    }
    if (this.status === 'CANCELLED') {
      throw new Error("Cette intervention est déjà annulée.");
    }
    
    (this as any).status = 'CANCELLED';
    if (reason) {
      (this as any).description = `${this.description || ''}\n\n[ANNULÉ] ${reason}`.trim();
    }
  }

  update(data: {
    title?: string;
    description?: string;
    priority?: OrderPriority;
    scheduledAt?: Date;
    estimatedDuration?: number;
    assignedToId?: string | null;
  }): void {
    if (this.status === 'COMPLETED') {
      throw new Error("Impossible de modifier une intervention terminée.");
    }
    if (this.status === 'CANCELLED') {
      throw new Error("Impossible de modifier une intervention annulée.");
    }

    if (data.title !== undefined) {
      if (data.title.length < 5) {
        throw new Error("Le titre doit contenir au moins 5 caractères.");
      }
      (this as any).title = data.title;
    }
    if (data.description !== undefined) {
      (this as any).description = data.description;
    }
    if (data.priority !== undefined) {
      (this as any).priority = data.priority;
    }
    if (data.scheduledAt !== undefined) {
      (this as any).scheduledAt = data.scheduledAt;
      // Si on planifie une intervention en brouillon, passer à PLANNED
      if (this.status === 'DRAFT' && data.scheduledAt) {
        (this as any).status = 'PLANNED';
      }
    }
    if (data.estimatedDuration !== undefined) {
      (this as any).estimatedDuration = data.estimatedDuration;
    }
    if (data.assignedToId !== undefined) {
      (this as any).assignedToId = data.assignedToId === null ? undefined : data.assignedToId;
    }
  }

  static restore(
    id: string,
    title: string,
    description: string | undefined,
    status: OrderStatus,
    priority: OrderPriority,
    type: MaintenanceType,
    assetId: string,
    scheduleId: string | undefined,
    createdAt: Date,
    scheduledAt: Date | undefined,
    startedAt: Date | undefined,
    completedAt: Date | undefined,
    estimatedDuration: number | undefined,
    actualDuration: number | undefined,
    assignedToId: string | undefined,
    laborCost: number,
    materialCost: number,
    totalCost: number,
    estimatedCost: number | undefined,
    requiresApproval: boolean,
    approvedById: string | undefined,
    approvedAt: Date | undefined,
    rejectionReason: string | undefined
  ): WorkOrder {
    return new WorkOrder(
      id,
      title,
      description,
      status,
      priority,
      type,
      assetId,
      scheduleId,
      createdAt,
      scheduledAt,
      startedAt,
      completedAt,
      estimatedDuration,
      actualDuration,
      assignedToId,
      laborCost,
      materialCost,
      totalCost,
      estimatedCost,
      requiresApproval,
      approvedById,
      approvedAt,
      rejectionReason
    );
  }
}