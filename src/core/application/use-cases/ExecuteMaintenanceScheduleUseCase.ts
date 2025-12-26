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
      throw new Error('Maintenance schedule not found');
    }

    if (!schedule.isActive) {
      throw new Error('Maintenance schedule is not active');
    }

    const now = executedAt || new Date();

    // Create a work order from the schedule
    const workOrder = WorkOrder.create({
      assetId: schedule.assetId,
      title: `[Maintenance Préventive] ${schedule.title}`,
      description: schedule.description || `Intervention de maintenance préventive`,
      type: 'PREVENTIVE',
      priority: schedule.priority,
      status: 'PENDING',
      scheduledDate: now,
      estimatedDuration: schedule.estimatedDuration,
      assignedToId: schedule.assignedToId,
    });

    await this.workOrderRepository.save(workOrder);

    // Mark the schedule as executed and calculate next due date
    const updatedSchedule = schedule.markAsExecuted(now);
    await this.maintenanceScheduleRepository.update(updatedSchedule);

    return workOrder;
  }
}
