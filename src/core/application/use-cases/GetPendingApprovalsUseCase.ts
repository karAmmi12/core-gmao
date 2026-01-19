import { WorkOrderSummary, WorkOrderRepository } from '../../domain/repositories/WorkOrderRepository';

export class GetPendingApprovalsUseCase {
  constructor(private workOrderRepository: WorkOrderRepository) {}

  async execute(): Promise<WorkOrderSummary[]> {
    // Récupérer toutes les interventions en attente via le repository
    return await this.workOrderRepository.findPending();
  }
}
