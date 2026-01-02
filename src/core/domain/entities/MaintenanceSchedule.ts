import { v4 as uuidv4 } from 'uuid';

export type MaintenanceFrequency = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
export type MaintenanceTriggerType = 'TIME_BASED' | 'THRESHOLD_BASED';
export type MaintenanceType = 'PREVENTIVE' | 'PREDICTIVE';

export interface MaintenanceScheduleInput {
  assetId: string;
  title: string;
  description?: string;
  maintenanceType?: MaintenanceType;
  triggerType?: MaintenanceTriggerType;
  // Time-based fields
  frequency?: MaintenanceFrequency;
  intervalValue?: number;
  nextDueDate?: Date;
  // Threshold-based fields
  thresholdMetric?: string;
  thresholdValue?: number;
  thresholdUnit?: string;
  currentValue?: number;
  // Common fields
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
    public readonly maintenanceType: MaintenanceType,
    public readonly triggerType: MaintenanceTriggerType,
    // Time-based
    public readonly frequency: MaintenanceFrequency,
    public readonly intervalValue: number,
    public readonly lastExecutedAt: Date | undefined,
    public readonly nextDueDate: Date,
    // Threshold-based
    public readonly thresholdMetric: string | undefined,
    public readonly thresholdValue: number | undefined,
    public readonly thresholdUnit: string | undefined,
    public readonly currentValue: number | undefined,
    // Common
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

    const triggerType = input.triggerType || 'TIME_BASED';
    
    // Validation selon le type de déclenchement
    if (triggerType === 'TIME_BASED') {
      if (!input.frequency) {
        throw new Error('La fréquence est requise pour une maintenance temporelle');
      }
      if (!input.nextDueDate) {
        throw new Error('La date de prochaine échéance est requise');
      }
    } else {
      if (!input.thresholdMetric || !input.thresholdValue) {
        throw new Error('Le métrique et la valeur de seuil sont requis pour une maintenance prédictive');
      }
    }

    const now = new Date();

