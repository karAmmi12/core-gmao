import { WorkOrderRepository } from '../../domain/repositories/WorkOrderRepository';

export class ApproveWorkOrderUseCase {
  constructor(private workOrderRepository: WorkOrderRepository) {}

  /**
   * Approuve une intervention.
   * 
   * @param workOrderId L'ID de l'intervention à approuver
   * @param approverId L'ID de l'utilisateur (Manager/Admin) qui approuve
   * @throws Error si l'intervention n'existe pas ou n'est pas au statut PENDING
   */
  async execute(workOrderId: string, approverId: string): Promise<void> {
    // 1. Récupération de l'entité via le Repository
    const workOrder = await this.workOrderRepository.findById(workOrderId);

    if (!workOrder) {
      throw new Error(`Intervention introuvable : ${workOrderId}`);
    }

    // 2. Application de la logique métier (DOMAINE)
    // C'est l'entité qui sait "comment" elle doit être approuvée et quelles sont les règles
    workOrder.approve(approverId);

    // 3. Persistance de l'état modifié (INFRASTRUCTURE)
    await this.workOrderRepository.update(workOrder);
    
    // Note: On pourrait ajouter ici l'envoi de notifications (via un NotificationService injecté)
  }
}
