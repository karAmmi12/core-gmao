import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

export type UserRole = 'ADMIN' | 'MANAGER' | 'TECHNICIAN' | 'STOCK_MANAGER' | 'OPERATOR' | 'VIEWER';

export interface UserProps {
  id?: string;
  email: string;
  name: string;
  password?: string;
  role?: UserRole;
  isActive?: boolean;
  inviteToken?: string;
  inviteExpiresAt?: Date;
  mustChangePassword?: boolean;
  lastLoginAt?: Date;
  failedLogins?: number;
  lockedUntil?: Date;
  createdAt?: Date;
  createdById?: string;
  updatedAt?: Date;
}

export class User {
  private constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly name: string,
    public readonly password: string | undefined,
    public readonly role: UserRole,
    public readonly isActive: boolean,
    public readonly inviteToken: string | undefined,
    public readonly inviteExpiresAt: Date | undefined,
    public readonly mustChangePassword: boolean,
    public readonly lastLoginAt: Date | undefined,
    public readonly failedLogins: number,
    public readonly lockedUntil: Date | undefined,
    public readonly createdAt: Date,
    public readonly createdById: string | undefined,
    public readonly updatedAt: Date
  ) {}

  // ==========================================================================
  // Factory methods
  // ==========================================================================

  /**
   * Créer un nouvel utilisateur avec invitation
   */
  static createWithInvite(props: {
    email: string;
    name: string;
    role: UserRole;
    createdById?: string;
  }): User {
    const now = new Date();
    const inviteToken = uuidv4();
    const inviteExpiresAt = new Date(now.getTime() + 48 * 60 * 60 * 1000); // 48h

    return new User(
      uuidv4(),
      props.email.toLowerCase().trim(),
      props.name.trim(),
      undefined, // Pas de mot de passe tant que l'invitation n'est pas acceptée
      props.role,
      false, // Inactif jusqu'à activation
      inviteToken,
      inviteExpiresAt,
      true, // Doit changer le MDP
      undefined,
      0,
      undefined,
      now,
      props.createdById,
      now
    );
  }

  /**
   * Créer un admin initial (pour le seed)
   */
  static async createAdmin(props: {
    email: string;
    name: string;
    password: string;
  }): Promise<User> {
    const now = new Date();
    const hashedPassword = await bcrypt.hash(props.password, 12);

    return new User(
      uuidv4(),
      props.email.toLowerCase().trim(),
      props.name.trim(),
      hashedPassword,
      'ADMIN',
      true, // Admin initial actif immédiatement
      undefined,
      undefined,
      false, // Pas besoin de changer le MDP
      undefined,
      0,
      undefined,
      now,
      undefined,
      now
    );
  }

  /**
   * Restaurer un utilisateur depuis la base de données
   */
  static restore(props: UserProps & { id: string }): User {
    return new User(
      props.id,
      props.email,
      props.name,
      props.password,
      props.role || 'OPERATOR',
      props.isActive ?? false,
      props.inviteToken,
      props.inviteExpiresAt,
      props.mustChangePassword ?? true,
      props.lastLoginAt,
      props.failedLogins ?? 0,
      props.lockedUntil,
      props.createdAt || new Date(),
      props.createdById,
      props.updatedAt || new Date()
    );
  }

  // ==========================================================================
  // Business Logic
  // ==========================================================================

  /**
   * Vérifier si l'invitation est encore valide
   */
  isInviteValid(): boolean {
    if (!this.inviteToken || !this.inviteExpiresAt) return false;
    return new Date() < this.inviteExpiresAt;
  }

  /**
   * Vérifier si le compte est verrouillé
   */
  isLocked(): boolean {
    if (!this.lockedUntil) return false;
    return new Date() < this.lockedUntil;
  }

  /**
   * Vérifier le mot de passe
   */
  async verifyPassword(plainPassword: string): Promise<boolean> {
    if (!this.password) return false;
    return bcrypt.compare(plainPassword, this.password);
  }

  /**
   * Activer le compte avec un nouveau mot de passe
   */
  async activate(newPassword: string): Promise<User> {
    if (!this.isInviteValid()) {
      throw new Error("Le lien d'invitation a expiré");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    return new User(
      this.id,
      this.email,
      this.name,
      hashedPassword,
      this.role,
      true, // Maintenant actif
      undefined, // Supprime le token
      undefined,
      false, // Plus besoin de changer le MDP
      undefined,
      0,
      undefined,
      this.createdAt,
      this.createdById,
      new Date()
    );
  }

  /**
   * Changer le mot de passe
   */
  async changePassword(newPassword: string): Promise<User> {
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    return new User(
      this.id,
      this.email,
      this.name,
      hashedPassword,
      this.role,
      this.isActive,
      this.inviteToken,
      this.inviteExpiresAt,
      false, // Plus besoin de changer le MDP
      this.lastLoginAt,
      0, // Reset failed logins
      undefined,
      this.createdAt,
      this.createdById,
      new Date()
    );
  }

  /**
   * Enregistrer une connexion réussie
   */
  recordSuccessfulLogin(): User {
    return new User(
      this.id,
      this.email,
      this.name,
      this.password,
      this.role,
      this.isActive,
      this.inviteToken,
      this.inviteExpiresAt,
      this.mustChangePassword,
      new Date(),
      0, // Reset failed logins
      undefined, // Unlock
      this.createdAt,
      this.createdById,
      new Date()
    );
  }

  /**
   * Enregistrer un échec de connexion
   */
  recordFailedLogin(): User {
    const newFailedLogins = this.failedLogins + 1;
    const MAX_FAILED_ATTEMPTS = 5;
    const LOCK_DURATION_MINUTES = 15;

    let lockedUntil = this.lockedUntil;
    if (newFailedLogins >= MAX_FAILED_ATTEMPTS) {
      lockedUntil = new Date(Date.now() + LOCK_DURATION_MINUTES * 60 * 1000);
    }

    return new User(
      this.id,
      this.email,
      this.name,
      this.password,
      this.role,
      this.isActive,
      this.inviteToken,
      this.inviteExpiresAt,
      this.mustChangePassword,
      this.lastLoginAt,
      newFailedLogins,
      lockedUntil,
      this.createdAt,
      this.createdById,
      new Date()
    );
  }

  /**
   * Régénérer un token d'invitation
   */
  regenerateInvite(): User {
    const now = new Date();
    const inviteToken = uuidv4();
    const inviteExpiresAt = new Date(now.getTime() + 48 * 60 * 60 * 1000);

    return new User(
      this.id,
      this.email,
      this.name,
      undefined, // Reset password
      this.role,
      false, // Désactiver
      inviteToken,
      inviteExpiresAt,
      true,
      this.lastLoginAt,
      0,
      undefined,
      this.createdAt,
      this.createdById,
      now
    );
  }

  /**
   * Mettre à jour le profil
   */
  updateProfile(props: { name?: string; role?: UserRole }): User {
    return new User(
      this.id,
      this.email,
      props.name || this.name,
      this.password,
      props.role || this.role,
      this.isActive,
      this.inviteToken,
      this.inviteExpiresAt,
      this.mustChangePassword,
      this.lastLoginAt,
      this.failedLogins,
      this.lockedUntil,
      this.createdAt,
      this.createdById,
      new Date()
    );
  }

  /**
   * Activer/Désactiver le compte
   */
  setActive(isActive: boolean): User {
    return new User(
      this.id,
      this.email,
      this.name,
      this.password,
      this.role,
      isActive,
      this.inviteToken,
      this.inviteExpiresAt,
      this.mustChangePassword,
      this.lastLoginAt,
      this.failedLogins,
      this.lockedUntil,
      this.createdAt,
      this.createdById,
      new Date()
    );
  }
}

