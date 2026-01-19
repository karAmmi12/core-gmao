'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Activity, Plus, Filter, Calendar, User, PlayCircle, Pencil, Eye, Ban, MoreVertical } from 'lucide-react';
import { WorkOrderDTO } from '@/core/application/dto/WorkOrderDTO';
import { startWorkOrderAction, cancelWorkOrderAction } from '@/app/actions';
import {
  Card,
  Badge,
  LinkButton,
  Button,
  Input,
  Select,
  PageHeader,
  DataTable,
  EmptyState,
  Pagination,
  type Column
} from '@/components';
import { useSearch } from '@/presentation/hooks';
import { LAYOUT_STYLES } from '@/styles/design-system';

// ============================================================================
// Types
// ============================================================================

interface WorkOrdersContentProps {
  workOrders: WorkOrderDTO[];
  technicians: { id: string; name: string }[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
  };
}

type StatusFilter = 'ALL' | 'DRAFT' | 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
type PriorityFilter = 'ALL' | 'LOW' | 'HIGH';
type TypeFilter = 'ALL' | 'CORRECTIVE' | 'PREVENTIVE' | 'PREDICTIVE' | 'CONDITIONAL';

const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Brouillon',
  PLANNED: 'Planifiée',
  IN_PROGRESS: 'En cours',
  COMPLETED: 'Terminée',
  CANCELLED: 'Annulée'
};

const PRIORITY_LABELS: Record<string, string> = {
  LOW: 'Normale',
  HIGH: 'Urgente'
};

const TYPE_LABELS: Record<string, { label: string; icon: string; source: string }> = {
  CORRECTIVE: { label: 'Corrective', icon: '🔧', source: 'manuelle' },
  PREVENTIVE: { label: 'Préventive', icon: '📅', source: 'planifiée' },
  PREDICTIVE: { label: 'Prédictive', icon: '📊', source: 'planifiée' },
  CONDITIONAL: { label: 'Conditionnelle', icon: '👁️', source: 'manuelle' }
};

const TYPE_COLORS: Record<string, 'danger' | 'success' | 'primary' | 'warning'> = {
  CORRECTIVE: 'danger',
  PREVENTIVE: 'success',
  PREDICTIVE: 'primary',
  CONDITIONAL: 'warning'
};

// ============================================================================
// Main Component
// ============================================================================

