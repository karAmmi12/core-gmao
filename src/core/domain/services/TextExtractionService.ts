/**
 * TextExtractionService - Domain Layer
 * Interface pour extraire du texte depuis différents formats
 */

export interface ExtractedText {
  text: string;
  confidence: number; // 0-1, niveau de confiance de l'extraction
  metadata?: {
    pages?: number;
    language?: string;
    processingTime?: number;
  };
}

export interface TextExtractionService {
  /**
   * Extrait le texte d'un PDF
   */
  extractFromPDF(fileBuffer: Buffer): Promise<ExtractedText>;

  /**
   * Extrait le texte d'une image via OCR
   */
  extractFromImage(fileBuffer: Buffer): Promise<ExtractedText>;

  /**
   * Détermine le type de fichier et extrait le texte
   */
  extractFromFile(fileBuffer: Buffer, mimetype: string): Promise<ExtractedText>;
}
