import { Card } from '@/presentation/components/ui/Card';

/**
 * Composant de chargement pour les sections
 */
export const SectionSkeleton = () => {
  return (
    <Card className="animate-pulse">
      <div className="h-6 bg-neutral-200 rounded w-1/3 mb-4"></div>
      <div className="space-y-3">
        <div className="h-4 bg-neutral-200 rounded"></div>
        <div className="h-4 bg-neutral-200 rounded w-5/6"></div>
      </div>
    </Card>
  );
};

/**
 * Composant de chargement pour les statistiques
 */
export const StatsSkeleton = () => {
  return (
    <div className="grid-stats">
      {[...Array(4)].map((_, i) => (
        <Card key={i} className="animate-pulse">
          <div className="h-5 bg-neutral-200 rounded w-1/2 mb-3"></div>
          <div className="h-8 bg-neutral-200 rounded w-2/3 mb-2"></div>
          <div className="h-4 bg-neutral-200 rounded w-1/2"></div>
        </Card>
      ))}
    </div>
  );
};

/**
 * Composant de chargement pour le tableau
 */
export const TableSkeleton = () => {
  return (
    <Card className="overflow-hidden p-0">
      <div className="border-b border-neutral-200 px-6 py-4 bg-neutral-50">
        <div className="h-6 bg-neutral-200 rounded w-1/4 animate-pulse"></div>
      </div>
      <div className="p-6 space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4 animate-pulse">
            <div className="h-4 bg-neutral-200 rounded w-1/4"></div>
            <div className="h-4 bg-neutral-200 rounded w-1/4"></div>
            <div className="h-4 bg-neutral-200 rounded w-1/6"></div>
            <div className="h-4 bg-neutral-200 rounded w-1/6"></div>
          </div>
        ))}
      </div>
    </Card>
  );
};
