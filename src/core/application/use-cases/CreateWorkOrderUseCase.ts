import { WorkOrder, OrderPriority } from "@/core/domain/entities/WorkOrder";
import { WorkOrderRepository } from "@/core/domain/repositories/WorkOrderRepository";

export class CreateWorkOrderUseCase {
  constructor(private workOrderRepo: WorkOrderRepository) {}

  async execute(title: string, priority: OrderPriority, assetId: string) {
    const order = WorkOrder.create(title, priority, assetId);
    await this.workOrderRepo.save(order);
    return { id: order.id };
  }
}