/**
 * GetAssetsToolUseCase - Application Layer
 * Récupère les équipements via l'IA
 */

import { AssetRepository } from '@/core/domain/repositories/AssetRepository';
import { ToolExecutionResult } from '@/core/domain/services/AIToolService';
import { TermMappingService } from '@/core/application/services/TermMappingService';

export interface GetAssetsParams {
  status?: string; // Accepte n'importe quel string (sera normalisé)
  search?: string;
  limit?: number;
}

export class GetAssetsToolUseCase {
  constructor(private assetRepository: AssetRepository) {}

  async execute(params: GetAssetsParams): Promise<ToolExecutionResult> {
    try {
      const filters: any = {};

      if (params.status) {
        // Normaliser le statut avec les synonymes
        const normalizedStatus = TermMappingService.normalizeParameter(
          params.status,
          TermMappingService.ASSET_STATUS_MAPPING
        );
        
        if (normalizedStatus) {
          filters.status = normalizedStatus;
        }
      }

      if (params.search) {
        filters.OR = [
          { name: { contains: params.search, mode: 'insensitive' } },
          { serialNumber: { contains: params.search, mode: 'insensitive' } },
        ];
      }

      // Compter le total AVANT de limiter
      const totalCount = await this.assetRepository.count(filters);
      
      const limit = params.limit || 200;
      const assets = await this.assetRepository.findMany(
        filters,
        limit
      );

      const formatted = assets.map(asset => ({
        id: asset.id,
        name: asset.name,
        serialNumber: asset.serialNumber,
        status: asset.status,
        assetType: asset.assetType,
        location: asset.location,
      }));

      // Générer un résumé détaillé avec le total réel
      let summary = `Total: ${totalCount} équipement(s)`;
      
      // Indiquer si on ne montre qu'une partie
      if (totalCount > formatted.length) {
        summary += ` (affichage des ${formatted.length} premiers)`;
      }
      
      if (params.status) {
        const normalizedStatus = TermMappingService.normalizeParameter(
          params.status,
          TermMappingService.ASSET_STATUS_MAPPING
        );
        summary += ` avec statut "${normalizedStatus}"`;
      }
      if (params.search) {
        summary += ` correspondant à "${params.search}"`;
      }

      return {
        success: true,
        data: {
          assets: formatted,
          count: formatted.length,
          totalCount, // Total réel dans la BD
          summary,
          filters_applied: {
            status: params.status,
            search: params.search,
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
