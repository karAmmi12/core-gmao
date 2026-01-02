'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ShieldCheck, ShieldX, Clock, AlertTriangle, Calendar, 
  User, Package, Eye, CheckCircle, XCircle, Filter
} from 'lucide-react';
import {
  Card,
  Badge,
  Button,
  Alert,
  PageHeader,
  Textarea,
  Modal
} from '@/components';
import { LAYOUT_STYLES } from '@/styles/design-system';
import {
  approveWorkOrderAction,
  rejectWorkOrderAction
} from '@/app/work-orders/actions';

// ============================================================================
// Types
// ============================================================================

interface PendingWorkOrder {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: 'LOW' | 'HIGH';
  type: 'CORRECTIVE' | 'PREVENTIVE' | 'PREDICTIVE' | 'CONDITIONAL';
  assetId: string;
  assetName: string;
  assignedToId?: string;
  assignedToName?: string;
  createdAt: string;
  scheduledAt?: string;
  estimatedCost?: number;
  requiresApproval: boolean;
}

interface Stats {
  total: number;
  urgent: number;
  preventive: number;
  corrective: number;
}

interface PendingApprovalsViewProps {
  workOrders: PendingWorkOrder[];
  stats: Stats;
}

const TYPE_CONFIG = {
  CORRECTIVE: { label: 'Corrective', variant: 'danger' as const, icon: '🔧' },
  PREVENTIVE: { label: 'Préventive', variant: 'success' as const, icon: '📅' },
  PREDICTIVE: { label: 'Prédictive', variant: 'primary' as const, icon: '📊' },
  CONDITIONAL: { label: 'Conditionnelle', variant: 'warning' as const, icon: '👁️' },
};

// ============================================================================
// Reject Modal Component
// ============================================================================

