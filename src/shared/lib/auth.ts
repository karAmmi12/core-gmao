// Note: ce fichier est dans src/lib/auth.ts
import { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import DIContainer from '@/core/infrastructure/di/DIContainer';
import { getPermissions } from '@/core/domain/entities/User';

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Mot de passe', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email et mot de passe requis');
        }

        const userRepo = DIContainer.getUserRepository();
        const user = await userRepo.findByEmail(credentials.email);

        if (!user) {
          throw new Error('Identifiants incorrects');
        }

        if (!user.isActive) {
          throw new Error('Compte désactivé. Contactez l\'administrateur.');
        }

        if (user.isLocked()) {
          throw new Error('Compte verrouillé. Réessayez plus tard.');
        }

        const isValid = await user.verifyPassword(credentials.password);

        if (!isValid) {
          // Enregistrer l'échec
          const updatedUser = user.recordFailedLogin();
          await userRepo.update(updatedUser);
          throw new Error('Identifiants incorrects');
        }

        // Connexion réussie
        const loggedUser = user.recordSuccessfulLogin();
        await userRepo.update(loggedUser);

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          technicianId: user.technicianId, // Pour filtrer les interventions assignées
          permissions: getPermissions(user.role),
          mustChangePassword: user.mustChangePassword,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 8 * 60 * 60, // 8 heures
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;
        token.technicianId = user.technicianId;
        token.permissions = user.permissions;
        token.mustChangePassword = user.mustChangePassword;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        id: token.id,
        email: token.email,
        name: token.name,
        role: token.role,
        technicianId: token.technicianId,
        permissions: token.permissions,
        mustChangePassword: token.mustChangePassword,
      };
      return session;
    },
  },
};
