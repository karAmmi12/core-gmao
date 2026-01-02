/**
 * Hook pour gérer les actions serveur avec état de chargement et gestion d'erreurs
 * Centralise la logique répétée de useTransition + gestion erreurs
 */

'use client';

import { useTransition, useState, useCallback } from 'react';
import type { ActionState } from '@/core/application/types/ActionState';

export type ServerActionResult<T = void> = {
  success: boolean;
  data?: T;
  error?: string;
} | ActionState;

export type ServerAction<TArgs extends any[] = any[], TResult = void> = (
  ...args: TArgs
) => Promise<ServerActionResult<TResult> | ActionState>;

export interface UseServerActionReturn<TArgs extends any[], TResult = void> {
  execute: (...args: TArgs) => Promise<void>;
  isPending: boolean;
  error: string | null;
  isSuccess: boolean;
  clearError: () => void;
  reset: () => void;
}

/**
 * Hook pour exécuter des actions serveur avec gestion d'état
 * Compatible avec ActionState et ServerActionResult
 * 
 * @example
 * const { execute, isPending, error } = useServerAction(approvePartRequest);
 * 
 * <Button onClick={() => execute(requestId)} disabled={isPending}>
 *   {isPending ? 'Chargement...' : 'Approuver'}
 * </Button>
 * {error && <Alert variant="danger">{error}</Alert>}
 */
export function useServerAction<TArgs extends any[], TResult = void>(
  action: ServerAction<TArgs, TResult>,
  options?: {
    onSuccess?: (data?: TResult) => void;
    onError?: (error: string) => void;
    showAlert?: boolean;
  }
): UseServerActionReturn<TArgs, TResult> {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const execute = useCallback(
    async (...args: TArgs) => {
      setError(null);
      setIsSuccess(false);

      startTransition(async () => {
        try {
          const result = await action(...args);

          // Handle null result
          if (!result) {
            setError('Aucune réponse du serveur');
            return;
          }

          if (result?.success) {
            setIsSuccess(true);
            options?.onSuccess?.(result.data as TResult);
          } else if (result?.error) {
            setError(result.error);
            options?.onError?.(result.error);
            
            // Alert optionnel pour compatibilité avec code existant
            if (options?.showAlert !== false) {
              alert(result.error);
            }
          }
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
          setError(errorMessage);
          options?.onError?.(errorMessage);
          
          if (options?.showAlert !== false) {
            alert(errorMessage);
          }
        }
      });
    },
    [action, options]
  );

  const clearError = useCallback(() => setError(null), []);
  
  const reset = useCallback(() => {
    setError(null);
    setIsSuccess(false);
  }, []);

  return {
    execute,
    isPending,
    error,
    isSuccess,
    clearError,
    reset,
  };
}

/**
 * Hook pour gérer plusieurs actions serveur
 * Utile quand un composant a plusieurs actions (approve, reject, cancel, etc.)
 * 
 * @example
 * const actions = useServerActions({
 *   approve: approvePartRequest,
 *   reject: rejectPartRequest,
 *   deliver: deliverPartRequest
 * });
 * 
 * actions.approve.execute(id);
 * actions.reject.isPending;
 */
export function useServerActions<
  TActions extends Record<string, ServerAction<any[], any>>
>(
  actions: TActions,
  options?: {
    onSuccess?: (actionName: keyof TActions, data?: any) => void;
    onError?: (actionName: keyof TActions, error: string) => void;
  }
): {
  [K in keyof TActions]: UseServerActionReturn<
    Parameters<TActions[K]>,
    TActions[K] extends ServerAction<any[], infer R> ? R : void
  >;
} {
  const result = {} as any;

  for (const [name, action] of Object.entries(actions)) {
    result[name] = useServerAction(action, {
      onSuccess: (data) => options?.onSuccess?.(name, data),
      onError: (error) => options?.onError?.(name, error),
    });
  }

  return result;
}
