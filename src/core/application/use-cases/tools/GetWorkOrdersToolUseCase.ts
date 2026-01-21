/**
 * GetWorkOrdersToolUseCase - Application Layer
 * Récupère les ordres de travail via l'IA
 */

import { WorkOrderRepository } from '@/core/domain/repositories/WorkOrderRepository';
import { AssetRepository } from '@/core/domain/repositories/AssetRepository';
import { ToolExecutionResult } from '@/core/domain/services/AIToolService';
import { TermMappingService } from '@/core/application/services/TermMappingService';

export interface GetWorkOrdersParams {
  status?: string; // Accepte n'importe quel string (sera normalisé)
  assignedToMe?: boolean;
  technicianName?: string; // Recherche par nom de technicien
  priority?: string; // Accepte n'importe quel string (sera normalisé)
  limit?: number;
}

export class GetWorkOrdersToolUseCase {
  constructor(
    private workOrderRepository: WorkOrderRepository,
    private assetRepository: AssetRepository,
    private userId: string
  ) {}

  async execute(params: GetWorkOrdersParams): Promise<ToolExecutionResult> {
    try {
      const filters: any = {};

      if (params.status) {
        // Normaliser le statut avec les synonymes
        const normalizedStatus = TermMappingService.normalizeParameter(
          params.status,
          TermMappingService.WORK_ORDER_STATUS_MAPPING
        );
        
        if (normalizedStatus) {
          filters.status = normalizedStatus;
        }
      }

      if (params.assignedToMe) {
        // Correction: assignedToId est un champ direct, pas une relation many
        filters.assignedToId = this.userId;
      }

      if (params.technicianName) {
        // Recherche par nom de technicien
        filters.assignedTo = {
          name: {
            contains: params.technicianName,
            mode: 'insensitive'
          }
        };
      }

      if (params.priority) {
        // Normaliser la priorité avec les synonymes
        const normalizedPriority = TermMappingService.normalizeParameter(
          params.priority,
          TermMappingService.PRIORITY_MAPPING
        );
        
        if (normalizedPriority) {
          filters.priority = normalizedPriority;
        }
      }

      // Compter le total AVANT de limiter
      const totalCount = await this.workOrderRepository.count(filters);

      const limit = params.limit || 200;
      const workOrders = await this.workOrderRepository.findMany(
        filters,
        limit
      );

      // Récupérer les noms des assets
      const assetIds = [...new Set(workOrders.map(wo => wo.assetId))];
      const assets = await Promise.all(
        assetIds.map(id => this.assetRepository.findById(id))
      );
      const assetMap = new Map(
        assets.filter(a => a !== null).map(a => [a!.id, a!.name])
      );

      // Formater pour une réponse lisible par l'IA
      const formatted = workOrders.map(wo => ({
        id: wo.id,
        title: wo.title,
        description: wo.description,
        status: wo.status,
        priority: wo.priority,
        type: wo.type,
        createdAt: wo.createdAt.toISOString(),
        assetName: assetMap.get(wo.assetId) || 'N/A',
      }));

      // Générer un résumé détaillé avec le total réel
      let summary = `Total: ${totalCount} ordre(s) de travail`;
      
      // Indiquer si on ne montre qu'une partie
      if (totalCount > formatted.length) {
        summary += ` (affichage des ${formatted.length} premiers)`;
      }
      
      if (params.status) {
        const normalizedStatus = TermMappingService.normalizeParameter(
          params.status,
          TermMappingService.WORK_ORDER_STATUS_MAPPING
        );
        summary += ` avec statut "${normalizedStatus}"`;
      }
      if (params.priority) {
        const normalizedPriority = TermMappingService.normalizeParameter(
          params.priority,
          TermMappingService.PRIORITY_MAPPING
        );
        summary += ` avec priorité "${normalizedPriority}"`;
      }
      if (params.assignedToMe) {
        summary += ' (assignés à moi)';
      }

      return {
        success: true,
        data: {
          workOrders: formatted,
          count: formatted.length,
          totalCount, // Total réel dans la BD
          summary,
          filters_applied: {
            status: params.status,
            priority: params.priority,
            assignedToMe: params.assignedToMe,
          },
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
