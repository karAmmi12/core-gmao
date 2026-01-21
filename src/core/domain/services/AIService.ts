/**
 * Interface du service IA - Couche Domaine
 * Abstraction pour permettre le changement de provider IA (Groq, Claude, OpenAI, etc.)
 */

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
  userId: string;
  userRole: string;
  maxTokens?: number;
  temperature?: number;
}

export interface ChatResponse {
  message: string;
  tokensUsed?: number;
  model?: string;
  toolCalls?: Array<{
    name: string;
    arguments: Record<string, any>;
  }>;
}

export interface AIService {
  /**
   * Envoie un message au modèle IA et retourne la réponse
   */
  chat(request: ChatRequest): Promise<ChatResponse>;

  /**
   * Génère un contexte système basé sur l'utilisateur et ses permissions
   */
  generateSystemContext(userId: string, userRole: string): Promise<string>;
}
