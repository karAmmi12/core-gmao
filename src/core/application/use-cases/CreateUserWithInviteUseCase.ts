import { UserRepository } from '@/core/domain/repositories/UserRepository';
import { User, UserRole } from '@/core/domain/entities/User';

export interface CreateUserWithInviteInput {
  email: string;
  name: string;
  role: UserRole;
  createdById: string;
}

export interface CreateUserWithInviteOutput {
  userId: string;
  inviteToken: string;
}

export class CreateUserWithInviteUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(input: CreateUserWithInviteInput): Promise<CreateUserWithInviteOutput> {
    // Vérifier si l'email existe déjà
    const exists = await this.userRepository.existsByEmail(input.email);
    if (exists) {
      throw new Error("Un utilisateur avec cet email existe déjà");
    }

    // Créer l'utilisateur
    const user = User.createWithInvite({
      email: input.email,
      name: input.name,
      role: input.role,
      createdById: input.createdById,
    });

    // Sauvegarder
    await this.userRepository.save(user);

    return {
      userId: user.id,
      inviteToken: user.inviteToken!,
    };
  }
}
