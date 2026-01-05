import { prisma } from '@/lib/prisma';
import { PrismaClient, Prisma } from '@prisma/client';

/**
 * Wrapper pour exécuter des opérations dans une transaction Prisma
 * Garantit l'atomicité des opérations critiques (tout passe ou rien ne passe)
 */
export class TransactionManager {
  /**
   * Exécute une fonction dans une transaction
   * Si une erreur survient, toutes les opérations sont annulées (rollback)
   */
  static async execute<T>(
    operation: (tx: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>) => Promise<T>
  ): Promise<T> {
    return await prisma.$transaction(operation, {
      maxWait: 5000, // Attente max pour obtenir une connexion : 5s
      timeout: 10000, // Timeout de transaction : 10s
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    });
  }

  /**
   * Version avec retry automatique en cas d'échec temporaire
   */
  static async executeWithRetry<T>(
    operation: (tx: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>) => Promise<T>,
    maxRetries = 3
  ): Promise<T> {
    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.execute(operation);
      } catch (error) {
        lastError = error as Error;
        
        // Ne retry que pour les erreurs temporaires (deadlock, timeout, etc.)
        const isRetryable = 
          error instanceof Error && 
          (error.message.includes('deadlock') || 
           error.message.includes('timeout') ||
           error.message.includes('SQLITE_BUSY'));

        if (!isRetryable || attempt === maxRetries) {
          throw error;
        }

        // Attente exponentielle : 100ms, 200ms, 400ms
        await new Promise(resolve => setTimeout(resolve, 100 * Math.pow(2, attempt - 1)));
      }
    }

    throw lastError || new Error('Transaction failed after retries');
  }
}
