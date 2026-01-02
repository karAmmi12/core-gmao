import { MaintenanceSchedule } from '@/core/domain/entities/MaintenanceSchedule';
import { MaintenanceScheduleRepository } from '@/core/domain/repositories/MaintenanceScheduleRepository';

interface UpdateReadingInput {
  scheduleId: string;
  currentValue: number;
}

export class UpdateMaintenanceReadingUseCase {
  constructor(
    private maintenanceScheduleRepository: MaintenanceScheduleRepository
  ) {}

  async execute(input: UpdateReadingInput): Promise<MaintenanceSchedule> {
    const schedule = await this.maintenanceScheduleRepository.findById(input.scheduleId);
    
    if (!schedule) {
      throw new Error('Planning de maintenance non trouvé');
    }

    if (schedule.triggerType !== 'THRESHOLD_BASED') {
      throw new Error('Ce planning n\'est pas basé sur un seuil');
    }

    // Update the current value
    const updatedSchedule = schedule.updateCurrentValue(input.currentValue);
    
    await this.maintenanceScheduleRepository.update(updatedSchedule);

    return updatedSchedule;
  }
}
