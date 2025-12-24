import { Suspense } from 'react';
import { StatsSkeleton, TableSkeleton } from './LoadingSkeletons';

/**
 * Composant de chargement pour la page dashboard
 */
export const DashboardLoading = () => {
  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="mb-8">
        <div className="h-8 bg-slate-200 rounded w-1/3 mb-2 animate-pulse"></div>
        <div className="h-4 bg-slate-200 rounded w-1/4 animate-pulse"></div>
      </div>

      <div className="mb-8">
        <StatsSkeleton />
      </div>

      <div className="mb-8">
        <TableSkeleton />
      </div>
    </div>
  );
};

/**
 * HOC pour ajouter un loading state à un composant async
 */
export function withLoading<T extends object>(
  Component: React.ComponentType<T>,
  LoadingComponent: React.ComponentType
) {
  return function WithLoadingComponent(props: T) {
    return (
      <Suspense fallback={<LoadingComponent />}>
        <Component {...props} />
      </Suspense>
    );
  };
}
