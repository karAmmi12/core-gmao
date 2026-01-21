/**
 * AIToolService - Domain Layer
 * Interface pour les outils que l'IA peut appeler
 */

export interface ToolParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object';
  description: string;
  required: boolean;
  enum?: string[];
}

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: ToolParameter[];
}

export interface ToolExecutionContext {
  userId: string;
  userRole: string;
}

export interface ToolExecutionResult {
  success: boolean;
  data?: any;
  error?: string;
}

/**
 * Interface abstraite pour exécuter les outils
 */
export interface AIToolService {
  /**
   * Retourne la liste des outils disponibles selon le rôle
   */
  getAvailableTools(userRole: string): ToolDefinition[];

  /**
   * Exécute un outil demandé par l'IA
   */
  executeTool(
    toolName: string,
    parameters: Record<string, any>,
    context: ToolExecutionContext
  ): Promise<ToolExecutionResult>;
}
