import { WorkOrderRepository } from "@/core/domain/repositories/WorkOrderRepository";
import { OrderPriority } from "@/core/domain/entities/WorkOrder";

export interface UpdateWorkOrderInput {
  title?: string;
  description?: string;
  priority?: OrderPriority;
  scheduledAt?: Date;
  estimatedDuration?: number;
  assignedToId?: string | null;
}

export class UpdateWorkOrderUseCase {
  constructor(private workOrderRepo: WorkOrderRepository) {}

  async execute(workOrderId: string, data: UpdateWorkOrderInput): Promise<void> {
    const workOrder = await this.workOrderRepo.findById(workOrderId);
    
    if (!workOrder) {
      throw new Error("Intervention non trouvée.");
    }

    workOrder.update(data);
    await this.workOrderRepo.update(workOrder);
  }
}
