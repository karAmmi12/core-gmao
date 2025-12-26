import { v4 as uuidv4 } from 'uuid';

export type OrderStatus = 'DRAFT' | 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type OrderPriority = 'LOW' | 'HIGH';

export interface WorkOrderSchedule {
  scheduledAt?: Date;
  estimatedDuration?: number; // en minutes
  assignedToId?: string;
}

export interface WorkOrderCosts {
  laborCost: number;
  materialCost: number;
}

export class WorkOrder {
  private constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly description: string | undefined,
    public readonly status: OrderStatus,
    public readonly priority: OrderPriority,
    public readonly assetId: string,
    public readonly createdAt: Date,
    public readonly scheduledAt: Date | undefined,
    public readonly startedAt: Date | undefined,
    public readonly completedAt: Date | undefined,
    public readonly estimatedDuration: number | undefined,
    public readonly actualDuration: number | undefined,
    public readonly assignedToId: string | undefined,
    public readonly laborCost: number,
    public readonly materialCost: number,
    public readonly totalCost: number
  ) {}

  static create(
    title: string,
    priority: OrderPriority,
    assetId: string,
    description?: string,
    schedule?: WorkOrderSchedule
  ): WorkOrder {
    if (title.length < 5) {
      throw new Error("Le titre de l'intervention doit être précis (min 5 caractères).");
    }

    const status: OrderStatus = schedule?.scheduledAt ? 'PLANNED' : 'DRAFT';

    return new WorkOrder(
      uuidv4(),
      title,
      description,
      status,
      priority,
      assetId,
      new Date(),
      schedule?.scheduledAt,
      undefined, // startedAt
      undefined, // completedAt
      schedule?.estimatedDuration,
      undefined, // actualDuration
      schedule?.assignedToId,
      0, // laborCost
      0, // materialCost
      0  // totalCost
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
    if (this.status === 'IN_PROGRESS') {
      throw new Error("Cette intervention est déjà en cours.");
    }
    
    (this as any).status = 'IN_PROGRESS';
    (this as any).startedAt = new Date();
  }

  static restore(
    id: string,
    title: string,
    description: string | undefined,
    status: OrderStatus,
    priority: OrderPriority,
    assetId: string,
    createdAt: Date,
    scheduledAt: Date | undefined,
    startedAt: Date | undefined,
    completedAt: Date | undefined,
    estimatedDuration: number | undefined,
    actualDuration: number | undefined,
    assignedToId: string | undefined,
    laborCost: number,
    materialCost: number,
    totalCost: number
  ): WorkOrder {
    return new WorkOrder(
      id,
      title,
      description,
      status,
      priority,
      assetId,
      createdAt,
      scheduledAt,
      startedAt,
      completedAt,
      estimatedDuration,
      actualDuration,
      assignedToId,
      laborCost,
      materialCost,
      totalCost
    );
  }
}