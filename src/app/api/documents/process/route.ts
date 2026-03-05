/**
 * API Route - Document Processing
 * Traite des documents (fiches techniques, comptes-rendus) via IA
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/shared/lib/auth';
import DIContainer from '@/core/infrastructure/di/DIContainer';
import { ProcessTechnicalSheetUseCase } from '@/core/application/use-cases/ProcessTechnicalSheetUseCase';
import { ProcessWorkReportUseCase } from '@/core/application/use-cases/ProcessWorkReportUseCase';

export async function POST(req: NextRequest) {
  try {
    // 1. Authentification
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // 2. Parser la requête
    const body = await req.json();
    const { type, content, workOrderId } = body;

    if (!type || !content) {
      return NextResponse.json(
        { error: 'Type et contenu requis' },
        { status: 400 }
      );
    }

    // 3. Convertir le contenu en data URL pour le service
    const dataUrl = `data:text/plain;base64,${Buffer.from(content).toString('base64')}`;

    // 4. Récupérer les services via DIContainer
    const documentService = DIContainer.getDocumentProcessingService();
    const assetRepo = DIContainer.getAssetRepository();
    const workOrderRepo = DIContainer.getWorkOrderRepository();

    // 5. Traiter selon le type
    if (type === 'technical_sheet') {
      const useCase = new ProcessTechnicalSheetUseCase(documentService, assetRepo);
      const result = await useCase.execute({ fileUrl: dataUrl });

      return NextResponse.json({
        success: true,
        result: {
          type: 'technical_sheet',
          ...result,
        },
      });
    }

    if (type === 'work_report') {
      if (!workOrderId) {
        return NextResponse.json(
          { error: 'workOrderId requis pour work_report' },
          { status: 400 }
        );
      }

      const useCase = new ProcessWorkReportUseCase(
        documentService,
        workOrderRepo,
        assetRepo
      );
      const result = await useCase.execute({
        fileUrl: dataUrl,
        workOrderId,
      });

      return NextResponse.json({
        success: true,
        result: {
          type: 'work_report',
          ...result,
        },
      });
    }

    return NextResponse.json(
      { error: `Type invalide: ${type}` },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Document processing error:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}
