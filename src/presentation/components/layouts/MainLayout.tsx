/**
 * Layout principal de l'application GMAO
 * Mobile-first responsive design
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { 
  LayoutDashboard, 
  Box, 
  Wrench, 
  Package, 
  Users, 
  BarChart3, 
  GitBranch,
  Settings,
  Bell,
  Menu,
  X,
  Activity,
  LogOut,
  ChevronDown,
  Shield,
  ClipboardList,
  ShieldCheck,
  MessageSquare,
  Bot
} from 'lucide-react';
import { cn } from '@/styles/design-system';
import { Logo } from '../ui/Logo';
import { useChat } from '@/presentation/providers/ChatProvider';
import type { UserRole } from '@/core/domain/entities/User';

// =============================================================================
// NAVIGATION CONFIG
// =============================================================================

// Définir quels rôles ont accès à chaque route
type NavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  roles?: UserRole[]; // Si undefined, accessible à tous
};

const NAV_ITEMS: NavItem[] = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/hierarchy', label: 'Hiérarchie', icon: GitBranch },
  { href: '/assets', label: 'Équipements', icon: Box },
  { href: '/work-orders', label: 'Interventions', icon: Activity },
  { href: '/approvals', label: 'Approbations', icon: ShieldCheck, roles: ['ADMIN', 'MANAGER'] },
  { href: '/part-requests', label: 'Demandes pièces', icon: ClipboardList, roles: ['ADMIN', 'MANAGER', 'TECHNICIAN', 'STOCK_MANAGER'] },
  { href: '/maintenance', label: 'Maintenance', icon: Wrench, roles: ['ADMIN', 'MANAGER', 'TECHNICIAN'] },
  { href: '/inventory', label: 'Inventaire', icon: Package, roles: ['ADMIN', 'MANAGER', 'STOCK_MANAGER'] },
  { href: '/technicians', label: 'Techniciens', icon: Users, roles: ['ADMIN', 'MANAGER'] },
  { href: '/analytics', label: 'Analytics', icon: BarChart3, roles: ['ADMIN', 'MANAGER', 'VIEWER'] },
  { href: '/settings', label: 'Paramètres', icon: Settings, roles: ['ADMIN', 'MANAGER'] },
];

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Administrateur',
  MANAGER: 'Responsable',
  TECHNICIAN: 'Technicien',
  STOCK_MANAGER: 'Gestionnaire Stock',
  OPERATOR: 'Opérateur',
  VIEWER: 'Lecteur',
};

// =============================================================================
// SIDEBAR
// =============================================================================

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const userRole = session?.user?.role as UserRole | undefined;

  // Filtrer les items de navigation selon le rôle
  const filteredNavItems = NAV_ITEMS.filter(item => {
    // Si pas de restriction de rôle, accessible à tous
    if (!item.roles) return true;
    // Sinon, vérifier si le rôle utilisateur est autorisé
    return userRole && item.roles.includes(userRole);
  });
  
  return (
    <>
      {/* Overlay mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 h-screen w-64 bg-white border-r border-neutral-200 flex flex-col z-50",
        "transform transition-transform duration-300 ease-in-out",
        // Mobile: hidden par défaut, visible si isOpen
        isOpen ? "translate-x-0" : "-translate-x-full",
        // Desktop: toujours visible
        "lg:translate-x-0"
      )}>
        {/* Logo + Close button mobile */}
        <div className="h-16 flex items-center justify-between px-4 lg:px-6 border-b border-neutral-200">
          <Link href="/" onClick={onClose}>
            <Logo />
          </Link>
          <button 
            onClick={onClose}
            className="p-2 text-neutral-600 hover:bg-neutral-100 rounded-lg lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 lg:py-6 px-2 lg:px-3 space-y-1 overflow-y-auto">
          {filteredNavItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== '/' && pathname.startsWith(item.href));
            const Icon = item.icon;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive 
                    ? 'bg-primary-50 text-primary-700' 
                    : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                )}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer - Settings link (only for ADMIN and MANAGER) */}
        {userRole && ['ADMIN', 'MANAGER'].includes(userRole) && (
          <div className="p-3 lg:p-4 border-t border-neutral-200">
            <Link
              href="/settings"
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
            >
              <Settings className="w-5 h-5" />
              Paramètres
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}

// =============================================================================
// CHAT BUTTON
// =============================================================================

function ChatButton() {
  const { toggleChat } = useChat();
  const { data: session } = useSession();
  const userRole = session?.user?.role as UserRole | undefined;

  // Vérifier si l'utilisateur a accès au chat
  const hasAccess = userRole && ['ADMIN', 'MANAGER', 'TECHNICIAN'].includes(userRole);

  if (!hasAccess) return null;

  return (
    <button
      onClick={toggleChat}
      className="relative p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors group"
      title="Assistant IA"
    >
      <Bot className="w-5 h-5" />
      <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
    </button>
  );
}

// =============================================================================
// HEADER
// =============================================================================

interface HeaderProps {
  onMenuClick: () => void;
}

function Header({ onMenuClick }: HeaderProps) {
  const { data: session } = useSession();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const userInitials = session?.user?.name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U';

  const handleSignOut = () => {
    signOut({ callbackUrl: '/login' });
  };

  return (
    <header className={cn(
      "fixed top-0 right-0 h-14 lg:h-16 bg-white border-b border-neutral-200",
      "flex items-center justify-between px-4 lg:px-6 z-30",
      // Mobile: full width
      "left-0",
      // Desktop: offset by sidebar
      "lg:left-64"
    )}>
      {/* Menu burger mobile */}
      <button 
        onClick={onMenuClick}
        className="p-2 -ml-2 text-neutral-600 hover:bg-neutral-100 rounded-lg lg:hidden"
      >
        <Menu className="w-6 h-6" />
      </button>
      
      {/* Logo mobile (centré) */}
      <div className="lg:hidden absolute left-1/2 -translate-x-1/2">
        <Logo showText={false} />
      </div>
      
      {/* Spacer desktop */}
      <div className="hidden lg:block flex-1" />
      
      {/* Actions */}
        
        {/* Chat IA Button */}
        <ChatButton />
      <div className="flex items-center gap-2 lg:gap-4">

        
        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 lg:gap-3 pl-2 lg:pl-4 border-l border-neutral-200 hover:bg-neutral-50 rounded-lg py-1 pr-2 transition-colors"
          >
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-sm font-semibold text-primary-700">{userInitials}</span>
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-neutral-900">{session?.user?.name || 'Utilisateur'}</p>
              <p className="text-xs text-neutral-500">{ROLE_LABELS[session?.user?.role || 'VIEWER'] || 'Utilisateur'}</p>
            </div>
            <ChevronDown className="w-4 h-4 text-neutral-400 hidden md:block" />
          </button>

          {/* Dropdown menu */}
          {showUserMenu && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowUserMenu(false)} 
              />
              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-lg border border-neutral-200 py-2 z-50">
                {/* User info */}
                <div className="px-4 py-2 border-b border-neutral-100">
                  <p className="font-medium text-neutral-900">{session?.user?.name}</p>
                  <p className="text-sm text-neutral-500">{session?.user?.email}</p>
                </div>
                
                {/* Admin link */}
                {session?.user?.role === 'ADMIN' && (
                  <Link
                    href="/users"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                  >
                    <Shield className="w-4 h-4" />
                    Gestion utilisateurs
                  </Link>
                )}
                
                {/* Settings */}
                <Link
                  href="/settings"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-3 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  Paramètres
                </Link>
                
                {/* Logout */}
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-danger-600 hover:bg-danger-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Se déconnecter
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

// =============================================================================
// MAIN LAYOUT
// =============================================================================

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-neutral-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Header onMenuClick={() => setSidebarOpen(true)} />
      
      {/* Main content */}
      <main className={cn(
        // Mobile: full width, offset by header
        "pt-14 min-h-screen",
        // Desktop: offset by sidebar
        "lg:ml-64 lg:pt-16"
      )}>
        <div className="p-4 lg:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
