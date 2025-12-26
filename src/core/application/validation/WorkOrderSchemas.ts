import { z } from 'zod';

export const WorkOrderPartSchema = z.object({
  partId: z.string().uuid("ID de pièce invalide"),
  quantity: z.coerce.number().min(1, "La quantité doit être au moins 1"),
  unitPrice: z.coerce.number().min(0, "Le prix doit être positif"),
});

export const CreateWorkOrderSchema = z.object({
  title: z.string()
    .min(5, "Le titre doit contenir au moins 5 caractères")
    .max(100),
  
  description: z.string().optional(),
  
  priority: z.enum(['LOW', 'HIGH'], {
    errorMap: () => ({ message: "La priorité doit être LOW ou HIGH" })
  }),
  
  assetId: z.string().uuid("ID d'asset invalide"),
  
  // Champs de planification optionnels
  assignedToId: z.string().uuid("ID de technicien invalide").optional(),
  scheduledAt: z.string().datetime("Date invalide").optional(),
  estimatedDuration: z.coerce.number().positive("Durée invalide").optional(),
  
  // Pièces utilisées
  parts: z.array(WorkOrderPartSchema).optional(),
});

export type CreateWorkOrderInput = z.infer<typeof CreateWorkOrderSchema>;
export type WorkOrderPartInput = z.infer<typeof WorkOrderPartSchema>;