/**
 * Liste de demandes de pièces
 * Affichage en grille responsive
 */

import { EmptyState } from '@/components';
import { Package } from 'lucide-react';
import type { PartRequest } from '@/presentation/hooks/domain';
import { PartRequestCard } from './PartRequestCard';

interface PartRequestListProps {
  requests: PartRequest[];
  isManager?: boolean;
  isStockManager?: boolean;
  isPending?: boolean;
  onApprove?: (id: string) => void;
  onReject?: (id: string, reason: string) => void;
  onDeliver?: (id: string) => void;
  onCancel?: (id: string) => void;
  emptyMessage?: string;
}

export function PartRequestList({ 
  requests,
  isManager,
  isStockManager,
  isPending,
  onApprove,
  onReject,
  onDeliver,
  onCancel,
  emptyMessage = 'Aucune demande de pièce'
}: PartRequestListProps) {
  if (requests.length === 0) {
    return (
      <EmptyState
        icon={<Package className="w-12 h-12" />}
        title={emptyMessage}
        description="Les demandes de pièces apparaîtront ici"
      />
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {requests.map((request) => (
        <PartRequestCard
          key={request.id}
          request={request}
          isManager={isManager}
          isStockManager={isStockManager}
          isPending={isPending}
          onApprove={onApprove}
          onReject={onReject}
          onDeliver={onDeliver}
          onCancel={onCancel}
        />
      ))}
    </div>
  );
}
