/**
 * EXEMPLE DE REFACTORISATION - PartRequestsContent
 * 
 * AVANT: 482 lignes avec logique, état UI et rendering mélangés
 * APRÈS: ~80 lignes avec pattern Container/Presentation
 * 
 * Ce fichier montre comment utiliser les nouveaux hooks et composants
 */

'use client';

import { PageHeader, Button, LinkButton } from '@/components';
import { Plus } from 'lucide-react';
import { LAYOUT_STYLES } from '@/styles/design-system';
import { useState } from 'react';

// Nouveaux hooks domain
import { 
  usePartRequests, 
  useServerActions,
  type PartRequest 
} from '@/presentation/hooks/domain';

// Nouveaux composants domain
import {
  PartRequestList,
  PartRequestFilters,
  PartRequestStatsDisplay,
} from '@/presentation/components/domain/part-requests';

// Actions serveur
import {
  createPartRequest,
  approvePartRequest,
  rejectPartRequest,
  deliverPartRequest,
  cancelPartRequest,
} from '@/app/part-requests/actions';

interface PartRequestsContentRefactoredProps {
  requests: PartRequest[];
  pendingCount: number;
  isManager: boolean;
  isStockManager: boolean;
  userId: string;
  parts: Array<{
    id: string;
    reference: string;
    name: string;
    quantityInStock: number;
  }>;
}

export function PartRequestsContentRefactored({
  requests: initialRequests,
  pendingCount,
  isManager,
  isStockManager,
  userId,
  parts,
}: PartRequestsContentRefactoredProps) {
  const [showForm, setShowForm] = useState(false);

  // ✅ Hook métier - gère filtres + stats
  const { 
    requests, 
    stats, 
    filters, 
    updateFilter, 
    resetFilters,
    activeFiltersCount 
  } = usePartRequests(initialRequests);

  // ✅ Hook actions serveur - gère loading + errors
  const actions = useServerActions({
    approve: approvePartRequest,
    reject: rejectPartRequest,
    deliver: deliverPartRequest,
    cancel: cancelPartRequest,
  });

  // Détection du rôle pour actions
  const canApprove = isManager;
  const canDeliver = isStockManager;

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Demandes de Pièces"
        description={`${stats.total} demandes • ${stats.pending} en attente`}
        icon="📦"
        actions={
          <div className={LAYOUT_STYLES.flexRow}>
            {pendingCount > 0 && canApprove && (
              <Button variant="warning" size="sm">
                {pendingCount} à valider
              </Button>
            )}
            <LinkButton href="/part-requests/new" variant="primary" icon={<Plus />}>
              Nouvelle demande
            </LinkButton>
          </div>
        }
      />

      {/* Stats */}
      <PartRequestStatsDisplay stats={stats} />

      {/* Filtres */}
      <PartRequestFilters
        filters={filters}
        stats={stats}
        onFilterChange={updateFilter}
        onReset={resetFilters}
        activeFiltersCount={activeFiltersCount}
      />

      {/* Liste */}
      <PartRequestList
        requests={requests}
        isManager={canApprove}
        isStockManager={canDeliver}
        isPending={
          actions.approve.isPending || 
          actions.reject.isPending || 
          actions.deliver.isPending
        }
        onApprove={actions.approve.execute}
        onReject={(id, reason) => actions.reject.execute(id, reason)}
        onDeliver={actions.deliver.execute}
        onCancel={actions.cancel.execute}
      />
    </div>
  );
}

/**
 * COMPARAISON AVANT/APRÈS
 * 
 * AVANT (PartRequestsContent.tsx - 482 lignes):
 * ❌ const [isPending, startTransition] = useTransition() - répété partout
 * ❌ const [showForm, setShowForm] = useState(false) 
 * ❌ const [statusFilter, setStatusFilter] = useState('all')
 * ❌ const [rejectingId, setRejectingId] = useState(null)
 * ❌ const [rejectionReason, setRejectionReason] = useState('')
 * ❌ const filteredRequests = requests.filter(r => ...) - logique inline
 * ❌ const stats = { pending: requests.filter... } - calcul répété
 * ❌ const handleApprove = async (id) => { startTransition... } - 20 lignes
 * ❌ const handleReject = async (id) => { ... } - 20 lignes
 * ❌ 400+ lignes de JSX avec logique d'affichage mélangée
 * 
 * APRÈS (PartRequestsContentRefactored.tsx - 80 lignes):
 * ✅ const { requests, stats, filters, updateFilter } = usePartRequests()
 * ✅ const actions = useServerActions({ approve, reject, deliver })
 * ✅ <PartRequestFilters /> - composant réutilisable
 * ✅ <PartRequestList /> - composant réutilisable
 * ✅ actions.approve.execute(id) - API simple et propre
 * 
 * BÉNÉFICES:
 * - 💪 Réutilisabilité: Les hooks peuvent servir ailleurs
 * - 🧪 Testabilité: Hooks isolés = faciles à tester
 * - 📖 Lisibilité: Intention claire, pas de mélange logique/UI
 * - 🔧 Maintenabilité: Changement localisé
 * - ⚡ Performance: Mémoisation optimisée dans les hooks
 */
