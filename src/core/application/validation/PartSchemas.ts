import { z } from 'zod';

export const createPartSchema = z.object({
  reference: z.string().min(3, "La référence doit contenir au moins 3 caractères"),
  name: z.string().min(3, "Le nom doit contenir au moins 3 caractères"),
  description: z.string().optional(),
  category: z.enum([
    'FILTRES',
    'JOINTS',
    'ROULEMENTS',
    'COURROIES',
    'LUBRIFIANTS',
    'VISSERIE',
    'ELECTRICITE',
    'HYDRAULIQUE',
    'PNEUMATIQUE',
    'AUTRE'
  ]).optional(),
  unitPrice: z.coerce.number().min(0, "Le prix doit être positif"),
  minStockLevel: z.coerce.number().min(0, "Le stock minimum doit être positif").optional(),
  supplier: z.string().optional(),
  supplierRef: z.string().optional(),
  location: z.string().optional(),
});

export type CreatePartInput = z.infer<typeof createPartSchema>;

export const addStockMovementSchema = z.object({
  partId: z.string().min(1, "La pièce est requise"),
  type: z.enum(['IN', 'OUT'], {
    errorMap: () => ({ message: "Le type doit être 'IN' ou 'OUT'" })
  }),
  quantity: z.coerce.number().min(1, "La quantité doit être supérieure à 0"),
  reason: z.string().optional(),
  reference: z.string().optional(),
});

export type AddStockMovementInput = z.infer<typeof addStockMovementSchema>;
