import { WorkOrderRepository } from "@/core/domain/repositories/WorkOrderRepository";

export class CancelWorkOrderUseCase {
  constructor(private workOrderRepo: WorkOrderRepository) {}

  async execute(workOrderId: string, reason?: string): Promise<void> {
    const workOrder = await this.workOrderRepo.findById(workOrderId);
    
    if (!workOrder) {
      throw new Error("Intervention non trouvée.");
    }

    workOrder.cancel(reason);
    await this.workOrderRepo.update(workOrder);
  }
}
