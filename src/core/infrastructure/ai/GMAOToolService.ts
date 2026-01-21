/**
 * GMAOToolService - Infrastructure Layer
 * Implémentation concrète des outils GMAO pour l'IA
 */

import {
  AIToolService,
  ToolDefinition,
  ToolExecutionContext,
  ToolExecutionResult,
} from '@/core/domain/services/AIToolService';
import { GetWorkOrdersToolUseCase } from '@/core/application/use-cases/tools/GetWorkOrdersToolUseCase';
import { GetAssetsToolUseCase } from '@/core/application/use-cases/tools/GetAssetsToolUseCase';
import { CreateWorkOrderToolUseCase } from '@/core/application/use-cases/tools/CreateWorkOrderToolUseCase';
import { GetAnalyticsToolUseCase } from '@/core/application/use-cases/tools/GetAnalyticsToolUseCase';
import { WorkOrderRepository } from '@/core/domain/repositories/WorkOrderRepository';
import { AssetRepository } from '@/core/domain/repositories/AssetRepository';
import { TermMappingService } from '@/core/application/services/TermMappingService';

export class GMAOToolService implements AIToolService {
  constructor(
    private workOrderRepository: WorkOrderRepository,
    private assetRepository: AssetRepository
  ) {}

  getAvailableTools(userRole: string): ToolDefinition[] {
    const tools: ToolDefinition[] = [
      {
        name: 'get_work_orders',
        description: 'Récupère la liste des ordres de travail selon des filtres. Accepte les synonymes en français (ex: "en panne", "terminé", "urgent"). Retourne automatiquement jusqu\'à 200 résultats.',
        parameters: [
          {
            name: 'status',
            type: 'string',
            description: TermMappingService.generateToolDescription(
              'Statut des ordres',
              TermMappingService.WORK_ORDER_STATUS_MAPPING
            ),
            required: false,
          },
          {
            name: 'assignedToMe',
            type: 'boolean',
            description: 'Filtrer uniquement mes ordres assignés',
            required: false,
          },
          {
            name: 'technicianName',
            type: 'string',
            description: 'Nom du technicien (ex: "Jean Dupont", "Marie"). Recherche par correspondance partielle.',
            required: false,
          },
          {
            name: 'priority',
            type: 'string',
            description: TermMappingService.generateToolDescription(
              'Priorité',
              TermMappingService.PRIORITY_MAPPING
            ),
            required: false,
          },
        ],
      },
      {
        name: 'get_assets',
        description: 'Récupère la liste des équipements/actifs. Accepte les synonymes en français (ex: "en panne", "cassé", "hors service"). Retourne automatiquement jusqu\'à 200 résultats.',
        parameters: [
          {
            name: 'status',
            type: 'string',
            description: TermMappingService.generateToolDescription(
              'Statut',
              TermMappingService.ASSET_STATUS_MAPPING
            ),
            required: false,
          },
          {
            name: 'search',
            type: 'string',
            description: 'Recherche par nom ou numéro de série',
            required: false,
          },
        ],
      },
      {
        name: 'get_analytics',
        description: 'Récupère des statistiques et analyses',
        parameters: [
          {
            name: 'metric',
            type: 'string',
            description: 'Type de métrique à récupérer',
            required: true,
            enum: ['work_orders_summary', 'assets_summary', 'top_assets_with_issues'],
          },
        ],
      },
    ];

    // Ajouter l'outil de création uniquement pour les rôles autorisés
    if (['ADMIN', 'MANAGER', 'TECHNICIAN'].includes(userRole)) {
      tools.push({
        name: 'create_work_order',
        description: 'Crée un nouvel ordre de travail',
        parameters: [
          {
            name: 'title',
            type: 'string',
            description: 'Titre de l\'ordre de travail',
            required: true,
          },
          {
            name: 'description',
            type: 'string',
            description: 'Description détaillée du problème ou de la tâche',
            required: true,
          },
          {
            name: 'assetId',
            type: 'string',
            description: 'ID de l\'équipement concerné',
            required: true,
          },
          {
            name: 'priority',
            type: 'string',
            description: 'Priorité : LOW, MEDIUM, HIGH, URGENT',
            required: true,
            enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
          },
          {
            name: 'type',
            type: 'string',
            description: 'Type : CORRECTIVE ou PREVENTIVE (défaut: CORRECTIVE)',
            required: false,
            enum: ['CORRECTIVE', 'PREVENTIVE'],
          },
        ],
      });
    }

    return tools;
  }

  async executeTool(
    toolName: string,
    parameters: Record<string, any>,
    context: ToolExecutionContext
  ): Promise<ToolExecutionResult> {
    console.log(`📋 GMAOToolService.executeTool: ${toolName}`, { parameters, context });
    
    // Normaliser les paramètres (convertir les strings en numbers si nécessaire)
    const normalizedParams = this.normalizeParameters(parameters);
    console.log(`🔄 Normalized parameters:`, normalizedParams);
    
    try {
      switch (toolName) {
        case 'get_work_orders': {
          console.log('🔍 Executing get_work_orders use case');
          const useCase = new GetWorkOrdersToolUseCase(
            this.workOrderRepository,
            this.assetRepository,
            context.userId
          );
          const result = await useCase.execute(normalizedParams);
          console.log('✅ get_work_orders result:', result);
          return result;
        }

        case 'get_assets': {
          const useCase = new GetAssetsToolUseCase(this.assetRepository);
          return await useCase.execute(normalizedParams);
        }

        case 'create_work_order': {
          const useCase = new CreateWorkOrderToolUseCase(
            this.workOrderRepository,
            context.userId,
            context.userRole
          );
          return await useCase.execute(normalizedParams as any);
        }

        case 'get_analytics': {
          const useCase = new GetAnalyticsToolUseCase(
            this.workOrderRepository,
            this.assetRepository
          );
          return await useCase.execute(normalizedParams as any);
        }

        default:
          return {
            success: false,
            error: `Outil inconnu: ${toolName}`,
          };
      }
    } catch (error: any) {
      return {
        success: false,
        error: `Erreur d'exécution: ${error.message}`,
      };
    }
  }

  /**
   * Normalise les paramètres (convertit les strings en numbers, etc.)
   */
  private normalizeParameters(params: Record<string, any>): Record<string, any> {
    const normalized: Record<string, any> = {};

    for (const [key, value] of Object.entries(params)) {
      // Convertir "limit" en number si c'est une string
      if (key === 'limit' && typeof value === 'string') {
        normalized[key] = parseInt(value, 10);
      } 
      // Convertir les autres champs numériques si nécessaire
      else if ((key === 'estimatedDuration' || key === 'estimatedCost') && typeof value === 'string') {
        const parsed = parseFloat(value);
        normalized[key] = isNaN(parsed) ? value : parsed;
      }
      else {
        normalized[key] = value;
      }
    }

    return normalized;
  }
}
