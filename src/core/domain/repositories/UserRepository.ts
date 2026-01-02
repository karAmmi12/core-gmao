import { User, UserRole } from '../entities/User';

export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByInviteToken(token: string): Promise<User | null>;
  findAll(): Promise<User[]>;
  findByRole(role: UserRole): Promise<User[]>;
  findActive(): Promise<User[]>;
  save(user: User): Promise<void>;
  update(user: User): Promise<void>;
  delete(id: string): Promise<void>;
  existsByEmail(email: string): Promise<boolean>;
}
