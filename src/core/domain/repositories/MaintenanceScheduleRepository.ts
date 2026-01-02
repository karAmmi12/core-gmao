import { MaintenanceSchedule } from '../entities/MaintenanceSchedule';

export interface MaintenanceScheduleRepository {
  save(schedule: MaintenanceSchedule): Promise<void>;
  findById(id: string): Promise<MaintenanceSchedule | null>;
  findByAssetId(assetId: string): Promise<MaintenanceSchedule[]>;
  findByAssignedTo(technicianId: string): Promise<MaintenanceSchedule[]>;
  findDueSchedules(): Promise<MaintenanceSchedule[]>;
  findAll(): Promise<MaintenanceSchedule[]>;
  update(schedule: MaintenanceSchedule): Promise<void>;
  delete(id: string): Promise<void>;
}
