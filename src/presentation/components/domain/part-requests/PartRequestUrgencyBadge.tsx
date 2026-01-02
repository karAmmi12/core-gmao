/**
 * Badge d'urgence pour les demandes de pièces
 */

import { PART_REQUEST_URGENCY_CONFIG } from '@/presentation/hooks/domain';
import type { PartRequest } from '@/presentation/hooks/domain';
import { cn } from '@/styles/design-system';

interface PartRequestUrgencyBadgeProps {
  urgency: PartRequest['urgency'];
  className?: string;
}

export function PartRequestUrgencyBadge({ 
  urgency, 
  className 
}: PartRequestUrgencyBadgeProps) {
  const config = PART_REQUEST_URGENCY_CONFIG[urgency];
  
  return (
    <span className={cn('text-sm', config.color, className)}>
      {config.label}
    </span>
  );
}
