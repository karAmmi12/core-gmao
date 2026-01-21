/**
 * CreateWorkOrderToolUseCase - Application Layer
 * Crée un ordre de travail via l'IA
 */

import { WorkOrderRepository } from '@/core/domain/repositories/WorkOrderRepository';
import { WorkOrder } from '@/core/domain/entities/WorkOrder';
import { ToolExecutionResult } from '@/core/domain/services/AIToolService';

export interface CreateWorkOrderParams {
  title: string;
  description: string;
  assetId: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH'; // Retiré URGENT qui n'existe pas dans OrderPriority
  type?: 'CORRECTIVE' | 'PREVENTIVE';
}

export class CreateWorkOrderToolUseCase {
  constructor(
    private workOrderRepository: WorkOrderRepository,
    private userId: string,
    private userRole: string
  ) {}

  async execute(params: CreateWorkOrderParams): Promise<ToolExecutionResult> {
    try {
      // Vérifier les permissions (seulement ADMIN, MANAGER, TECHNICIAN)
      if (!['ADMIN', 'MANAGER', 'TECHNICIAN'].includes(this.userRole)) {
        return {
          success: false,
          error: 'Permission refusée : vous ne pouvez pas créer d\'ordres de travail',
        };
      }

      const workOrder: Partial<WorkOrder> = {
        title: params.title,
        description: params.description,
        assetId: params.assetId,
        priority: params.priority,
        type: params.type || 'CORRECTIVE',
        status: 'PENDING',
        createdAt: new Date(),
      };

      await this.workOrderRepository.save(workOrder as WorkOrder);

      return {
        success: true,
        data: {
          message: `Ordre de travail "${params.title}" créé avec succès`,
          summary: `Ordre de travail "${params.title}" créé avec succès`,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}
