import { MaintenanceSchedule } from '@/core/domain/entities/MaintenanceSchedule';
import { MaintenanceScheduleRepository } from '@/core/domain/repositories/MaintenanceScheduleRepository';
import { AssetRepository } from '@/core/domain/repositories/AssetRepository';
import { MaintenanceScheduleUpdateInput } from '../validation/MaintenanceScheduleSchemas';

export class UpdateMaintenanceScheduleUseCase {
  constructor(
    private maintenanceScheduleRepository: MaintenanceScheduleRepository,
    private assetRepository: AssetRepository
  ) {}

  async execute(scheduleId: string, input: MaintenanceScheduleUpdateInput): Promise<MaintenanceSchedule> {
    // Vérifier que le planning existe
    const schedule = await this.maintenanceScheduleRepository.findById(scheduleId);
    if (!schedule) {
      throw new Error('Planning de maintenance introuvable');
    }

    // Vérifier que l'équipement existe si fourni (normalement l'assetId ne change pas)
    const asset = await this.assetRepository.findById(schedule.assetId);
    if (!asset) {
      throw new Error('Équipement introuvable');
    }

    // Mettre à jour le planning
    const updatedSchedule = schedule.update(input);
    
    // Sauvegarder
    await this.maintenanceScheduleRepository.update(updatedSchedule);

    return updatedSchedule;
  }
}
