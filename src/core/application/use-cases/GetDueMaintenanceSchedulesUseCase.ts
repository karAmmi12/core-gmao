import { MaintenanceSchedule } from '@/core/domain/entities/MaintenanceSchedule';
import { MaintenanceScheduleRepository } from '@/core/domain/repositories/MaintenanceScheduleRepository';

export class GetDueMaintenanceSchedulesUseCase {
  constructor(private maintenanceScheduleRepository: MaintenanceScheduleRepository) {}

  async execute(): Promise<MaintenanceSchedule[]> {
    const dueSchedules = await this.maintenanceScheduleRepository.findDueSchedules();
    return dueSchedules;
  }
}
