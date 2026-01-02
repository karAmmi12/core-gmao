/**
 * Badge de statut pour les demandes de pièces
 * Composant présentationnel réutilisable
 */

import { Badge } from '@/components';
import { PART_REQUEST_STATUS_CONFIG } from '@/presentation/hooks/domain';
import type { PartRequest } from '@/presentation/hooks/domain';

interface PartRequestStatusBadgeProps {
  status: PartRequest['status'];
  className?: string;
}

export function PartRequestStatusBadge({ 
  status, 
  className 
}: PartRequestStatusBadgeProps) {
  const config = PART_REQUEST_STATUS_CONFIG[status];
  
  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  );
}
