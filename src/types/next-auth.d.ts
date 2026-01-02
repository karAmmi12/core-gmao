import { UserRole, Permission } from '@/core/domain/entities/User';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: UserRole;
      technicianId: string | null;
      permissions: Permission[];
      mustChangePassword: boolean;
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    technicianId: string | null;
    permissions: Permission[];
    mustChangePassword: boolean;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    technicianId: string | null;
    permissions: Permission[];
    mustChangePassword: boolean;
  }
}
