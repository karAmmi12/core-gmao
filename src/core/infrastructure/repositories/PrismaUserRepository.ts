import { PrismaClient } from '@prisma/client';
import { User, UserRole } from '@/core/domain/entities/User';
import { UserRepository } from '@/core/domain/repositories/UserRepository';

export class PrismaUserRepository implements UserRepository {
  constructor(private prisma: PrismaClient) {}

  private toDomain(data: any): User {
    return User.restore({
      id: data.id,
      email: data.email,
      name: data.name,
      password: data.password ?? undefined,
      role: data.role as UserRole,
      isActive: data.isActive,
      inviteToken: data.inviteToken ?? undefined,
      inviteExpiresAt: data.inviteExpiresAt ?? undefined,
      mustChangePassword: data.mustChangePassword,
      lastLoginAt: data.lastLoginAt ?? undefined,
      failedLogins: data.failedLogins,
      lockedUntil: data.lockedUntil ?? undefined,
      createdAt: data.createdAt,
      createdById: data.createdById ?? undefined,
      updatedAt: data.updatedAt,
    });
  }

  private toPrisma(user: User) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      password: user.password ?? null,
      role: user.role,
      isActive: user.isActive,
      inviteToken: user.inviteToken ?? null,
      inviteExpiresAt: user.inviteExpiresAt ?? null,
      mustChangePassword: user.mustChangePassword,
      lastLoginAt: user.lastLoginAt ?? null,
      failedLogins: user.failedLogins,
      lockedUntil: user.lockedUntil ?? null,
      createdById: user.createdById ?? null,
      updatedAt: user.updatedAt,
    };
  }

  async findById(id: string): Promise<User | null> {
    const data = await this.prisma.user.findUnique({ where: { id } });
    return data ? this.toDomain(data) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const data = await this.prisma.user.findUnique({ 
      where: { email: email.toLowerCase() } 
    });
    return data ? this.toDomain(data) : null;
  }

  async findByInviteToken(token: string): Promise<User | null> {
    const data = await this.prisma.user.findUnique({ 
      where: { inviteToken: token } 
    });
    return data ? this.toDomain(data) : null;
  }

  async findAll(): Promise<User[]> {
    const data = await this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return data.map(d => this.toDomain(d));
  }

  async findByRole(role: UserRole): Promise<User[]> {
    const data = await this.prisma.user.findMany({
      where: { role },
      orderBy: { name: 'asc' },
    });
    return data.map(d => this.toDomain(d));
  }

  async findActive(): Promise<User[]> {
    const data = await this.prisma.user.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
    return data.map(d => this.toDomain(d));
  }

  async save(user: User): Promise<void> {
    await this.prisma.user.create({
      data: this.toPrisma(user),
    });
  }

  async update(user: User): Promise<void> {
    const data = this.toPrisma(user);
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        name: data.name,
        password: data.password,
        role: data.role,
        isActive: data.isActive,
        inviteToken: data.inviteToken,
        inviteExpiresAt: data.inviteExpiresAt,
        mustChangePassword: data.mustChangePassword,
        lastLoginAt: data.lastLoginAt,
        failedLogins: data.failedLogins,
        lockedUntil: data.lockedUntil,
        updatedAt: new Date(),
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({ where: { id } });
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await this.prisma.user.count({
      where: { email: email.toLowerCase() },
    });
    return count > 0;
  }
}
