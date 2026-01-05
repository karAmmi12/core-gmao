import { WorkOrderRepository } from '@/core/domain/repositories/WorkOrderRepository';
import { IWorkOrderPartRepository } from '@/core/domain/repositories/WorkOrderPartRepository';
import { TransactionManager } from '@/core/infrastructure/transaction/TransactionManager';
import { prisma } from '@/lib/prisma';

export interface ValidateWorkOrderByManagerInput {
  workOrderId: string;
  managerId: string;
  laborCost: number;
  materialCostAdjustment?: number; // Ajustement manuel optionnel du coût matériel
  validationNotes?: string;
}

export class ValidateManagerWorkOrderUseCase {
  constructor(
    private workOrderRepo: WorkOrderRepository,
    private workOrderPartRepo?: IWorkOrderPartRepository
  ) {}

  async execute(input: ValidateWorkOrderByManagerInput): Promise<void> {
    const workOrder = await this.workOrderRepo.findById(input.workOrderId);
    
    if (!workOrder) {
      throw new Error('Intervention non trouvée.');
    }

    // Calculer le coût matériel à partir des pièces consommées
    let materialCost = 0;
    if (this.workOrderPartRepo) {
      const parts = await this.workOrderPartRepo.findByWorkOrderId(input.workOrderId);
      // Sommer les totalPrice des pièces avec status CONSUMED
      materialCost = parts
        .filter(p => p.status === 'CONSUMED')
        .reduce((sum, p) => sum + p.totalPrice, 0);
    }

    // Appliquer un ajustement manuel si fourni (pour frais supplémentaires, remises, etc.)
    if (input.materialCostAdjustment !== undefined) {
      materialCost += input.materialCostAdjustment;
    }

    // Exécuter dans une transaction pour garantir l'atomicité
    await TransactionManager.executeWithRetry(async (tx) => {
      // Valider l'intervention avec les coûts
      workOrder.validateByManager(input.managerId, {
        laborCost: input.laborCost,
        materialCost,
      });

      // Si des notes de validation sont ajoutées
      let description = workOrder.description;
      if (input.validationNotes) {
        const currentDescription = workOrder.description || '';
        description = `${currentDescription}\n\n[Validation manager]\n${input.validationNotes}`.trim();
      }

      // Mettre à jour dans la transaction
      await tx.workOrder.update({
        where: { id: workOrder.id },
        data: {
          laborCost: workOrder.laborCost,
          materialCost: workOrder.materialCost,
          totalCost: workOrder.totalCost,
          approvedById: workOrder.approvedById,
          approvedAt: workOrder.approvedAt,
          description,
        }
      });
    });
  }
}
