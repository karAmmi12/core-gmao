/**
 * Filtres pour les demandes de pièces
 * Composant réutilisable pour la barre de filtrage
 */

import { Select, Button } from '@/components';
import { Filter, X } from 'lucide-react';
import { LAYOUT_STYLES } from '@/styles/design-system';
import type { PartRequestStats } from '@/presentation/hooks/domain';

interface PartRequestFiltersProps {
  filters: {
    status: string;
    urgency?: string;
  };
  stats: PartRequestStats;
  onFilterChange: (key: string, value: string) => void;
  onReset?: () => void;
  activeFiltersCount?: number;
}

export function PartRequestFilters({ 
  filters, 
  stats,
  onFilterChange,
  onReset,
  activeFiltersCount = 0
}: PartRequestFiltersProps) {
  return (
    <div className={LAYOUT_STYLES.flexResponsiveBetween}>
      <div className={LAYOUT_STYLES.flexRow}>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-neutral-500" />
          <span className="text-sm text-neutral-600 font-medium">Filtres</span>
        </div>
        
        {/* Filtre statut */}
        <Select
          value={filters.status}
          onChange={(e) => onFilterChange('status', e.target.value)}
          className="min-w-37.5"
        >
          <option value="all">Tous ({stats.total})</option>
          <option value="PENDING">En attente ({stats.pending})</option>
          <option value="APPROVED">Approuvé ({stats.approved})</option>
          <option value="DELIVERED">Livré ({stats.delivered})</option>
          <option value="REJECTED">Refusé ({stats.rejected})</option>
        </Select>

        {/* Filtre urgence */}
        <Select
          value={filters.urgency || 'all'}
          onChange={(e) => onFilterChange('urgency', e.target.value)}
          className="min-w-32.5"
        >
          <option value="all">Toutes urgences</option>
          <option value="CRITICAL">🔴 Critique</option>
          <option value="HIGH">🟠 Haute</option>
          <option value="NORMAL">🔵 Normale</option>
          <option value="LOW">⚪ Basse</option>
        </Select>
      </div>

      {/* Reset filters */}
      {activeFiltersCount > 0 && onReset && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          icon={<X className="w-4 h-4" />}
        >
          Réinitialiser ({activeFiltersCount})
        </Button>
      )}
    </div>
  );
}
