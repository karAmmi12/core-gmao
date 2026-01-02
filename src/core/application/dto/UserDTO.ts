import { UserRole } from '@/core/domain/entities/User';

export interface UserDTO {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  inviteToken?: string;
  inviteExpiresAt?: string;
  mustChangePassword: boolean;
  lastLoginAt?: string;
  createdAt: string;
  createdById?: string;
}

export interface UserListDTO {
  users: UserDTO[];
  total: number;
}
