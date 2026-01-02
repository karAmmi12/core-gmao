import { User } from '@/core/domain/entities/User';
import { UserDTO } from './UserDTO';

export class UserMapper {
  static toDTO(user: User): UserDTO {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isActive: user.isActive,
      inviteToken: user.inviteToken,
      inviteExpiresAt: user.inviteExpiresAt?.toISOString(),
      mustChangePassword: user.mustChangePassword,
      lastLoginAt: user.lastLoginAt?.toISOString(),
      createdAt: user.createdAt.toISOString(),
      createdById: user.createdById,
    };
  }

  static toDTOList(users: User[]): UserDTO[] {
    return users.map(user => this.toDTO(user));
  }
}
