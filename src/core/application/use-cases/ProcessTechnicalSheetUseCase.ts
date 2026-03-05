/**
 * ProcessTechnicalSheetUseCase - Application Layer
 * Traite une fiche technique et extrait les données d'équipement
 */

import {
  DocumentProcessingService,
  ExtractedAssetData,
} from '@/core/domain/services/DocumentProcessingService';
import { AssetRepository } from '@/core/domain/repositories/AssetRepository';
import { Asset, AssetType } from '@/core/domain/entities/Asset';

export interface ProcessTechnicalSheetInput {
  fileUrl: string;
}

export interface ProcessTechnicalSheetOutput {
  extractedData: ExtractedAssetData;
  existingAsset?: {
    id: string;
    name: string;
    serialNumber?: string;
  };
  canCreateAsset: boolean;
  reason?: string;
}

export class ProcessTechnicalSheetUseCase {
  constructor(
    private documentService: DocumentProcessingService,
    private assetRepository: AssetRepository
  ) {}

  async execute(input: ProcessTechnicalSheetInput): Promise<ProcessTechnicalSheetOutput> {
    // 1. Extraire les données via IA
    const extractedData = await this.documentService.extractAssetData(input.fileUrl);

    // 2. Vérifier si un équipement avec ce numéro de série existe déjà
    if (extractedData.serialNumber) {
      const existingAssets = await this.assetRepository.findMany({
        serialNumber: extractedData.serialNumber,
      });

      if (existingAssets.length > 0) {
        const existing = existingAssets[0];
        return {
          extractedData,
          existingAsset: {
            id: existing.id,
            name: existing.name,
            serialNumber: existing.serialNumber,
          },
          canCreateAsset: false,
          reason: `Un équipement avec le numéro de série ${extractedData.serialNumber} existe déjà`,
        };
      }
    }

    // 3. Vérifier si les données essentielles sont présentes
    const hasMinimumData = extractedData.name || extractedData.modelNumber;
    const hasGoodConfidence = extractedData.confidence >= 0.5;

    if (!hasMinimumData) {
      return {
        extractedData,
        canCreateAsset: false,
        reason: 'Données insuffisantes extraites (nom ou modèle requis)',
      };
    }

    if (!hasGoodConfidence) {
      return {
        extractedData,
        canCreateAsset: true, // Peut créer mais avec avertissement
        reason: `Confiance faible (${Math.round(extractedData.confidence * 100)}%). Vérifiez les données avant création.`,
      };
    }

    // 4. Données OK, prêt pour création
    return {
      extractedData,
      canCreateAsset: true,
    };
  }

  /**
   * Crée un Asset depuis les données extraites
   * @param extractedData Données extraites
   * @param userId ID de l'utilisateur créateur (pour audit)
   * @returns Asset créé
   */
  async createAssetFromExtractedData(
    extractedData: ExtractedAssetData,
    userId: string
  ): Promise<Asset> {
    const name = extractedData.name || `${extractedData.manufacturer} ${extractedData.modelNumber}`;
    const serialNumber = extractedData.serialNumber || `TEMP-${Date.now()}`;

    const asset = Asset.create(name, serialNumber, {
      assetType: this.mapAssetType(extractedData.assetType),
      manufacturer: extractedData.manufacturer,
      modelNumber: extractedData.modelNumber,
    });

    await this.assetRepository.save(asset);

    return asset;
  }

  /**
   * Mappe le type d'asset extrait vers l'enum Asset
   */
  private mapAssetType(extractedType?: string): AssetType {
    if (!extractedType) return 'MACHINE';

    const mapping: Record<string, AssetType> = {
      MACHINE: 'MACHINE',
      VEHICLE: 'MACHINE', // On mappe VEHICLE vers MACHINE
      BUILDING: 'BUILDING',
      SITE: 'SITE',
      LINE: 'LINE',
      COMPONENT: 'COMPONENT',
      EQUIPMENT: 'MACHINE',
      TOOL: 'COMPONENT',
    };

    return mapping[extractedType.toUpperCase()] || 'MACHINE';
  }
}
