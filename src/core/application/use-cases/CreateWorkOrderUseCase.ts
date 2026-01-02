import { WorkOrder, OrderPriority, MaintenanceType, WorkOrderSchedule } from "@/core/domain/entities/WorkOrder";
import { WorkOrderRepository } from "@/core/domain/repositories/WorkOrderRepository";
import { TechnicianRepository } from "@/core/domain/repositories/TechnicianRepository";
import { PartRepository } from "@/core/domain/repositories/PartRepository";
import { PartRequest } from "@/core/domain/entities/PartRequest";
import type { IPartRequestRepository } from "@/core/domain/repositories/PartRequestRepository";
import { v4 as uuidv4 } from 'uuid';

export interface WorkOrderPartInput {
  partId: string;
  quantity: number;
  unitPrice: number;
}

export interface CreateWorkOrderInput {
  title: string;
  description?: string;
  priority: OrderPriority;
  type?: MaintenanceType;
  assetId: string;
  scheduleId?: string;
  schedule?: WorkOrderSchedule;
  parts?: WorkOrderPartInput[];
  requestedById?: string; // ID de l'utilisateur qui crée l'intervention
  estimatedCost?: number; // Coût estimé pour déclencher l'approbation
  createdByRole?: 'ADMIN' | 'MANAGER' | 'TECHNICIAN' | 'STOCK_MANAGER' | 'OPERATOR' | 'VIEWER'; // Rôle pour approbation
}

export class CreateWorkOrderUseCase {
  constructor(
    private workOrderRepo: WorkOrderRepository,
    private technicianRepo?: TechnicianRepository,
    private partRepo?: PartRepository,
    private partRequestRepo?: IPartRequestRepository
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

    // Vérifier que les pièces existent (pas de vérification de stock, car c'est une demande)
    if (input.parts && input.parts.length > 0 && this.partRepo) {
      for (const partInput of input.parts) {
        const part = await this.partRepo.findById(partInput.partId);
        if (!part) {
          throw new Error(`La pièce ${partInput.partId} n'existe pas`);
        }
      }
    }

    const order = WorkOrder.create(
      input.title,
      input.priority,
      input.assetId,
      input.description,
      input.schedule,
      input.type || 'CORRECTIVE',
      input.scheduleId,
      input.estimatedCost,
      input.createdByRole
    );
    
    await this.workOrderRepo.save(order);
    console.log("✅ WorkOrder saved:", order.id);

    // Créer des demandes de pièces (PartRequest) pour validation par le manager
    // Le stock ne sera décrémenté que lors de la livraison après approbation
    if (input.parts && input.parts.length > 0 && this.partRequestRepo && input.requestedById) {
      for (const partInput of input.parts) {
        console.log("📦 Creating part request for:", partInput.partId, "qty:", partInput.quantity);
        
        // Déterminer l'urgence en fonction de la priorité de l'OT
        const urgency = input.priority === 'HIGH' ? 'HIGH' : 'NORMAL';
        
        // Créer une demande de pièce liée à l'OT
        const partRequest = PartRequest.create({
          id: uuidv4(),
          partId: partInput.partId,
          quantity: partInput.quantity,
          requestedById: input.requestedById,
          reason: `Pièce nécessaire pour l'intervention: ${input.title}`,
          urgency,
          workOrderId: order.id,
          assetId: input.assetId,
        });
        
        await this.partRequestRepo.save(partRequest);
        console.log("✅ Part request created:", partRequest.id);
        
        // Enregistrer aussi le lien WorkOrderPart (avec statut PLANNED)
        await this.workOrderRepo.addPart(order.id, partInput.partId, partInput.quantity, partInput.unitPrice);
        console.log("✅ Part linked to work order");
      }
    } else if (input.parts && input.parts.length > 0) {
      console.log("⚠️ Cannot create part requests - missing partRequestRepo or requestedById");
    }

    return { id: order.id };
  }
}