/**
 * API Route - Chat IA
 * Point d'entrée Next.js qui orchestre le use case
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/shared/lib/auth';
import DIContainer from '@/core/infrastructure/di/DIContainer';
import { SendChatMessageUseCase } from '@/core/application/use-cases/SendChatMessageUseCase';
import type { SendChatMessageInput } from '@/core/application/dto/ChatDTO';

export async function POST(req: NextRequest) {
  try {
    // 1. Vérifier l'authentification
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    // 2. Parser la requête
    const body = await req.json();
    const input: SendChatMessageInput = {
      message: body.message,
      conversationHistory: body.conversationHistory || [],
    };

    if (!input.message || input.message.trim() === '') {
      return NextResponse.json(
        { error: 'Message vide' },
        { status: 400 }
      );
    }

    // 3. Récupérer le service IA via DIContainer (Clean Architecture)
    const aiService = DIContainer.getAIService();

    // 4. Exécuter le use case
    const useCase = new SendChatMessageUseCase(
      aiService,
      session.user.id,
      session.user.role as string,
      session.user.technicianId as string | undefined
    );

    const response = await useCase.execute(input);

    // 5. Retourner la réponse
    return NextResponse.json({
      success: true,
      data: response,
    });

  } catch (error: any) {
    console.error('Chat API error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Erreur lors du traitement du message' 
      },
      { status: 500 }
    );
  }
}
