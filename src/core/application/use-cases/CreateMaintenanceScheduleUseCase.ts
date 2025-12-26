import { MaintenanceSchedule } from '@/core/domain/entities/MaintenanceSchedule';
import { MaintenanceScheduleRepository } from '@/core/domain/repositories/MaintenanceScheduleRepository';
import { AssetRepository } from '@/core/domain/repositories/AssetRepository';
import { MaintenanceScheduleCreateInput } from '../validation/MaintenanceScheduleSchemas';

export class CreateMaintenanceScheduleUseCase {
  constructor(
    private maintenanceScheduleRepository: MaintenanceScheduleRepository,
    private assetRepository: AssetRepository
  ) {}

  async execute(input: MaintenanceScheduleCreateInput): Promise<MaintenanceSchedule> {
    // Verify asset exists
    const asset = await this.assetRepository.findById(input.assetId);
    if (!asset) {
      throw new Error('Asset not found');
    }

    // Create maintenance schedule
    const schedule = MaintenanceSchedule.create({
      assetId: input.assetId,
      title: input.title,
      description: input.description,
      frequency: input.frequency,
      intervalValue: input.intervalValue,
      nextDueDate: input.nextDueDate,
      estimatedDuration: input.estimatedDuration,
      assignedToId: input.assignedToId,
      priority: input.priority,
    });

    await this.maintenanceScheduleRepository.save(schedule);

    return schedule;
  }
}