function RejectModal({ 
  isOpen, 
  workOrderTitle,
  onClose, 
  onConfirm, 
  isPending 
}: { 
  isOpen: boolean; 
  workOrderTitle: string;
  onClose: () => void; 
  onConfirm: (reason: string) => void;
  isPending: boolean;
}) {
  const [reason, setReason] = useState('');

  const handleConfirm = () => {
    if (reason.trim()) {
      onConfirm(reason);
      setReason('');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Rejeter l'intervention" size="md">
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-3 bg-danger-50 border border-danger-200 rounded-lg">
          <ShieldX className="text-danger-600 mt-0.5" size={20} />
          <div>
            <p className="font-medium text-danger-800">Rejet de "{workOrderTitle}"</p>
            <p className="text-sm text-danger-700">
              Vous devez indiquer une raison pour le rejet de cette intervention.
            </p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Raison du rejet <span className="text-red-500">*</span>
          </label>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Expliquez pourquoi cette intervention est rejetée..."
            rows={3}
            disabled={isPending}
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Annuler
          </Button>
          <Button 
            variant="danger" 
            onClick={handleConfirm}
            loading={isPending}
            disabled={!reason.trim()}
          >
            Confirmer le rejet
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// ============================================================================
// Work Order Card Component
// ============================================================================

function WorkOrderCard({ 
  workOrder, 
  onApprove, 
  onReject,
  isApproving,
  isRejecting
}: { 
  workOrder: PendingWorkOrder;
  onApprove: () => void;
  onReject: () => void;
  isApproving: boolean;
  isRejecting: boolean;
}) {
  const typeConfig = TYPE_CONFIG[workOrder.type];
  const isUrgent = workOrder.priority === 'HIGH';

  return (
    <Card className={isUrgent ? 'border-danger-300 bg-danger-50/30' : ''}>
      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {isUrgent && (
                <Badge variant="danger" size="sm">
                  <AlertTriangle size={12} className="mr-1" />
                  Urgent
                </Badge>
              )}
              <Badge variant={typeConfig.variant} size="sm">
                {typeConfig.icon} {typeConfig.label}
              </Badge>
            </div>
            <h3 className="font-semibold text-neutral-900 truncate">
              {workOrder.title}
            </h3>
            {workOrder.description && (
              <p className="text-sm text-neutral-600 mt-1 line-clamp-2">
                {workOrder.description}
              </p>
            )}
          </div>

          <Link href={`/work-orders/${workOrder.id}`}>
            <Button variant="ghost" size="sm" icon={<Eye size={16} />}>
              Voir
            </Button>
          </Link>
        </div>

        {/* Infos */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
          <div>
            <dt className="text-neutral-500 flex items-center gap-1">
              <Package size={14} /> Équipement
            </dt>
            <dd className="font-medium text-neutral-900 truncate">
              <Link href={`/assets/${workOrder.assetId}`} className="hover:text-primary-600">
                {workOrder.assetName}
              </Link>
            </dd>
          </div>
          
          {workOrder.assignedToName && (
            <div>
              <dt className="text-neutral-500 flex items-center gap-1">
                <User size={14} /> Technicien
              </dt>
              <dd className="font-medium text-neutral-900 truncate">
                {workOrder.assignedToName}
              </dd>
            </div>
          )}

          <div>
            <dt className="text-neutral-500 flex items-center gap-1">
              <Clock size={14} /> Créée le
            </dt>
            <dd className="font-medium text-neutral-900">
              {new Date(workOrder.createdAt).toLocaleDateString('fr-FR')}
            </dd>
          </div>

          {workOrder.estimatedCost && (
            <div>
              <dt className="text-neutral-500">Coût estimé</dt>
              <dd className="font-medium text-neutral-900">
                {workOrder.estimatedCost.toFixed(2)} €
              </dd>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2 border-t border-neutral-200">
          <Button 
            variant="success" 
            size="sm" 
            icon={<ShieldCheck size={16} />}
            onClick={onApprove}
            loading={isApproving}
            disabled={isRejecting}
            className="flex-1 sm:flex-none"
          >
            Approuver
          </Button>
          <Button 
            variant="danger" 
            size="sm" 
            icon={<ShieldX size={16} />}
            onClick={onReject}
            loading={isRejecting}
            disabled={isApproving}
            className="flex-1 sm:flex-none"
          >
            Rejeter
          </Button>
        </div>
      </div>
    </Card>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export default function PendingApprovalsView({ workOrders, stats }: PendingApprovalsViewProps) {
  const router = useRouter();
  const [rejectModal, setRejectModal] = useState<{ isOpen: boolean; workOrder: PendingWorkOrder | null }>({
    isOpen: false,
    workOrder: null
  });
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'urgent' | 'preventive' | 'corrective'>('all');

  // Filtrer les interventions
  const filteredWorkOrders = workOrders.filter(wo => {
    switch (filter) {
      case 'urgent': return wo.priority === 'HIGH';
      case 'preventive': return wo.type === 'PREVENTIVE';
      case 'corrective': return wo.type === 'CORRECTIVE';
      default: return true;
    }
  });

  // Handle approve
  const handleApprove = async (workOrderId: string) => {
    setError(null);
    setProcessingId(workOrderId);
    const result = await approveWorkOrderAction(workOrderId);
    setProcessingId(null);
    
    if (result?.success) {
      router.refresh();
    } else {
      setError(result?.error || 'Erreur lors de l\'approbation');
    }
  };

  // Handle reject
  const handleReject = async (reason: string) => {
    if (!rejectModal.workOrder) return;
    
    setError(null);
    setProcessingId(rejectModal.workOrder.id);
    const result = await rejectWorkOrderAction(rejectModal.workOrder.id, reason);
    setProcessingId(null);
    setRejectModal({ isOpen: false, workOrder: null });
    
    if (result?.success) {
      router.refresh();
    } else {
      setError(result?.error || 'Erreur lors du rejet');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <PageHeader
        icon="📋"
        title="Approbations en attente"
        description={`${stats.total} intervention${stats.total > 1 ? 's' : ''} en attente de validation`}
      />

      <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Stats Cards */}
        <div className={LAYOUT_STYLES.gridResponsive4}>
          <Card className="bg-linear-to-br from-primary-50 to-primary-100 border-primary-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-200 rounded-lg">
                <Clock size={20} className="text-primary-700" />
              </div>
              <div>
                <p className="text-sm text-primary-600">En attente</p>
                <p className="text-2xl font-bold text-primary-900">{stats.total}</p>
              </div>
            </div>
          </Card>

          <Card className="bg-linear-to-br from-danger-50 to-danger-100 border-danger-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-danger-200 rounded-lg">
                <AlertTriangle size={20} className="text-danger-700" />
              </div>
              <div>
                <p className="text-sm text-danger-600">Urgentes</p>
                <p className="text-2xl font-bold text-danger-900">{stats.urgent}</p>
              </div>
            </div>
          </Card>

          <Card className="bg-linear-to-br from-success-50 to-success-100 border-success-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-success-200 rounded-lg">
                <Calendar size={20} className="text-success-700" />
              </div>
              <div>
                <p className="text-sm text-success-600">Préventives</p>
                <p className="text-2xl font-bold text-success-900">{stats.preventive}</p>
              </div>
            </div>
          </Card>

          <Card className="bg-linear-to-br from-warning-50 to-warning-100 border-warning-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-warning-200 rounded-lg">
                <Package size={20} className="text-warning-700" />
              </div>
              <div>
                <p className="text-sm text-warning-600">Correctives</p>
                <p className="text-2xl font-bold text-warning-900">{stats.corrective}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="danger" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <Filter size={16} className="text-neutral-500" />
          <Button 
            variant={filter === 'all' ? 'primary' : 'outline'} 
            size="sm"
            onClick={() => setFilter('all')}
          >
            Toutes ({stats.total})
          </Button>
          <Button 
            variant={filter === 'urgent' ? 'danger' : 'outline'} 
            size="sm"
            onClick={() => setFilter('urgent')}
          >
            Urgentes ({stats.urgent})
          </Button>
          <Button 
            variant={filter === 'preventive' ? 'success' : 'outline'} 
            size="sm"
            onClick={() => setFilter('preventive')}
          >
            Préventives ({stats.preventive})
          </Button>
          <Button 
            variant={filter === 'corrective' ? 'warning' : 'outline'} 
            size="sm"
            onClick={() => setFilter('corrective')}
          >
            Correctives ({stats.corrective})
          </Button>
        </div>

        {/* Work Orders List */}
        {filteredWorkOrders.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <CheckCircle size={48} className="mx-auto text-success-500 mb-4" />
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                {filter === 'all' 
                  ? 'Aucune intervention en attente' 
                  : 'Aucune intervention correspondante'}
              </h3>
              <p className="text-neutral-600">
                {filter === 'all'
                  ? 'Toutes les interventions ont été traitées.'
                  : 'Modifiez le filtre pour voir d\'autres interventions.'}
              </p>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredWorkOrders.map((workOrder) => (
              <WorkOrderCard
                key={workOrder.id}
                workOrder={workOrder}
                onApprove={() => handleApprove(workOrder.id)}
                onReject={() => setRejectModal({ isOpen: true, workOrder })}
                isApproving={processingId === workOrder.id}
                isRejecting={processingId === workOrder.id}
              />
            ))}
          </div>
        )}
      </div>

      {/* Reject Modal */}
      <RejectModal
        isOpen={rejectModal.isOpen}
        workOrderTitle={rejectModal.workOrder?.title || ''}
        onClose={() => setRejectModal({ isOpen: false, workOrder: null })}
        onConfirm={handleReject}
        isPending={!!processingId}
      />
    </div>
  );
}
