/**
 * GroqDocumentService - Infrastructure Layer
 * Utilise Groq AI pour extraire des données structurées depuis du texte/images
 */

import Groq from 'groq-sdk';
import {
  DocumentProcessingService,
  ExtractedAssetData,
  ExtractedWorkReportData,
} from '@/core/domain/services/DocumentProcessingService';
import { TextExtractionService } from '@/core/domain/services/TextExtractionService';

export class GroqDocumentService implements DocumentProcessingService {
  private groq: Groq;
  private textExtractor: TextExtractionService;

  constructor(apiKey: string, textExtractor: TextExtractionService) {
    this.groq = new Groq({ apiKey });
    this.textExtractor = textExtractor;
  }

  async extractAssetData(fileUrl: string): Promise<ExtractedAssetData> {
    // Pour MVP : on suppose que fileUrl contient du texte ou on utilise Vision API
    // TODO: Intégrer OCR si nécessaire (pdf-parse, tesseract.js)
    
    // Récupérer le contenu du fichier
    const text = await this.extractTextFromFile(fileUrl);

    const completion = await this.groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `Tu es un expert en extraction de données techniques depuis des fiches techniques d'équipements industriels (machines, véhicules, outils).

INSTRUCTIONS :
1. Extrait les informations suivantes au format JSON strict
2. Si une donnée n'est pas trouvée, utilise null (pas de string vide)
3. Pour assetType, déduis le type : MACHINE, VEHICLE, BUILDING, EQUIPMENT, TOOL
4. Pour specifications, extrait toutes les données techniques (puissance, dimensions, poids, etc.)
5. Retourne uniquement le JSON, rien d'autre

FORMAT JSON attendu :
{
  "name": "Nom de l'équipement",
  "manufacturer": "Fabricant",
  "modelNumber": "Référence modèle",
  "serialNumber": "Numéro de série",
  "assetType": "MACHINE|VEHICLE|BUILDING|EQUIPMENT|TOOL",
  "specifications": {
    "puissance": "...",
    "dimensions": "...",
    "poids": "...",
    ...
  }
}`,
        },
        {
          role: 'user',
          content: `Extrait les données de cette fiche technique :\n\n${text}`,
        },
      ],
      temperature: 0.2, // Basse température pour extraction factuelle
      response_format: { type: 'json_object' },
    });

    const extracted = JSON.parse(completion.choices[0]?.message?.content || '{}');

    return {
      name: extracted.name || undefined,
      manufacturer: extracted.manufacturer || undefined,
      modelNumber: extracted.modelNumber || undefined,
      serialNumber: extracted.serialNumber || undefined,
      assetType: extracted.assetType || undefined,
      specifications: extracted.specifications || undefined,
      confidence: this.calculateAssetConfidence(extracted),
    };
  }

  async extractWorkReportData(
    fileUrl: string,
    workOrderContext?: { assetName: string; workOrderTitle: string }
  ): Promise<ExtractedWorkReportData> {
    const text = await this.extractTextFromFile(fileUrl);

    const contextPrompt = workOrderContext
      ? `CONTEXTE de l'intervention :
- Équipement : ${workOrderContext.assetName}
- Intervention : ${workOrderContext.workOrderTitle}
`
      : '';

    const completion = await this.groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `Tu es un expert en analyse de comptes-rendus d'intervention de maintenance industrielle.

INSTRUCTIONS :
1. Extrait les informations suivantes au format JSON strict
2. actualDuration en minutes (converti depuis heures/min si nécessaire)
3. partsUsed array avec {name, quantity}
4. Si une donnée n'est pas trouvée, utilise null

FORMAT JSON attendu :
{
  "actualDuration": 120,
  "description": "Résumé de l'intervention",
  "partsUsed": [
    {"name": "Filtre à huile", "quantity": 1},
    {"name": "Joints", "quantity": 2}
  ],
  "diagnosis": "Diagnostic du problème identifié",
  "actionsPerformed": "Actions réalisées détaillées"
}`,
        },
        {
          role: 'user',
          content: `${contextPrompt}Extrait les données de ce compte-rendu d'intervention :\n\n${text}`,
        },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });

    const extracted = JSON.parse(completion.choices[0]?.message?.content || '{}');

    return {
      actualDuration: extracted.actualDuration || undefined,
      description: extracted.description || undefined,
      partsUsed: extracted.partsUsed || undefined,
      diagnosis: extracted.diagnosis || undefined,
      actionsPerformed: extracted.actionsPerformed || undefined,
      confidence: this.calculateWorkReportConfidence(extracted),
    };
  }

  /**
   * Extrait du texte depuis un fichier
   * Utilise TextExtractionService pour supporter PDF/images avec OCR
   */
  private async extractTextFromFile(fileUrl: string): Promise<string> {
    try {
      // Si c'est une URL de données brutes (data:text/plain)
      if (fileUrl.startsWith('data:text/plain')) {
        const base64 = fileUrl.split(',')[1];
        return Buffer.from(base64, 'base64').toString('utf-8');
      }

      // Si c'est un buffer ou URL de fichier uploadé
      if (fileUrl.startsWith('data:')) {
        const [mimeInfo, base64Data] = fileUrl.split(',');
        const mimetype = mimeInfo.match(/data:([^;]+)/)?.[1] || 'application/octet-stream';
        const buffer = Buffer.from(base64Data, 'base64');

        const result = await this.textExtractor.extractFromFile(buffer, mimetype);
        return result.text;
      }

      // Si c'est une URL HTTP
      const response = await fetch(fileUrl);
      const contentType = response.headers.get('content-type') || 'text/plain';
      const buffer = Buffer.from(await response.arrayBuffer());

      const result = await this.textExtractor.extractFromFile(buffer, contentType);
      return result.text;
    } catch (error: any) {
      throw new Error(`Erreur extraction texte: ${error.message}`);
    }
  }

  /**
   * Calcule le score de confiance pour les données d'asset (0-1)
   */
  private calculateAssetConfidence(data: any): number {
    const criticalFields = ['name', 'manufacturer', 'modelNumber', 'serialNumber'];
    const filledCritical = criticalFields.filter(
      (f) => data[f] && data[f] !== null && data[f] !== ''
    ).length;

    const baseScore = filledCritical / criticalFields.length;

    // Bonus si specifications présentes
    const hasSpecs = data.specifications && Object.keys(data.specifications).length > 0;
    const specsBonus = hasSpecs ? 0.1 : 0;

    return Math.min(baseScore + specsBonus, 1);
  }

  /**
   * Calcule le score de confiance pour les données de work report (0-1)
   */
  private calculateWorkReportConfidence(data: any): number {
    const fields = ['actualDuration', 'description', 'diagnosis'];
    const filledFields = fields.filter((f) => data[f] && data[f] !== null).length;

    return filledFields / fields.length;
  }
}