// =============================================================================
// PERMISSIONS
// =============================================================================

export type Permission = 
  // Assets
  | 'assets:read' | 'assets:create' | 'assets:update' | 'assets:delete' | 'assets:change_status'
  // Work Orders
  | 'workorders:read' | 'workorders:create' | 'workorders:update' | 'workorders:complete' | 'workorders:assign'
  // Inventory
  | 'inventory:read' | 'inventory:adjust' | 'inventory:order'
  // Maintenance
  | 'maintenance:read' | 'maintenance:create' | 'maintenance:execute' | 'maintenance:update_reading'
  // Reports
  | 'reports:view' | 'reports:export'
  // Users
  | 'users:manage'
  // Config
  | 'config:manage';

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  ADMIN: [
    'assets:read', 'assets:create', 'assets:update', 'assets:delete', 'assets:change_status',
    'workorders:read', 'workorders:create', 'workorders:update', 'workorders:complete', 'workorders:assign',
    'inventory:read', 'inventory:adjust', 'inventory:order',
    'maintenance:read', 'maintenance:create', 'maintenance:execute', 'maintenance:update_reading',
    'reports:view', 'reports:export',
    'users:manage',
    'config:manage',
  ],
  MANAGER: [
    'assets:read', 'assets:create', 'assets:update', 'assets:change_status',
    'workorders:read', 'workorders:create', 'workorders:update', 'workorders:complete', 'workorders:assign',
    'inventory:read', 'inventory:adjust', 'inventory:order',
    'maintenance:read', 'maintenance:create', 'maintenance:execute', 'maintenance:update_reading',
    'reports:view', 'reports:export',
    'config:manage',
  ],
  STOCK_MANAGER: [
    'assets:read',
    'workorders:read',
    'inventory:read', 'inventory:adjust', 'inventory:order',
    'reports:view', 'reports:export',
  ],
  TECHNICIAN: [
    'assets:read', 'assets:change_status',
    'workorders:read', 'workorders:create', 'workorders:update', 'workorders:complete',
    'inventory:read', 'inventory:adjust',
    'maintenance:read', 'maintenance:execute', 'maintenance:update_reading',
  ],
  OPERATOR: [
    'assets:read',
    'workorders:read', 'workorders:create',
    'maintenance:update_reading',
  ],
  VIEWER: [
    'assets:read',
    'workorders:read',
    'inventory:read',
    'maintenance:read',
    'reports:view',
  ],
};

/**
 * Vérifier si un rôle a une permission
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

/**
 * Obtenir toutes les permissions d'un rôle
 */
export function getPermissions(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role] || [];
}
