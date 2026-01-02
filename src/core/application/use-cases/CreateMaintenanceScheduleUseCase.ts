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
      throw new Error('Équipement non trouvé');
    }

    // Create maintenance schedule with all fields
    const schedule = MaintenanceSchedule.create({
      assetId: input.assetId,
      title: input.title,
      description: input.description,
      maintenanceType: input.maintenanceType,
      triggerType: input.triggerType,
      // Time-based fields
      frequency: input.frequency,
      intervalValue: input.intervalValue,
      nextDueDate: input.nextDueDate,
      // Threshold-based fields
      thresholdMetric: input.thresholdMetric,
      thresholdValue: input.thresholdValue,
      thresholdUnit: input.thresholdUnit,
      currentValue: input.currentValue,
      // Common fields
      estimatedDuration: input.estimatedDuration as number | undefined,
      assignedToId: input.assignedToId,
      priority: input.priority,
    });

    await this.maintenanceScheduleRepository.save(schedule);

    return schedule;
  }
}
