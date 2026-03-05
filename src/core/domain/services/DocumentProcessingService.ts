/**
 * DocumentProcessingService - Domain Layer
 * Service pour extraire des données structurées depuis des documents (PDF, images)
 */

export interface ExtractedAssetData {
  name?: string;
  manufacturer?: string;
  modelNumber?: string;
  serialNumber?: string;
  assetType?: string;
  specifications?: Record<string, string>;
  confidence: number; // Score 0-1 de confiance dans les données extraites
}

export interface ExtractedWorkReportData {
  actualDuration?: number; // en minutes
  description?: string;
  partsUsed?: Array<{ name: string; quantity: number }>;
  diagnosis?: string;
  actionsPerformed?: string;
  confidence: number;
}

export interface DocumentProcessingService {
  /**
   * Extrait des données d'équipement depuis une fiche technique
   * @param fileUrl URL du fichier (PDF ou image)
   * @returns Données structurées extraites
   */
  extractAssetData(fileUrl: string): Promise<ExtractedAssetData>;

  /**
   * Extrait des données depuis un compte-rendu d'intervention
   * @param fileUrl URL du fichier (PDF ou image)
   * @param workOrderContext Contexte de l'ordre de travail pour améliorer l'extraction
   * @returns Données structurées extraites
   */
  extractWorkReportData(
    fileUrl: string,
    workOrderContext?: { assetName: string; workOrderTitle: string }
  ): Promise<ExtractedWorkReportData>;
}
