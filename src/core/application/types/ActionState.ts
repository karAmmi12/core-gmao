/**
 * Type générique pour les états de retour des Server Actions
 * Permet une gestion cohérente des succès, erreurs et validations
 */
export type ActionState<T = Record<string, string[]>> = {
  success: boolean;
  message?: string;
  error?: string;
  errors?: T;
  data?: { id?: string; [key: string]: any };
};
