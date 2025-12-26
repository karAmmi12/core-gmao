import { MaintenanceSchedule, MaintenanceFrequency } from '@/core/domain/entities/MaintenanceSchedule';

export interface MaintenanceScheduleDTO {
  id: string;
  assetId: string;
  assetName?: string;
  title: string;
  description?: string;
  frequency: MaintenanceFrequency;
  intervalValue: number;
  lastExecutedAt?: string;
  nextDueDate: string;
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
      frequency: schedule.frequency,
      intervalValue: schedule.intervalValue,
      lastExecutedAt: schedule.lastExecutedAt?.toISOString(),
      nextDueDate: schedule.nextDueDate.toISOString(),
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
