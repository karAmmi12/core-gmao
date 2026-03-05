/**
 * TesseractTextExtractionService - Infrastructure Layer
 * Extraction de texte depuis PDF et images avec OCR
 */

import Tesseract from 'tesseract.js';
import { PdfReader } from 'pdfreader';
import {
  TextExtractionService,
  ExtractedText,
} from '@/core/domain/services/TextExtractionService';

export class TesseractTextExtractionService implements TextExtractionService {
  /**
   * Extrait le texte d'un PDF
   * Utilise pdfreader pour les PDF avec texte sélectionnable
   * Pour les PDF scannés, utiliser extractFromImage après conversion
   */
  async extractFromPDF(fileBuffer: Buffer): Promise<ExtractedText> {
    const startTime = Date.now();

    return new Promise<ExtractedText>((resolve, reject) => {
      const textItems: string[] = [];
      let pageCount = 0;

      new PdfReader().parseBuffer(fileBuffer, (err, item) => {
        if (err) {
          reject(new Error(`Erreur lecture PDF: ${err}`));
        } else if (!item) {
          // Fin du PDF
          const processingTime = Date.now() - startTime;
          const fullText = textItems.join(' ').trim();

          if (!fullText) {
            reject(
              new Error(
                `PDF scanné détecté (pas de texte extractible).\n` +
                `Solution: Convertissez le PDF en image (PNG/JPG) et utilisez l'OCR.`
              )
            );
            return;
          }

          resolve({
            text: fullText,
            confidence: 1.0, // Texte brut PDF = confiance maximale
            metadata: {
              pages: pageCount,
              language: 'unknown',
              processingTime,
            },
          });
        } else if (item.page) {
          // Nouvelle page détectée
          pageCount = item.page;
        } else if (item.text) {
          // Texte trouvé
          textItems.push(item.text);
        }
      });
    });
  }

  /**
   * Extrait le texte d'une image via OCR
   */
  async extractFromImage(fileBuffer: Buffer): Promise<ExtractedText> {
    const startTime = Date.now();

    try {
      const result = await Tesseract.recognize(fileBuffer, 'fra+eng', {
        logger: (m) => {
          // Logger optionnel pour debug
          if (m.status === 'recognizing text') {
            console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
          }
        },
      });

      const processingTime = Date.now() - startTime;

      return {
        text: result.data.text,
        confidence: result.data.confidence / 100, // Tesseract retourne 0-100
        metadata: {
          language: 'fra+eng',
          processingTime,
        },
      };
    } catch (error: any) {
      throw new Error(`Erreur OCR: ${error.message}`);
    }
  }

  /**
   * Détermine le type de fichier et extrait le texte
   */
  async extractFromFile(fileBuffer: Buffer, mimetype: string): Promise<ExtractedText> {
    // PDF
    if (mimetype === 'application/pdf') {
      return this.extractFromPDF(fileBuffer);
    }

    // Images
    if (
      mimetype.startsWith('image/') &&
      ['image/jpeg', 'image/jpg', 'image/png', 'image/tiff', 'image/bmp'].includes(mimetype)
    ) {
      return this.extractFromImage(fileBuffer);
    }

    // Texte brut
    if (mimetype === 'text/plain') {
      return {
        text: fileBuffer.toString('utf-8'),
        confidence: 1.0,
        metadata: {
          processingTime: 0,
        },
      };
    }

    throw new Error(
      `Type de fichier non supporté: ${mimetype}. Formats supportés: PDF, Images (JPEG, PNG, TIFF, BMP), TXT`
    );
  }
}
