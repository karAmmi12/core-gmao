/**
 * API Route - Create Asset from AI-extracted data
 * Crée directement un équipement depuis les données extraites par IA
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/shared/lib/auth';
import DIContainer from '@/core/infrastructure/di/DIContainer';
import { ProcessTechnicalSheetUseCase } from '@/core/application/use-cases/ProcessTechnicalSheetUseCase';
import { revalidatePath } from 'next/cache';

export async function POST(req: NextRequest) {
  try {
    // 1. Authentification
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // 2. Parser la requête
    const body = await req.json();
    const { extractedData } = body;

    if (!extractedData) {
      return NextResponse.json(
        { error: 'extractedData requis' },
        { status: 400 }
      );
    }

    // 3. Récupérer les services
    const documentService = DIContainer.getDocumentProcessingService();
    const assetRepo = DIContainer.getAssetRepository();

    // 4. Créer l'asset via le Use Case
    const useCase = new ProcessTechnicalSheetUseCase(documentService, assetRepo);
    
    const asset = await useCase.createAssetFromExtractedData(
      extractedData,
      session.user.id
    );

    // 5. Revalider les pages concernées
    revalidatePath('/assets');
    revalidatePath('/');

    return NextResponse.json({
      success: true,
      assetId: asset.id,
      assetName: asset.name,
    });
  } catch (error: any) {
    console.error('Asset creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}
