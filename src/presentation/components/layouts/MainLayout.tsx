import { ReactNode } from 'react';
import Link from 'next/link';
import { Logo } from '@/presentation/components/ui/Logo';
import { layoutClasses } from '@/styles/theme';

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className={layoutClasses.pageBackground}>
      <header className={layoutClasses.header}>
        <div className={layoutClasses.headerContent}>
          <Logo />
          <nav className={layoutClasses.nav}>
            <Link href="/" className="link-primary">
              Tableau de bord
            </Link>
            <Link href="/hierarchy" className="link-neutral">
              Hiérarchie
            </Link>
            <Link href="/technicians" className="link-neutral">
              Techniciens
            </Link>
            <Link href="/inventory" className="link-neutral">
              Inventaire
            </Link>
            <Link href="/maintenance" className="link-neutral">
              Maintenance
            </Link>
            <Link href="#" className="link-neutral">
              Historique
            </Link>
          </nav>
        </div>
      </header>
      <main className={layoutClasses.main}>
        {children}
      </main>
    </div>
  );
};
