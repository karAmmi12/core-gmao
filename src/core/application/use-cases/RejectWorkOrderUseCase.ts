import { WorkOrderRepository } from '../../domain/repositories/WorkOrderRepository';

export class RejectWorkOrderUseCase {
  constructor(private workOrderRepository: WorkOrderRepository) {}

  /**
   * Rejette une intervention.
   * 
   * @param workOrderId L'ID de l'intervention à rejeter
   * @param rejectorId L'ID de l'utilisateur (Manager/Admin) qui rejette
   * @param reason La raison du rejet
   * @throws Error si l'intervention n'existe pas ou n'est pas au statut PENDING
   */
  async execute(workOrderId: string, rejectorId: string, reason: string): Promise<void> {
    // 1. Récupération de l'entité
    const workOrder = await this.workOrderRepository.findById(workOrderId);

    if (!workOrder) {
      throw new Error(`Intervention introuvable : ${workOrderId}`);
    }

    // 2. Logique métier
    workOrder.reject(rejectorId, reason);

    // 3. Persistance
    await this.workOrderRepository.update(workOrder);
  }
}
