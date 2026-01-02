import { WorkOrderRepository } from "@/core/domain/repositories/WorkOrderRepository";
import { IWorkOrderPartRepository } from "@/core/domain/repositories/WorkOrderPartRepository";

export class CompleteWorkOrderUseCase {
  constructor(
    private workOrderRepo: WorkOrderRepository,
    private workOrderPartRepo?: IWorkOrderPartRepository
  ) {}

  async execute(workOrderId: string): Promise<void> {
    // 1. Récupérer le ticket
    const order = await this.workOrderRepo.findById(workOrderId);
    if (!order) {
      throw new Error("Intervention introuvable.");
    }

    // 2. Appliquer la règle métier (Changement d'état)
    order.markAsCompleted();

    // 3. Marquer toutes les pièces planifiées comme consommées
    if (this.workOrderPartRepo) {
      const parts = await this.workOrderPartRepo.findByWorkOrderId(workOrderId);
      for (const part of parts) {
        if (part.status === 'PLANNED' || part.status === 'RESERVED') {
          // Marquer comme consommé avec la quantité planifiée
          part.consume(part.quantityPlanned);
          await this.workOrderPartRepo.save(part);
        }
      }
    }

    // 4. Sauvegarder la modification
    await this.workOrderRepo.update(order);
  }
}