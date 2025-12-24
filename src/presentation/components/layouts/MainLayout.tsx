import { ReactNode } from 'react';
import Link from 'next/link';
import { Logo } from '@/presentation/components/ui/Logo';

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="min-h-screen bg-slate-50/50 font-sans text-slate-900">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Logo />
          <nav className="flex gap-4 text-sm font-medium">
            <Link href="/" className="text-orange-600 hover:text-orange-500 transition-colors">
              Tableau de bord
            </Link>
            <Link href="#" className="text-slate-600 hover:text-slate-900 transition-colors">
              Historique
            </Link>
          </nav>
        </div>
      </header>
      <main className="pb-20">
        {children}
      </main>
    </div>
  );
};
