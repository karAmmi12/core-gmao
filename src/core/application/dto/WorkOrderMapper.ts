import { WorkOrder } from '@/core/domain/entities/WorkOrder';
import { WorkOrderDTO } from './WorkOrderDTO';

export class WorkOrderMapper {
  static toDTO(workOrder: WorkOrder): WorkOrderDTO {
    return {
      id: workOrder.id,
      title: workOrder.title,
      description: workOrder.description,
      status: workOrder.status,
      priority: workOrder.priority,
      assetId: workOrder.assetId,
      createdAt: workOrder.createdAt.toISOString(),
      scheduledAt: workOrder.scheduledAt?.toISOString(),
      startedAt: workOrder.startedAt?.toISOString(),
      completedAt: workOrder.completedAt?.toISOString(),
      estimatedDuration: workOrder.estimatedDuration,
      actualDuration: workOrder.actualDuration,
      assignedToId: workOrder.assignedToId,
      laborCost: workOrder.laborCost,
      materialCost: workOrder.materialCost,
      totalCost: workOrder.totalCost,
    };
  }

  static toDTOList(workOrders: WorkOrder[]): WorkOrderDTO[] {
    return workOrders.map((wo) => this.toDTO(wo));
  }
}