    return new MaintenanceSchedule(
      uuidv4(),
      input.assetId,
      input.title,
      input.description,
      input.maintenanceType || 'PREVENTIVE',
      triggerType,
      input.frequency || 'MONTHLY',
      input.intervalValue || 1,
      undefined, // lastExecutedAt
      input.nextDueDate || new Date(),
      input.thresholdMetric,
      input.thresholdValue,
      input.thresholdUnit,
      input.currentValue || 0,
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
    maintenanceType: MaintenanceType,
    triggerType: MaintenanceTriggerType,
    frequency: MaintenanceFrequency,
    intervalValue: number,
    lastExecutedAt: Date | undefined,
    nextDueDate: Date,
    thresholdMetric: string | undefined,
    thresholdValue: number | undefined,
    thresholdUnit: string | undefined,
    currentValue: number | undefined,
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
      maintenanceType,
      triggerType,
      frequency,
      intervalValue,
      lastExecutedAt,
      nextDueDate,
      thresholdMetric,
      thresholdValue,
      thresholdUnit,
      currentValue,
      estimatedDuration,
      assignedToId,
      isActive,
      priority,
      createdAt,
      updatedAt
    );
  }

  /**
   * Vérifie si la maintenance est due
   * - TIME_BASED: basé sur la date
   * - THRESHOLD_BASED: basé sur le dépassement du seuil
   */
  isDue(): boolean {
    if (!this.isActive) return false;
    
    if (this.triggerType === 'TIME_BASED') {
      return new Date() >= this.nextDueDate;
    } else {
      // Threshold-based: due si currentValue >= thresholdValue
      if (this.thresholdValue === undefined || this.currentValue === undefined) {
        return false;
      }
      return this.currentValue >= this.thresholdValue;
    }
  }

  /**
   * Retourne le pourcentage de progression vers le seuil (pour THRESHOLD_BASED)
   */
  getThresholdProgress(): number {
    if (this.triggerType !== 'THRESHOLD_BASED' || !this.thresholdValue) {
      return 0;
    }
    return Math.min(100, Math.round(((this.currentValue || 0) / this.thresholdValue) * 100));
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

  /**
   * Marque le planning comme exécuté
   * - TIME_BASED: calcule la prochaine date
   * - THRESHOLD_BASED: remet le compteur à zéro
   */
  markAsExecuted(executedAt: Date = new Date()): MaintenanceSchedule {
    if (this.triggerType === 'TIME_BASED') {
      const nextDue = this.calculateNextDueDate();
      return MaintenanceSchedule.restore(
        this.id,
        this.assetId,
        this.title,
        this.description,
        this.maintenanceType,
        this.triggerType,
        this.frequency,
        this.intervalValue,
        executedAt,
        nextDue,
        this.thresholdMetric,
        this.thresholdValue,
        this.thresholdUnit,
        this.currentValue,
        this.estimatedDuration,
        this.assignedToId,
        this.isActive,
        this.priority,
        this.createdAt,
        new Date()
      );
    } else {
      // THRESHOLD_BASED: reset currentValue to 0
      return MaintenanceSchedule.restore(
        this.id,
        this.assetId,
        this.title,
        this.description,
        this.maintenanceType,
        this.triggerType,
        this.frequency,
        this.intervalValue,
        executedAt,
        this.nextDueDate,
        this.thresholdMetric,
        this.thresholdValue,
        this.thresholdUnit,
        0, // Reset counter
        this.estimatedDuration,
        this.assignedToId,
        this.isActive,
        this.priority,
        this.createdAt,
        new Date()
      );
    }
  }

  /**
   * Met à jour la valeur courante du compteur (pour THRESHOLD_BASED)
   */
  updateCurrentValue(newValue: number): MaintenanceSchedule {
    if (this.triggerType !== 'THRESHOLD_BASED') {
      throw new Error('Cette opération n\'est disponible que pour les maintenances prédictives');
    }

    return MaintenanceSchedule.restore(
      this.id,
      this.assetId,
      this.title,
      this.description,
      this.maintenanceType,
      this.triggerType,
      this.frequency,
      this.intervalValue,
      this.lastExecutedAt,
      this.nextDueDate,
      this.thresholdMetric,
      this.thresholdValue,
      this.thresholdUnit,
      newValue,
      this.estimatedDuration,
      this.assignedToId,
      this.isActive,
      this.priority,
      this.createdAt,
      new Date()
    );
  }

  /**
   * Met à jour le planning de maintenance
   */
  update(input: Partial<MaintenanceScheduleInput>): MaintenanceSchedule {
    // Validation du titre si fourni
    if (input.title !== undefined && input.title.length < 5) {
      throw new Error('Le titre doit contenir au moins 5 caractères');
    }

    return MaintenanceSchedule.restore(
      this.id,
      this.assetId,
      input.title !== undefined ? input.title : this.title,
      input.description !== undefined ? input.description : this.description,
      this.maintenanceType,
      this.triggerType,
      input.frequency !== undefined ? input.frequency : this.frequency,
      input.intervalValue !== undefined ? input.intervalValue : this.intervalValue,
      this.lastExecutedAt,
      input.nextDueDate !== undefined ? input.nextDueDate : this.nextDueDate,
      input.thresholdMetric !== undefined ? input.thresholdMetric : this.thresholdMetric,
      input.thresholdValue !== undefined ? input.thresholdValue : this.thresholdValue,
      input.thresholdUnit !== undefined ? input.thresholdUnit : this.thresholdUnit,
      input.currentValue !== undefined ? input.currentValue : this.currentValue,
      input.estimatedDuration !== undefined ? input.estimatedDuration : this.estimatedDuration,
      input.assignedToId !== undefined ? input.assignedToId : this.assignedToId,
      this.isActive,
      input.priority !== undefined ? input.priority : this.priority,
      this.createdAt,
      new Date()
    );
  }

  /**
   * Active ou désactive le planning
   */
  setActive(isActive: boolean): MaintenanceSchedule {
    return MaintenanceSchedule.restore(
      this.id,
      this.assetId,
      this.title,
      this.description,
      this.maintenanceType,
      this.triggerType,
      this.frequency,
      this.intervalValue,
      this.lastExecutedAt,
      this.nextDueDate,
      this.thresholdMetric,
      this.thresholdValue,
      this.thresholdUnit,
      this.currentValue,
      this.estimatedDuration,
      this.assignedToId,
      isActive,
      this.priority,
      this.createdAt,
      new Date()
    );
  }
}
