/**
 * Layout principal de l'application GMAO
 * Mobile-first responsive design
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode, useState } from 'react';
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
  X
} from 'lucide-react';
import { cn } from '@/styles/design-system';
import { Logo } from '../ui/Logo';

// =============================================================================
// NAVIGATION CONFIG
// =============================================================================

const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/hierarchy', label: 'Hiérarchie', icon: GitBranch },
  { href: '/assets', label: 'Équipements', icon: Box },
  { href: '/maintenance', label: 'Maintenance', icon: Wrench },
  { href: '/inventory', label: 'Inventaire', icon: Package },
  { href: '/technicians', label: 'Techniciens', icon: Users },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/settings', label: 'Paramètres', icon: Settings },
] as const;

// =============================================================================
// SIDEBAR
// =============================================================================

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  
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
          {NAV_ITEMS.map((item) => {
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

        {/* Footer */}
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
      </aside>
    </>
  );
}

// =============================================================================
// HEADER
// =============================================================================

interface HeaderProps {
  onMenuClick: () => void;
}

function Header({ onMenuClick }: HeaderProps) {
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
      <div className="flex items-center gap-2 lg:gap-4">
        {/* Notifications */}
        <button className="relative p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger-500 rounded-full" />
        </button>
        
        {/* User */}
        <div className="flex items-center gap-2 lg:gap-3 pl-2 lg:pl-4 border-l border-neutral-200">
          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
            <span className="text-sm font-semibold text-primary-700">AD</span>
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-neutral-900">Admin</p>
            <p className="text-xs text-neutral-500">Responsable</p>
          </div>
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
