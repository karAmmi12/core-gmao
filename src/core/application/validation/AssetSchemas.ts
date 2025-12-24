import { z } from 'zod';

export const CreateAssetSchema = z.object({
  name: z.string()
    .min(3, "Le nom doit contenir au moins 3 caractères")
    .max(50, "Le nom ne peut pas dépasser 50 caractères"),
  
  serialNumber: z.string()
    .min(2, "Le numéro de série est requis")
    .regex(/^[A-Z0-9-]+$/, "Format invalide (lettres majuscules, chiffres et tirets uniquement)"),
});

export type CreateAssetInput = z.infer<typeof CreateAssetSchema>;