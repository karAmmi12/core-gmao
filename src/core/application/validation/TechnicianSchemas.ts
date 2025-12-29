import { z } from 'zod';

export const TechnicianSkillEnum = z.enum([
  'Électricité',
  'Mécanique',
  'Hydraulique',
  'Pneumatique',
  'Automatisme',
  'Informatique industrielle',
  'Soudure',
  'Usinage',
]);

export const CreateTechnicianSchema = z.object({
  name: z
    .string()
    .min(3, 'Le nom doit contenir au moins 3 caractères')
    .max(100, 'Le nom ne peut pas dépasser 100 caractères'),

  email: z
    .string()
    .email('Adresse email invalide'),

  phone: z
    .string()
    .regex(/^(\+33|0)[1-9](\d{2}){4}$/, 'Numéro de téléphone invalide (format: 0612345678)')
    .optional()
    .or(z.literal('')),

  skills: z
    .array(TechnicianSkillEnum)
    .min(1, 'Au moins une compétence est requise'),
});

export const UpdateTechnicianSchema = CreateTechnicianSchema.extend({
  isActive: z.boolean().optional(),
});

export type CreateTechnicianInput = z.infer<typeof CreateTechnicianSchema>;
export type UpdateTechnicianInput = z.infer<typeof UpdateTechnicianSchema>;
