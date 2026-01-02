/**
 * Statistiques des demandes de pièces
 * Affichage cards avec métriques
 */

import { StatsGrid, StatCard } from '@/components';
import type { PartRequestStats } from '@/presentation/hooks/domain';

interface PartRequestStatsProps {
  stats: PartRequestStats;
}

export function PartRequestStatsDisplay({ stats }: PartRequestStatsProps) {
  return (
    <StatsGrid columns={5}>
      <StatCard
        label="Total"
        value={stats.total}
        icon={<span className="text-2xl">📦</span>}
        color="neutral"
      />
      <StatCard
        label="En attente"
        value={stats.pending}
        icon={<span className="text-2xl">⏳</span>}
        color="warning"
      />
      <StatCard
        label="Approuvées"
        value={stats.approved}
        icon={<span className="text-2xl">✅</span>}
        color="success"
      />
      <StatCard
        label="Livrées"
        value={stats.delivered}
        icon={<span className="text-2xl">🚚</span>}
        color="primary"
      />
      <StatCard
        label="Refusées"
        value={stats.rejected}
        icon={<span className="text-2xl">❌</span>}
        color="danger"
      />
    </StatsGrid>
  );
}
