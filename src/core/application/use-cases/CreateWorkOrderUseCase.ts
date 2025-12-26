import { WorkOrder, OrderPriority, WorkOrderSchedule } from "@/core/domain/entities/WorkOrder";
import { WorkOrderRepository } from "@/core/domain/repositories/WorkOrderRepository";
import { TechnicianRepository } from "@/core/domain/repositories/TechnicianRepository";
import { PartRepository } from "@/core/domain/repositories/PartRepository";
import { StockMovementRepository } from "@/core/domain/repositories/StockMovementRepository";
import { StockMovement } from "@/core/domain/entities/StockMovement";

export interface WorkOrderPartInput {
  partId: string;
  quantity: number;
  unitPrice: number;
}

export interface CreateWorkOrderInput {
  title: string;
  description?: string;
  priority: OrderPriority;
  assetId: string;
  schedule?: WorkOrderSchedule;
  parts?: WorkOrderPartInput[];
}

export class CreateWorkOrderUseCase {
  constructor(
    private workOrderRepo: WorkOrderRepository,
    private technicianRepo?: TechnicianRepository,
    private partRepo?: PartRepository,
    private stockMovementRepo?: StockMovementRepository
  ) {}

  async execute(input: CreateWorkOrderInput) {
    // Si un technicien est assigné, vérifier qu'il existe
    if (input.schedule?.assignedToId && this.technicianRepo) {
      const tech = await this.technicianRepo.findById(input.schedule.assignedToId);
      if (!tech) {
        throw new Error("Le technicien spécifié n'existe pas");
      }
      if (!tech.isActive) {
        throw new Error("Le technicien spécifié n'est pas disponible");
      }
    }

    // Vérifier les pièces et le stock disponible
    if (input.parts && input.parts.length > 0 && this.partRepo) {
      for (const partInput of input.parts) {
        const part = await this.partRepo.findById(partInput.partId);
        if (!part) {
          throw new Error(`La pièce ${partInput.partId} n'existe pas`);
        }
        if (!part.canFulfill(partInput.quantity)) {
          throw new Error(`Stock insuffisant pour ${part.name}. Disponible: ${part.quantityInStock}, Demandé: ${partInput.quantity}`);
        }
      }
    }

    const order = WorkOrder.create(
      input.title,
      input.priority,
      input.assetId,
      input.description,
      input.schedule
    );
    
    await this.workOrderRepo.save(order);

    // Enregistrer les pièces utilisées et créer les mouvements de stock
    if (input.parts && input.parts.length > 0 && this.partRepo && this.stockMovementRepo) {
      for (const partInput of input.parts) {
        // Créer le lien WorkOrderPart dans le repository
        await this.workOrderRepo.addPart(order.id, partInput.partId, partInput.quantity, partInput.unitPrice);

        // Créer un mouvement de stock (sortie)
        const movement = StockMovement.create({
          partId: partInput.partId,
          type: 'OUT',
          quantity: partInput.quantity,
          reason: `Utilisé pour intervention: ${input.title}`,
          reference: order.id,
        });
        await this.stockMovementRepo.save(movement);

        // Mettre à jour le stock
        const part = await this.partRepo.findById(partInput.partId);
        if (part) {
          await this.partRepo.updateStock(partInput.partId, part.quantityInStock - partInput.quantity);
        }
      }
    }

    return { id: order.id };
  }
}