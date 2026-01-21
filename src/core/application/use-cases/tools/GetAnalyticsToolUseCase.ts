/**
 * GetAnalyticsToolUseCase - Application Layer
 * Récupère des statistiques et analytics via l'IA
 */

import { WorkOrderRepository } from '@/core/domain/repositories/WorkOrderRepository';
import { AssetRepository } from '@/core/domain/repositories/AssetRepository';
import { ToolExecutionResult } from '@/core/domain/services/AIToolService';

export interface GetAnalyticsParams {
  metric: 'work_orders_summary' | 'assets_summary' | 'top_assets_with_issues';
}

export class GetAnalyticsToolUseCase {
  constructor(
    private workOrderRepository: WorkOrderRepository,
    private assetRepository: AssetRepository
  ) {}

  async execute(params: GetAnalyticsParams): Promise<ToolExecutionResult> {
    try {
      switch (params.metric) {
        case 'work_orders_summary':
          return await this.getWorkOrdersSummary();
        
        case 'assets_summary':
          return await this.getAssetsSummary();
        
        case 'top_assets_with_issues':
          return await this.getTopAssetsWithIssues();
        
        default:
          return {
            success: false,
            error: `Métrique inconnue: ${params.metric}`,
          };
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  private async getWorkOrdersSummary(): Promise<ToolExecutionResult> {
    const pending = await this.workOrderRepository.findMany({ status: 'PENDING' }, 100);
    const inProgress = await this.workOrderRepository.findMany({ status: 'IN_PROGRESS' }, 100);
    const completed = await this.workOrderRepository.findMany({ status: 'COMPLETED' }, 100);

    return {
      success: true,
      data: {
        pending: pending.length,
        inProgress: inProgress.length,
        completed: completed.length,
        total: pending.length + inProgress.length + completed.length,
        summary: `${pending.length} en attente, ${inProgress.length} en cours, ${completed.length} terminés`,
      },
    };
  }

  private async getAssetsSummary(): Promise<ToolExecutionResult> {
    const operational = await this.assetRepository.findMany({ status: 'OPERATIONAL' }, 100);
    const down = await this.assetRepository.findMany({ status: 'DOWN' }, 100);
    const maintenance = await this.assetRepository.findMany({ status: 'MAINTENANCE' }, 100);

    return {
      success: true,
      data: {
        operational: operational.length,
        down: down.length,
        maintenance: maintenance.length,
        total: operational.length + down.length + maintenance.length,
        summary: `${operational.length} opérationnels, ${down.length} en panne, ${maintenance.length} en maintenance`,
      },
    };
  }

  private async getTopAssetsWithIssues(): Promise<ToolExecutionResult> {
    // Récupérer les équipements avec le plus d'ordres de travail
    const workOrders = await this.workOrderRepository.findMany({}, 1000);
    
    const assetCounts = workOrders.reduce((acc, wo) => {
      if (wo.assetId) {
        acc[wo.assetId] = (acc[wo.assetId] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const sorted = Object.entries(assetCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10);

    const topAssets = await Promise.all(
      sorted.map(async ([assetId, count]) => {
        const asset = await this.assetRepository.findById(assetId);
        return {
          assetId,
          assetName: asset?.name || 'Inconnu',
          issuesCount: count,
        };
      })
    );

    return {
      success: true,
      data: {
        topAssets,
        summary: `Top ${topAssets.length} équipements avec le plus de problèmes`,
      },
    };
  }
}
