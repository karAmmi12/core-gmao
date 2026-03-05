/**
 * API Route : Upload et traitement de documents
 * POST /api/documents/upload
 * - Upload un fichier (PDF, image, texte)
 * - Extrait le texte
 * - Analyse avec IA
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import DIContainer from '@/core/infrastructure/di/DIContainer';
import { ProcessTechnicalSheetUseCase } from '@/core/application/use-cases/ProcessTechnicalSheetUseCase';
import { ProcessWorkReportUseCase } from '@/core/application/use-cases/ProcessWorkReportUseCase';

export async function POST(request: NextRequest) {
  try {
    // 1. Vérifier l'authentification
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // 2. Parser le FormData
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const type = formData.get('type') as 'technical_sheet' | 'work_report';
    const workOrderId = formData.get('workOrderId') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'Fichier manquant' }, { status: 400 });
    }

    if (!type || !['technical_sheet', 'work_report'].includes(type)) {
      return NextResponse.json(
        { error: 'Type invalide. Attendu: technical_sheet ou work_report' },
        { status: 400 }
      );
    }

    if (type === 'work_report' && !workOrderId) {
      return NextResponse.json(
        { error: 'workOrderId requis pour work_report' },
        { status: 400 }
      );
    }

    // 3. Stocker le fichier
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const fileStorageService = DIContainer.getFileStorageService();
    const uploadedFile = await fileStorageService.upload(
      fileBuffer,
      file.name,
      file.type
    );

    console.log('📁 Fichier uploadé:', uploadedFile.filename, '- Type:', uploadedFile.mimetype);

    // 4. Extraire le texte
    const textExtractionService = DIContainer.getTextExtractionService();
    const extractedText = await textExtractionService.extractFromFile(
      fileBuffer,
      uploadedFile.mimetype
    );

    console.log(
      '📄 Texte extrait:',
      extractedText.text.substring(0, 200),
      `... (confidence: ${Math.round(extractedText.confidence * 100)}%)`
    );

    // 5. Convertir le texte en data URL pour l'IA
    const textDataUrl = `data:text/plain;base64,${Buffer.from(extractedText.text).toString(
      'base64'
    )}`;

    // 6. Traiter selon le type
    if (type === 'technical_sheet') {
      const useCase = new ProcessTechnicalSheetUseCase(
        DIContainer.getDocumentProcessingService(),
        DIContainer.getAssetRepository()
      );

      const result = await useCase.execute({ fileUrl: textDataUrl });

      return NextResponse.json({
        success: true,
        result: {
          type: 'technical_sheet',
          extractedData: result.extractedData,
          canCreateAsset: result.canCreateAsset,
          reason: result.reason,
          extractionConfidence: extractedText.confidence,
          fileInfo: {
            filename: uploadedFile.filename,
            size: uploadedFile.size,
            mimetype: uploadedFile.mimetype,
          },
        },
      });
    } else {
      // work_report
      const useCase = new ProcessWorkReportUseCase(
        DIContainer.getDocumentProcessingService(),
        DIContainer.getWorkOrderRepository(),
        DIContainer.getAssetRepository()
      );

      const result = await useCase.execute({
        fileUrl: textDataUrl,
        workOrderId: workOrderId!,
      });

      return NextResponse.json({
        success: true,
        result: {
          type: 'work_report',
          extractedData: result.extractedData,
          workOrderContext: result.workOrderContext,
          canComplete: result.canComplete,
          reason: result.reason,
          extractionConfidence: extractedText.confidence,
          fileInfo: {
            filename: uploadedFile.filename,
            size: uploadedFile.size,
            mimetype: uploadedFile.mimetype,
          },
        },
      });
    }
  } catch (error: any) {
    console.error('Document upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors du traitement du document' },
      { status: 500 }
    );
  }
}
