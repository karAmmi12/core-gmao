import { z } from 'zod';

export const MaintenanceScheduleCreateSchema = z.object({
  assetId: z.string().min(1, 'Asset is required'),
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().optional(),
  frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY']),
  intervalValue: z.coerce.number().int().min(1).max(100),
  nextDueDate: z.coerce.date(),
  estimatedDuration: z.coerce.number().positive().optional().or(z.literal(undefined)),
  assignedToId: z.string().optional(),
  priority: z.enum(['LOW', 'HIGH']).default('LOW'),
});

export const MaintenanceScheduleUpdateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY']).optional(),
  intervalValue: z.coerce.number().int().min(1).max(100).optional(),
  nextDueDate: z.coerce.date().optional(),
  estimatedDuration: z.coerce.number().positive().optional(),
  assignedToId: z.string().optional(),
  isActive: z.boolean().optional(),
  priority: z.enum(['LOW', 'HIGH']).optional(),
});

export type MaintenanceScheduleCreateInput = z.infer<typeof MaintenanceScheduleCreateSchema>;
export type MaintenanceScheduleUpdateInput = z.infer<typeof MaintenanceScheduleUpdateSchema>;
