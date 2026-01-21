/**
 * DTO pour les requêtes et réponses du chat IA
 */

export interface ChatMessageDTO {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
}

export interface SendChatMessageInput {
  message: string;
  conversationHistory?: ChatMessageDTO[];
}

export interface ChatResponseDTO {
  message: string;
  conversationId?: string;
  tokensUsed?: number;
  model?: string;
  timestamp: Date;
}
