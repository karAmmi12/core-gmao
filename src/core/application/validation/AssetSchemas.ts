import { z } from 'zod';

export const AssetTypeEnum = z.enum(['SITE', 'BUILDING', 'LINE', 'MACHINE', 'COMPONENT']);
export const AssetStatusEnum = z.enum(['RUNNING', 'STOPPED', 'MAINTENANCE']);

export const CreateAssetSchema = z.object({
  name: z.string()
    .min(3, "Le nom doit contenir au moins 3 caractères")
    .max(50, "Le nom ne peut pas dépasser 50 caractères"),
  
  serialNumber: z.string()
    .min(2, "Le numéro de série est requis")
    .regex(/^[A-Z0-9-]+$/, "Format invalide (lettres majuscules, chiffres et tirets uniquement)"),
  
  status: AssetStatusEnum.default('RUNNING'),
  parentId: z.string().uuid().optional(),
  assetType: AssetTypeEnum.optional(),
  location: z.string().max(100).optional(),
  manufacturer: z.string().max(100).optional(),
  modelNumber: z.string().max(50).optional(),
});

export type CreateAssetInput = z.infer<typeof CreateAssetSchema>;