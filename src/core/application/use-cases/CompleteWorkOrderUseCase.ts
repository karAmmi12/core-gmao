import { WorkOrderRepository } from "@/core/domain/repositories/WorkOrderRepository";

export class CompleteWorkOrderUseCase {
  constructor(private workOrderRepo: WorkOrderRepository) {}

  async execute(workOrderId: string): Promise<void> {
    // 1. Récupérer le ticket
    const order = await this.workOrderRepo.findById(workOrderId);
    if (!order) {
      throw new Error("Intervention introuvable.");
    }

    // 2. Appliquer la règle métier (Changement d'état)
    order.markAsCompleted();

    // 3. Sauvegarder la modification
    await this.workOrderRepo.update(order);
  }
}