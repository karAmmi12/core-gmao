import { z } from 'zod';

// Types de maintenance et déclenchement
export const MaintenanceTypeEnum = z.enum(['PREVENTIVE', 'PREDICTIVE']);
export const TriggerTypeEnum = z.enum(['TIME_BASED', 'THRESHOLD_BASED']);
export const FrequencyEnum = z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY']);

// Schema de base (champs communs)
const baseSchema = {
  assetId: z.string().min(1, 'L\'équipement est requis'),
  title: z.string().min(5, 'Le titre doit contenir au moins 5 caractères').max(200),
  description: z.string().optional(),
  maintenanceType: MaintenanceTypeEnum.default('PREVENTIVE'),
  triggerType: TriggerTypeEnum.default('TIME_BASED'),
  estimatedDuration: z.coerce.number().positive().optional().or(z.literal('')).transform(v => v === '' ? undefined : v),
  assignedToId: z.string().optional().or(z.literal('')).transform(v => v === '' ? undefined : v),
  priority: z.enum(['LOW', 'HIGH']).default('LOW'),
};

// Schema pour TIME_BASED
const timeBasedFields = {
  frequency: FrequencyEnum.default('MONTHLY'),
  intervalValue: z.coerce.number().int().min(1).max(100).default(1),
  nextDueDate: z.coerce.date(),
};

// Schema pour THRESHOLD_BASED
const thresholdBasedFields = {
  thresholdMetric: z.string().min(1, 'Le métrique est requis'),
  thresholdValue: z.coerce.number().positive('La valeur de seuil doit être positive'),
  thresholdUnit: z.string().optional(),
  currentValue: z.coerce.number().min(0).default(0),
};

// Schema de création avec validation conditionnelle
export const MaintenanceScheduleCreateSchema = z.object({
  ...baseSchema,
  // Time-based fields (optionnels selon triggerType)
  frequency: FrequencyEnum.optional(),
  intervalValue: z.coerce.number().int().min(1).max(100).optional(),
  nextDueDate: z.coerce.date().optional(),
  // Threshold-based fields (optionnels selon triggerType)
  thresholdMetric: z.string().optional(),
  thresholdValue: z.coerce.number().positive().optional(),
  thresholdUnit: z.string().optional(),
  currentValue: z.coerce.number().min(0).optional(),
}).superRefine((data, ctx) => {
  if (data.triggerType === 'TIME_BASED') {
    if (!data.frequency) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'La fréquence est requise pour une maintenance temporelle',
        path: ['frequency'],
      });
    }
    if (!data.nextDueDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'La date d\'échéance est requise',
        path: ['nextDueDate'],
      });
    }
  } else if (data.triggerType === 'THRESHOLD_BASED') {
    if (!data.thresholdMetric) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Le métrique est requis pour une maintenance prédictive',
        path: ['thresholdMetric'],
      });
    }
    if (!data.thresholdValue) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'La valeur de seuil est requise',
        path: ['thresholdValue'],
      });
    }
  }
});

// Schema de mise à jour
export const MaintenanceScheduleUpdateSchema = z.object({
  title: z.string().min(5).max(200).optional(),
  description: z.string().optional(),
  maintenanceType: MaintenanceTypeEnum.optional(),
  triggerType: TriggerTypeEnum.optional(),
  frequency: FrequencyEnum.optional(),
  intervalValue: z.coerce.number().int().min(1).max(100).optional(),
  nextDueDate: z.coerce.date().optional(),
  thresholdMetric: z.string().optional(),
  thresholdValue: z.coerce.number().positive().optional(),
  thresholdUnit: z.string().optional(),
  currentValue: z.coerce.number().min(0).optional(),
  estimatedDuration: z.coerce.number().positive().optional(),
  assignedToId: z.string().optional(),
  isActive: z.boolean().optional(),
  priority: z.enum(['LOW', 'HIGH']).optional(),
});

// Schema pour mise à jour du relevé (compteur)
export const UpdateReadingSchema = z.object({
  scheduleId: z.string().min(1, 'L\'ID du planning est requis'),
  currentValue: z.coerce.number().min(0, 'La valeur doit être positive'),
});

export type MaintenanceScheduleCreateInput = z.infer<typeof MaintenanceScheduleCreateSchema>;
export type MaintenanceScheduleUpdateInput = z.infer<typeof MaintenanceScheduleUpdateSchema>;
export type UpdateReadingInput = z.infer<typeof UpdateReadingSchema>;
