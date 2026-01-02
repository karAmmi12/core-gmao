import { WorkOrderRepository } from "@/core/domain/repositories/WorkOrderRepository";

export class StartWorkOrderUseCase {
  constructor(private workOrderRepo: WorkOrderRepository) {}

  async execute(workOrderId: string): Promise<void> {
    const workOrder = await this.workOrderRepo.findById(workOrderId);
    
    if (!workOrder) {
      throw new Error("Intervention non trouvée.");
    }

    workOrder.startWork();
    await this.workOrderRepo.update(workOrder);
  }
}
