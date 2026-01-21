/**
 * Use Case - Envoyer un message au chat IA
 * Respecte le principe de Clean Architecture : logique métier isolée
 */

import { AIService, ChatMessage } from '@/core/domain/services/AIService';
import { SendChatMessageInput, ChatResponseDTO } from '@/core/application/dto/ChatDTO';
import { UseCase } from '@/core/domain/interfaces/common';

export class SendChatMessageUseCase implements UseCase<SendChatMessageInput, ChatResponseDTO> {
  constructor(
    private aiService: AIService,
    private userId: string,
    private userRole: string,
    private technicianId?: string
  ) {}

  async execute(input: SendChatMessageInput): Promise<ChatResponseDTO> {
    // Construire l'historique des messages
    const messages: ChatMessage[] = [
      ...(input.conversationHistory?.map(msg => ({
        role: msg.role,
        content: msg.content,
      })) || []),
      {
        role: 'user' as const,
        content: input.message,
      },
    ];

    // Appeler le service IA avec le technicianId si disponible
    const response = await this.aiService.chat({
      messages,
      userId: this.technicianId || this.userId, // Utiliser technicianId si disponible
      userRole: this.userRole,
      temperature: 0.5,
      maxTokens: 1024,
    });

    // Retourner le DTO formaté
    return {
      message: response.message,
      tokensUsed: response.tokensUsed,
      model: response.model,
      timestamp: new Date(),
    };
  }
}
