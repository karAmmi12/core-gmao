import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

// Routes publiques (pas besoin d'auth)
const publicRoutes = ['/login', '/invite', '/api/auth'];

// Routes par rôle minimum requis
const roleRoutes: Record<string, string[]> = {
  '/users': ['ADMIN'],
  '/settings': ['ADMIN', 'MANAGER'],
  '/technicians': ['ADMIN', 'MANAGER'],
  '/part-requests': ['ADMIN', 'MANAGER', 'TECHNICIAN', 'STOCK_MANAGER'],
  '/maintenance': ['ADMIN', 'MANAGER', 'TECHNICIAN'],
  '/inventory': ['ADMIN', 'MANAGER', 'STOCK_MANAGER'],
  '/analytics': ['ADMIN', 'MANAGER', 'VIEWER'],
};

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Si l'utilisateur doit changer son mot de passe
    if (token?.mustChangePassword && pathname !== '/change-password' && !pathname.startsWith('/api')) {
      return NextResponse.redirect(new URL('/change-password', req.url));
    }

    // Vérifier les permissions par route
    for (const [route, allowedRoles] of Object.entries(roleRoutes)) {
      if (pathname.startsWith(route)) {
        if (!token?.role || !allowedRoles.includes(token.role)) {
          return NextResponse.redirect(new URL('/', req.url));
        }
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // Routes publiques
        if (publicRoutes.some(route => pathname.startsWith(route))) {
          return true;
        }

        // Toutes les autres routes nécessitent une connexion
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