export default function WorkOrdersContent({ workOrders, technicians, pagination }: WorkOrdersContentProps) {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('ALL');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('ALL');
  const [technicianFilter, setTechnicianFilter] = useState<string>('ALL');
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const { query, setQuery, filteredItems } = useSearch(workOrders, {
    searchKeys: ['title', 'description']
  });

  // Pagination handler
  const handlePageChange = (page: number) => {
    router.push(`/work-orders?page=${page}`);
  };

  // Quick actions
  const handleStartWork = async (orderId: string) => {
    setLoadingId(orderId);
    const formData = new FormData();
    formData.set('workOrderId', orderId);
    const result = await startWorkOrderAction({ success: false }, formData);
    setLoadingId(null);
    if (result?.success) {
      router.refresh();
    }
  };

  const handleCancel = async (orderId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir annuler cette intervention ?')) return;
    setLoadingId(orderId);
    const formData = new FormData();
    formData.set('workOrderId', orderId);
    const result = await cancelWorkOrderAction({ success: false }, formData);
    setLoadingId(null);
    if (result?.success) {
      router.refresh();
    }
  };

  // Apply filters
  const filteredOrders = filteredItems.filter((order) => {
    if (statusFilter !== 'ALL' && order.status !== statusFilter) return false;
    if (priorityFilter !== 'ALL' && order.priority !== priorityFilter) return false;
    if (typeFilter !== 'ALL' && order.type !== typeFilter) return false;
    if (technicianFilter !== 'ALL' && order.assignedToId !== technicianFilter) return false;
    return true;
  });

  // Table columns
  const columns: Column<WorkOrderDTO>[] = [
    {
      key: 'title',
      header: 'Intervention',
      render: (order) => (
        <Link href={`/work-orders/${order.id}`} className="hover:text-primary-600">
          <div className="font-medium">{order.title}</div>
          {order.description && (
            <div className="text-xs text-neutral-500 mt-0.5 line-clamp-1">{order.description}</div>
          )}
        </Link>
      )
    },
    {
      key: 'status',
      header: 'Statut',
      render: (order) => (
        <Badge
          variant={
            order.status === 'COMPLETED' ? 'success' :
            order.status === 'IN_PROGRESS' ? 'primary' :
            order.status === 'PLANNED' ? 'primary' :
            order.status === 'CANCELLED' ? 'neutral' : 'warning'
          }
          size="sm"
        >
          {STATUS_LABELS[order.status]}
        </Badge>
      )
    },
    {
      key: 'type',
      header: 'Type',
      render: (order) => {
        const typeInfo = TYPE_LABELS[order.type];
        return (
          <Badge
            variant={TYPE_COLORS[order.type] || 'neutral'}
            size="sm"
          >
            {typeInfo ? `${typeInfo.icon} ${typeInfo.label}` : order.type}
          </Badge>
        );
      }
    },
    {
      key: 'priority',
      header: 'Priorité',
      render: (order) => (
        <Badge
          variant={order.priority === 'HIGH' ? 'danger' : 'neutral'}
          size="sm"
        >
          {PRIORITY_LABELS[order.priority]}
        </Badge>
      )
    },
    {
      key: 'scheduledAt',
      header: 'Date prévue',
      render: (order) => order.scheduledAt ? (
        <div className="text-sm flex items-center gap-1.5">
          <Calendar size={14} className="text-neutral-400" />
          {new Date(order.scheduledAt).toLocaleDateString('fr-FR')}
        </div>
      ) : (
        <span className="text-neutral-400 text-sm">-</span>
      )
    },
    {
      key: 'assignedToId',
      header: 'Technicien',
      render: (order) => {
        const tech = technicians.find(t => t.id === order.assignedToId);
        return tech ? (
          <div className="text-sm flex items-center gap-1.5">
            <User size={14} className="text-neutral-400" />
            {tech.name}
          </div>
        ) : (
          <span className="text-neutral-400 text-sm">Non assigné</span>
        );
      }
    },
    {
      key: 'totalCost',
      header: 'Coût total',
      render: (order) => (
        <div className="text-sm font-medium">
          {order.totalCost > 0 ? `${order.totalCost.toFixed(2)} €` : '-'}
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (order) => {
        const canEdit = order.status !== 'COMPLETED' && order.status !== 'CANCELLED';
        const canStart = order.status === 'DRAFT' || order.status === 'PLANNED';
        const canCancel = order.status !== 'COMPLETED' && order.status !== 'CANCELLED';
        const isLoading = loadingId === order.id;

        return (
          <div className="flex items-center gap-1">
            <Link href={`/work-orders/${order.id}`}>
              <Button variant="ghost" size="sm" title="Voir">
                <Eye size={16} />
              </Button>
            </Link>
            
            {canEdit && (
              <Link href={`/work-orders/${order.id}/edit`}>
                <Button variant="ghost" size="sm" title="Modifier">
                  <Pencil size={16} />
                </Button>
              </Link>
            )}
            
            {canStart && (
              <Button 
                variant="ghost" 
                size="sm" 
                title="Démarrer"
                onClick={() => handleStartWork(order.id)}
                disabled={isLoading}
              >
                <PlayCircle size={16} className="text-primary-600" />
              </Button>
            )}
            
            {canCancel && (
              <Button 
                variant="ghost" 
                size="sm" 
                title="Annuler"
                onClick={() => handleCancel(order.id)}
                disabled={isLoading}
              >
                <Ban size={16} className="text-danger-600" />
              </Button>
            )}
          </div>
        );
      }
    }
  ];

  return (
    <div className="min-h-screen bg-neutral-50">
      <PageHeader
        icon="🔧"
        title="Interventions"
        description="Gestion des ordres de travail et interventions"
        actions={
          <LinkButton href="/work-orders/new" icon={<Plus size={18} />}>
            Nouvelle intervention
          </LinkButton>
        }
      />

      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Filters */}
        <Card>
          <div className={LAYOUT_STYLES.gridResponsive2}>
            <Input
              placeholder="Rechercher une intervention..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />

            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            >
              <option value="ALL">Tous les statuts</option>
              <option value="DRAFT">Brouillon</option>
              <option value="PLANNED">Planifiée</option>
              <option value="IN_PROGRESS">En cours</option>
              <option value="COMPLETED">Terminée</option>
              <option value="CANCELLED">Annulée</option>
            </Select>

            <Select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as PriorityFilter)}
            >
              <option value="ALL">Toutes priorités</option>
              <option value="LOW">Normale</option>
              <option value="HIGH">Urgente</option>
            </Select>

            <Select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as TypeFilter)}
            >
              <option value="ALL">Tous les types</option>
              <option value="CORRECTIVE">🔧 Corrective</option>
              <option value="CONDITIONAL">👁️ Conditionnelle</option>
              <option value="PREVENTIVE">📅 Préventive (planifiée)</option>
              <option value="PREDICTIVE">📊 Prédictive (planifiée)</option>
            </Select>

            <Select
              value={technicianFilter}
              onChange={(e) => setTechnicianFilter(e.target.value)}
            >
              <option value="ALL">Tous les techniciens</option>
              <option value="">Non assigné</option>
              {technicians.map((tech) => (
                <option key={tech.id} value={tech.id}>
                  {tech.name}
                </option>
              ))}
            </Select>
          </div>

          {filteredOrders.length < workOrders.length && (
            <div className="mt-4 pt-4 border-t border-neutral-200 text-sm text-neutral-600 flex items-center gap-2">
              <Filter size={16} />
              {filteredOrders.length} intervention(s) affichée(s) sur {workOrders.length}
            </div>
          )}
        </Card>

        {/* Table */}
        {filteredOrders.length === 0 ? (
          <EmptyState
            icon={<Activity size={48} className="text-neutral-400" />}
            title={query || statusFilter !== 'ALL' || priorityFilter !== 'ALL' || typeFilter !== 'ALL' || technicianFilter !== 'ALL' 
              ? 'Aucune intervention trouvée'
              : 'Aucune intervention'}
            description={query || statusFilter !== 'ALL' || priorityFilter !== 'ALL' || typeFilter !== 'ALL' || technicianFilter !== 'ALL'
              ? 'Essayez de modifier vos filtres'
              : 'Créez votre première intervention'}
          />
        ) : (
          <>
            <DataTable
              columns={columns}
              data={filteredOrders}
              keyField="id"
            />
            {pagination.totalPages > 1 && (
              <Card className="mt-4">
                <Pagination
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  totalItems={pagination.totalItems}
                  pageSize={pagination.pageSize}
                  onPageChange={handlePageChange}
                />
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}
