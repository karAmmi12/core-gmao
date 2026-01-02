import { MaintenanceSchedule } from '@/core/domain/entities/MaintenanceSchedule';
import { MaintenanceScheduleRepository } from '@/core/domain/repositories/MaintenanceScheduleRepository';
import { WorkOrder } from '@/core/domain/entities/WorkOrder';
import { WorkOrderRepository } from '@/core/domain/repositories/WorkOrderRepository';

export class ExecuteMaintenanceScheduleUseCase {
  constructor(
    private maintenanceScheduleRepository: MaintenanceScheduleRepository,
    private workOrderRepository: WorkOrderRepository
  ) {}

  async execute(scheduleId: string, executedAt?: Date): Promise<WorkOrder> {
    // Find the schedule
    const schedule = await this.maintenanceScheduleRepository.findById(scheduleId);
    if (!schedule) {
      throw new Error('Planning de maintenance non trouvé');
    }

    if (!schedule.isActive) {
      throw new Error('Ce planning de maintenance n\'est pas actif');
    }

    const now = executedAt || new Date();
    
    // Déterminer le type d'intervention selon le type de déclenchement
    const workOrderType = schedule.maintenanceType; // PREVENTIVE ou PREDICTIVE
    const titlePrefix = schedule.triggerType === 'TIME_BASED' 
      ? '[Maintenance Préventive]' 
      : '[Maintenance Prédictive]';
    
    // Description enrichie pour les maintenances prédictives
    let description = schedule.description || '';
    if (schedule.triggerType === 'THRESHOLD_BASED') {
      description = `${description}\n\nSeuil atteint: ${schedule.currentValue}/${schedule.thresholdValue} ${schedule.thresholdUnit || ''} (${schedule.thresholdMetric})`;
    }

    // Create a work order from the schedule
    const workOrder = WorkOrder.create(
      `${titlePrefix} ${schedule.title}`,
      schedule.priority,
      schedule.assetId,
      description.trim() || `Intervention de maintenance ${workOrderType.toLowerCase()}`,
      {
        scheduledAt: now,
        estimatedDuration: schedule.estimatedDuration,
        assignedToId: schedule.assignedToId,
      },
      workOrderType,
      schedule.id // Lien vers le MaintenanceSchedule
    );

    await this.workOrderRepository.save(workOrder);

    // Mark the schedule as executed
    // - Pour TIME_BASED: calcule la prochaine date
    // - Pour THRESHOLD_BASED: remet le compteur à zéro
    const updatedSchedule = schedule.markAsExecuted(now);
    await this.maintenanceScheduleRepository.update(updatedSchedule);

    return workOrder;
  }
}
