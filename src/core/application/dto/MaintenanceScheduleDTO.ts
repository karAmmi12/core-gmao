import { MaintenanceSchedule, MaintenanceFrequency, MaintenanceTriggerType, MaintenanceType } from '@/core/domain/entities/MaintenanceSchedule';

export interface MaintenanceScheduleDTO {
  id: string;
  assetId: string;
  assetName?: string;
  title: string;
  description?: string;
  // Type de maintenance
  maintenanceType: MaintenanceType;
  triggerType: MaintenanceTriggerType;
  // Time-based
  frequency: MaintenanceFrequency;
  intervalValue: number;
  lastExecutedAt?: string;
  nextDueDate: string;
  // Threshold-based
  thresholdMetric?: string;
  thresholdValue?: number;
  thresholdUnit?: string;
  currentValue?: number;
  thresholdProgress?: number; // Pourcentage de progression vers le seuil
  // Common
  estimatedDuration?: number;
  assignedToId?: string;
  assignedToName?: string;
  isActive: boolean;
  priority: 'LOW' | 'HIGH';
  isDue: boolean;
  createdAt: string;
  updatedAt: string;
}

export class MaintenanceScheduleMapper {
  static toDTO(schedule: MaintenanceSchedule, assetName?: string, assignedToName?: string): MaintenanceScheduleDTO {
    return {
      id: schedule.id,
      assetId: schedule.assetId,
      assetName,
      title: schedule.title,
      description: schedule.description,
      maintenanceType: schedule.maintenanceType,
      triggerType: schedule.triggerType,
      frequency: schedule.frequency,
      intervalValue: schedule.intervalValue,
      lastExecutedAt: schedule.lastExecutedAt?.toISOString(),
      nextDueDate: schedule.nextDueDate.toISOString(),
      thresholdMetric: schedule.thresholdMetric,
      thresholdValue: schedule.thresholdValue,
      thresholdUnit: schedule.thresholdUnit,
      currentValue: schedule.currentValue,
      thresholdProgress: schedule.getThresholdProgress(),
      estimatedDuration: schedule.estimatedDuration,
      assignedToId: schedule.assignedToId,
      assignedToName,
      isActive: schedule.isActive,
      priority: schedule.priority,
      isDue: schedule.isDue(),
      createdAt: schedule.createdAt.toISOString(),
      updatedAt: schedule.updatedAt.toISOString(),
    };
  }
}
