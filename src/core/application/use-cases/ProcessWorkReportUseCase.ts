/**
 * ProcessWorkReportUseCase - Application Layer
 * Traite un compte-rendu d'intervention et extrait les données
 */

import {
  DocumentProcessingService,
  ExtractedWorkReportData,
} from '@/core/domain/services/DocumentProcessingService';
import { WorkOrderRepository } from '@/core/domain/repositories/WorkOrderRepository';
import { AssetRepository } from '@/core/domain/repositories/AssetRepository';

export interface ProcessWorkReportInput {
  fileUrl: string;
  workOrderId: string;
}

export interface ProcessWorkReportOutput {
  extractedData: ExtractedWorkReportData;
  workOrderContext: {
    id: string;
    title: string;
    assetName: string;
    currentStatus: string;
  };
  canComplete: boolean;
  reason?: string;
}

export class ProcessWorkReportUseCase {
  constructor(
    private documentService: DocumentProcessingService,
    private workOrderRepository: WorkOrderRepository,
    private assetRepository: AssetRepository
  ) {}

  async execute(input: ProcessWorkReportInput): Promise<ProcessWorkReportOutput> {
    // 1. Récupérer le WorkOrder pour le contexte
    const workOrder = await this.workOrderRepository.findById(input.workOrderId);

    if (!workOrder) {
      throw new Error(`Ordre de travail ${input.workOrderId} introuvable`);
    }

    // 2. Récupérer l'asset pour le contexte
    const asset = await this.assetRepository.findById(workOrder.assetId);

    if (!asset) {
      throw new Error(`Équipement ${workOrder.assetId} introuvable`);
    }

    // 3. Extraire les données via IA avec contexte
    const extractedData = await this.documentService.extractWorkReportData(input.fileUrl, {
      assetName: asset.name,
      workOrderTitle: workOrder.title,
    });

    // 4. Vérifier si l'ordre peut être complété
    const canComplete = this.canCompleteWorkOrder(workOrder.status, extractedData);

    return {
      extractedData,
      workOrderContext: {
        id: workOrder.id,
        title: workOrder.title,
        assetName: asset.name,
        currentStatus: workOrder.status,
      },
      canComplete,
      reason: !canComplete
        ? `L'ordre de travail doit être en statut IN_PROGRESS pour être complété (actuellement: ${workOrder.status})`
        : extractedData.confidence < 0.4
        ? `Confiance faible (${Math.round(extractedData.confidence * 100)}%). Vérifiez les données.`
        : undefined,
    };
  }

  /**
   * Vérifie si le WorkOrder peut être complété
   */
  private canCompleteWorkOrder(
    currentStatus: string,
    extractedData: ExtractedWorkReportData
  ): boolean {
    // Doit être en cours
    if (currentStatus !== 'IN_PROGRESS') {
      return false;
    }

    // Doit avoir au moins une description
    return !!extractedData.description || !!extractedData.diagnosis;
  }
}
