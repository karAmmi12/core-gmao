import { z } from 'zod';

export const CreateWorkOrderSchema = z.object({
  title: z.string()
    .min(5, "Le titre doit contenir au moins 5 caractères")
    .max(100),
  
  priority: z.enum(['LOW', 'HIGH'], {
    errorMap: () => ({ message: "La priorité doit être LOW ou HIGH" })
  }),
  
  assetId: z.string().uuid("ID d'asset invalide"),
});

export type CreateWorkOrderInput = z.infer<typeof CreateWorkOrderSchema>;