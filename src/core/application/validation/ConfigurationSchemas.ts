// core/application/validation/ConfigurationSchemas.ts

import { z } from 'zod';

export const CreateCategorySchema = z.object({
  code: z
    .string()
    .min(2, 'Le code doit contenir au moins 2 caractères')
    .max(50, 'Le code ne doit pas dépasser 50 caractères')
    .regex(/^[A-Z0-9_]+$/, 'Le code doit être en majuscules avec des underscores'),
  name: z
    .string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(100, 'Le nom ne doit pas dépasser 100 caractères'),
  description: z.string().max(500).optional(),
  sortOrder: z.number().int().min(0).optional(),
});

export const UpdateCategorySchema = z.object({
  name: z
    .string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(100, 'Le nom ne doit pas dépasser 100 caractères')
    .optional(),
  description: z.string().max(500).optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

export const CreateItemSchema = z.object({
  categoryId: z.string().uuid('ID de catégorie invalide'),
  code: z
    .string()
    .min(2, 'Le code doit contenir au moins 2 caractères')
    .max(50, 'Le code ne doit pas dépasser 50 caractères'),
  label: z
    .string()
    .min(2, 'Le libellé doit contenir au moins 2 caractères')
    .max(100, 'Le libellé ne doit pas dépasser 100 caractères'),
  description: z.string().max(500).optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'La couleur doit être au format hexadécimal (#RRGGBB)')
    .optional(),
  icon: z.string().max(50).optional(),
  isDefault: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const UpdateItemSchema = z.object({
  label: z
    .string()
    .min(2, 'Le libellé doit contenir au moins 2 caractères')
    .max(100, 'Le libellé ne doit pas dépasser 100 caractères')
    .optional(),
  description: z.string().max(500).optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'La couleur doit être au format hexadécimal (#RRGGBB)')
    .optional(),
  icon: z.string().max(50).optional(),
  isDefault: z.boolean().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type CreateCategoryInput = z.infer<typeof CreateCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof UpdateCategorySchema>;
export type CreateItemInput = z.infer<typeof CreateItemSchema>;
export type UpdateItemInput = z.infer<typeof UpdateItemSchema>;
