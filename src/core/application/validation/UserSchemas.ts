import { z } from 'zod';

export const UserRoleEnum = z.enum(['ADMIN', 'MANAGER', 'TECHNICIAN', 'OPERATOR', 'VIEWER']);

export const CreateUserSchema = z.object({
  email: z.string().email('Email invalide'),
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères').max(100),
  role: UserRoleEnum.default('OPERATOR'),
});

export const UpdateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  role: UserRoleEnum.optional(),
  isActive: z.boolean().optional(),
});

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Mot de passe actuel requis'),
  newPassword: z.string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
    .regex(/[a-z]/, 'Le mot de passe doit contenir au moins une minuscule')
    .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre'),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

export const ActivateAccountSchema = z.object({
  token: z.string().min(1, 'Token requis'),
  password: z.string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
    .regex(/[a-z]/, 'Le mot de passe doit contenir au moins une minuscule')
    .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;
export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>;
export type ActivateAccountInput = z.infer<typeof ActivateAccountSchema>;
