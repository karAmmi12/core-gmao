import { WorkOrderRepository } from '@/core/domain/repositories/WorkOrderRepository';
import { IWorkOrderPartRepository } from '@/core/domain/repositories/WorkOrderPartRepository';

export interface CompleteWorkOrderByTechnicianInput {
  workOrderId: string;
  technicianId: string;
  actualDuration: number;
  notes?: string;
}

export class CompleteTechnicianWorkOrderUseCase {
  constructor(
    private workOrderRepo: WorkOrderRepository,
    private workOrderPartRepo?: IWorkOrderPartRepository
  ) {}

  async execute(input: CompleteWorkOrderByTechnicianInput): Promise<void> {
    const workOrder = await this.workOrderRepo.findById(input.workOrderId);
    
    if (!workOrder) {
      throw new Error('Intervention non trouvée.');
    }

    // Vérifier que le technicien est bien assigné à cette intervention
    if (workOrder.assignedToId !== input.technicianId) {
      throw new Error('Vous n\'êtes pas assigné à cette intervention.');
    }

    // Le technicien termine l'intervention
    workOrder.completeByTechnician(input.actualDuration);

    // Si des notes sont ajoutées, les inclure dans la description
    if (input.notes) {
      const currentDescription = workOrder.description || '';
      (workOrder as any).description = `${currentDescription}\n\n[Travail effectué]\n${input.notes}`.trim();
    }

    // Marquer toutes les pièces planifiées comme consommées avec calcul du coût
    if (this.workOrderPartRepo) {
      const parts = await this.workOrderPartRepo.findByWorkOrderId(input.workOrderId);
      for (const part of parts) {
        if (part.status === 'PLANNED' || part.status === 'RESERVED') {
          // Marquer comme consommé avec la quantité planifiée
          part.consume(part.quantityPlanned);
          await this.workOrderPartRepo.save(part);
        }
      }
    }

    await this.workOrderRepo.update(workOrder);
  }
}
