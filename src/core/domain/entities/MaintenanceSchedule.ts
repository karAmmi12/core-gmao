import { v4 as uuidv4 } from 'uuid';

export type MaintenanceFrequency = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';

export interface MaintenanceScheduleInput {
  assetId: string;
  title: string;
  description?: string;
  frequency: MaintenanceFrequency;
  intervalValue?: number;
  nextDueDate: Date;
  estimatedDuration?: number;
  assignedToId?: string;
  priority?: 'LOW' | 'HIGH';
}

export class MaintenanceSchedule {
  private constructor(
    public readonly id: string,
    public readonly assetId: string,
    public readonly title: string,
    public readonly description: string | undefined,
    public readonly frequency: MaintenanceFrequency,
    public readonly intervalValue: number,
    public readonly lastExecutedAt: Date | undefined,
    public readonly nextDueDate: Date,
    public readonly estimatedDuration: number | undefined,
    public readonly assignedToId: string | undefined,
    public readonly isActive: boolean,
    public readonly priority: 'LOW' | 'HIGH',
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  static create(input: MaintenanceScheduleInput): MaintenanceSchedule {
    if (input.title.length < 5) {
      throw new Error('Le titre doit contenir au moins 5 caractères');
    }

    const now = new Date();

    return new MaintenanceSchedule(
      uuidv4(),
      input.assetId,
      input.title,
      input.description,
      input.frequency,
      input.intervalValue || 1,
      undefined, // lastExecutedAt
      input.nextDueDate,
      input.estimatedDuration,
      input.assignedToId,
      true, // isActive
      input.priority || 'LOW',
      now,
      now
    );
  }

  static restore(
    id: string,
    assetId: string,
    title: string,
    description: string | undefined,
    frequency: MaintenanceFrequency,
    intervalValue: number,
    lastExecutedAt: Date | undefined,
    nextDueDate: Date,
    estimatedDuration: number | undefined,
    assignedToId: string | undefined,
    isActive: boolean,
    priority: 'LOW' | 'HIGH',
    createdAt: Date,
    updatedAt: Date
  ): MaintenanceSchedule {
    return new MaintenanceSchedule(
      id,
      assetId,
      title,
      description,
      frequency,
      intervalValue,
      lastExecutedAt,
      nextDueDate,
      estimatedDuration,
      assignedToId,
      isActive,
      priority,
      createdAt,
      updatedAt
    );
  }

  isDue(): boolean {
    return new Date() >= this.nextDueDate && this.isActive;
  }

  calculateNextDueDate(): Date {
    const baseDate = this.lastExecutedAt || this.nextDueDate;
    const next = new Date(baseDate);

    switch (this.frequency) {
      case 'DAILY':
        next.setDate(next.getDate() + this.intervalValue);
        break;
      case 'WEEKLY':
        next.setDate(next.getDate() + (7 * this.intervalValue));
        break;
      case 'MONTHLY':
        next.setMonth(next.getMonth() + this.intervalValue);
        break;
      case 'QUARTERLY':
        next.setMonth(next.getMonth() + (3 * this.intervalValue));
        break;
      case 'YEARLY':
        next.setFullYear(next.getFullYear() + this.intervalValue);
        break;
    }

    return next;
  }

  markAsExecuted(executedAt: Date = new Date()): MaintenanceSchedule {
    const nextDue = this.calculateNextDueDate();

    return MaintenanceSchedule.restore(
      this.id,
      this.assetId,
      this.title,
      this.description,
      this.frequency,
      this.intervalValue,
      executedAt,
      nextDue,
      this.estimatedDuration,
      this.assignedToId,
      this.isActive,
      this.priority,
      this.createdAt,
      new Date()
    );
  }
}
