'use client';

import { useActionState, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { 
  CheckCircle, Calendar, Clock, User, Package, DollarSign,
  ArrowLeft, PlayCircle, XCircle, Edit, AlertTriangle, Pencil, Ban, Pause,
  ShieldCheck, ShieldX, FileCheck
} from 'lucide-react';
import { WorkOrderDTO, WorkOrderPartDTO } from '@/core/application/dto/WorkOrderDTO';
import { 
  completeWorkOrderAction, 
  startWorkOrderAction, 
  cancelWorkOrderAction 
} from '@/app/actions';
import {
  approveWorkOrderAction,
  rejectWorkOrderAction,
  completeWorkOrderByTechnicianAction,
  validateWorkOrderByManagerAction
} from '@/app/work-orders/actions';
import {
  Card,
  Badge,
  Button,
  Alert,
  PageHeader,
  Input,
  Textarea,
  Modal
} from '@/components';
import { LAYOUT_STYLES } from '@/styles/design-system';
import { useWorkOrderPermissions } from '@/presentation/hooks/usePermissions';
import type { UserRole } from '@/core/domain/entities/User';

// ============================================================================
// Types
// ============================================================================

interface WorkOrderDetailProps {
  workOrder: WorkOrderDTO;
  assetName: string;
  technicianName?: string;
}

const STATUS_CONFIG = {
  DRAFT: { label: 'Brouillon', variant: 'warning' as const, icon: Edit },
  PENDING: { label: 'En attente d\'approbation', variant: 'warning' as const, icon: Clock },
  APPROVED: { label: 'Approuvée', variant: 'success' as const, icon: CheckCircle },
  REJECTED: { label: 'Rejetée', variant: 'danger' as const, icon: XCircle },
  PLANNED: { label: 'Planifiée', variant: 'info' as const, icon: Calendar },
  ASSIGNED: { label: 'Assignée', variant: 'info' as const, icon: User },
  IN_PROGRESS: { label: 'En cours', variant: 'primary' as const, icon: PlayCircle },
  ON_HOLD: { label: 'En attente', variant: 'warning' as const, icon: Pause },
  COMPLETED: { label: 'Terminée', variant: 'success' as const, icon: CheckCircle },
  CANCELLED: { label: 'Annulée', variant: 'neutral' as const, icon: XCircle }
};

const PRIORITY_CONFIG = {
  LOW: { label: 'Normale', variant: 'neutral' as const },
  MEDIUM: { label: 'Moyenne', variant: 'primary' as const },
  HIGH: { label: 'Urgente', variant: 'danger' as const }
};

const TYPE_CONFIG = {
  CORRECTIVE: { label: 'Corrective', variant: 'danger' as const, icon: '🔧', description: 'Suite à une panne' },
  PREVENTIVE: { label: 'Préventive', variant: 'success' as const, icon: '📅', description: 'Générée depuis un planning' },
  PREDICTIVE: { label: 'Prédictive', variant: 'primary' as const, icon: '📊', description: 'Générée depuis un planning' },
  CONDITIONAL: { label: 'Conditionnelle', variant: 'warning' as const, icon: '👁️', description: 'Suite à une observation' }
};

// ============================================================================
// Action Buttons Component
// ============================================================================

function ActionButtons({ 
  workOrder, 
  onStart, 
  onCancel,
  onApprove,
  onReject,
  isStarting,
  isCancelling,
  isApproving,
  isRejecting,
  canApprove
}: { 
  workOrder: WorkOrderDTO;
  onStart: () => void;
  onCancel: () => void;
  onApprove: () => void;
  onReject: () => void;
  isStarting: boolean;
  isCancelling: boolean;
  isApproving: boolean;
  isRejecting: boolean;
  canApprove: boolean;
}) {
  const canEdit = workOrder.status !== 'COMPLETED' && workOrder.status !== 'CANCELLED' && workOrder.status !== 'REJECTED';
  const canStart = workOrder.status === 'DRAFT' || workOrder.status === 'PLANNED' || workOrder.status === 'APPROVED';
  const canCancel = workOrder.status !== 'COMPLETED' && workOrder.status !== 'CANCELLED' && workOrder.status !== 'REJECTED';
  const isPending = workOrder.status === 'PENDING';

  return (
    <div className="flex flex-wrap gap-2">
      {/* Boutons d'approbation (uniquement pour PENDING et si l'utilisateur peut approuver) */}
      {isPending && canApprove && (
        <>
          <Button 
            variant="success" 
            size="sm" 
            icon={<ShieldCheck size={16} />}
            onClick={onApprove}
            loading={isApproving}
          >
            Approuver
          </Button>
          <Button 
            variant="danger" 
            size="sm" 
            icon={<ShieldX size={16} />}
            onClick={onReject}
            loading={isRejecting}
          >
            Rejeter
          </Button>
        </>
      )}

      {canEdit && (
        <Link href={`/work-orders/${workOrder.id}/edit`}>
          <Button variant="outline" size="sm" icon={<Pencil size={16} />}>
            Modifier
          </Button>
        </Link>
      )}
      
      {canStart && (
        <Button 
          variant="primary" 
          size="sm" 
          icon={<PlayCircle size={16} />}
          onClick={onStart}
          loading={isStarting}
        >
          Démarrer
        </Button>
      )}
      
      {canCancel && (
        <Button 
          variant="danger" 
          size="sm" 
          icon={<Ban size={16} />}
          onClick={onCancel}
          loading={isCancelling}
        >
          Annuler
        </Button>
      )}
    </div>
  );
}

// ============================================================================
// Cancel Modal Component
// ============================================================================

function CancelModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  isPending 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onConfirm: (reason: string) => void;
  isPending: boolean;
}) {
  const [reason, setReason] = useState('');

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Annuler l'intervention" size="md">
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-3 bg-warning-50 border border-warning-200 rounded-lg">
          <AlertTriangle className="text-warning-600 mt-0.5" size={20} />
          <div>
            <p className="font-medium text-warning-800">Attention</p>
            <p className="text-sm text-warning-700">
              Cette action est irréversible. L'intervention sera définitivement annulée.
            </p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Raison de l'annulation (optionnel)
          </label>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Expliquez pourquoi cette intervention est annulée..."
            rows={3}
            disabled={isPending}
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Retour
          </Button>
          <Button 
            variant="danger" 
            onClick={() => onConfirm(reason)}
            loading={isPending}
          >
            Confirmer l'annulation
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// ============================================================================
// Reject Modal Component
// ============================================================================

function RejectModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  isPending 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onConfirm: (reason: string) => void;
  isPending: boolean;
}) {
  const [reason, setReason] = useState('');

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Rejeter l'intervention" size="md">
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-3 bg-danger-50 border border-danger-200 rounded-lg">
          <ShieldX className="text-danger-600 mt-0.5" size={20} />
          <div>
            <p className="font-medium text-danger-800">Rejet de l'intervention</p>
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
            required
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Retour
          </Button>
          <Button 
            variant="danger" 
            onClick={() => {
              if (reason.trim()) {
                onConfirm(reason);
              }
            }}
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
// Main Component
// ============================================================================

export default function WorkOrderDetail({ workOrder, assetName, technicianName }: WorkOrderDetailProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  
  // Permissions
  const userRole = (session?.user?.role as UserRole) || 'TECHNICIAN';
  const userId = session?.user?.id || '';
  const { canApprove, canReject } = useWorkOrderPermissions(userRole, userId, {
    assignedToId: workOrder.assignedToId,
    status: workOrder.status as any,
  });
  
  // Complete action
  const [completeState, completeAction, isCompleting] = useActionState(
    async (_: any, formData: FormData) => completeWorkOrderAction(formData),
    null
  );

  // Start action
  const [startState, setStartState] = useState<{ error?: string; success?: boolean } | null>(null);
  const [isStarting, setIsStarting] = useState(false);

  // Cancel action
  const [cancelState, setCancelState] = useState<{ error?: string; success?: boolean } | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  // Approve action
  const [approveState, setApproveState] = useState<{ error?: string; success?: boolean } | null>(null);
  const [isApproving, setIsApproving] = useState(false);

  // Reject action
  const [rejectState, setRejectState] = useState<{ error?: string; success?: boolean } | null>(null);
  const [isRejecting, setIsRejecting] = useState(false);

  // Technician complete action (new workflow)
  const [techCompleteState, setTechCompleteState] = useState<{ error?: string; success?: boolean } | null>(null);
  const [isTechCompleting, setIsTechCompleting] = useState(false);

  // Manager validate action (new workflow)
  const [managerValidateState, setManagerValidateState] = useState<{ error?: string; success?: boolean } | null>(null);
  const [isManagerValidating, setIsManagerValidating] = useState(false);

  const statusConfig = STATUS_CONFIG[workOrder.status];
  const priorityConfig = PRIORITY_CONFIG[workOrder.priority];
  const StatusIcon = statusConfig.icon;

  const canComplete = workOrder.status === 'IN_PROGRESS';
  const isCompleted = workOrder.status === 'COMPLETED';
  const isCancelled = workOrder.status === 'CANCELLED';
  const isRejected = workOrder.status === 'REJECTED';
  const isPending = workOrder.status === 'PENDING';
  
  // Nouveau workflow: déterminer si technicien peut terminer ou manager peut valider
  const isTechnician = userRole === 'TECHNICIAN';
  const isManager = userRole === 'MANAGER' || userRole === 'ADMIN';
  const technicianId = session?.user?.technicianId;
  const isAssignedTechnician = technicianId && workOrder.assignedToId === technicianId;
  
  // Technicien peut terminer si : intervention EN COURS + il est assigné
  const canTechnicianComplete = isTechnician && isAssignedTechnician && workOrder.status === 'IN_PROGRESS';
  
  // Manager peut valider si : intervention TERMINÉE + coûts pas encore enregistrés
  // On vérifie que laborCost et materialCost sont à 0 (valeurs par défaut)
  const hasNoCostsYet = workOrder.laborCost === 0 && workOrder.materialCost === 0;
  const canManagerValidate = isManager && workOrder.status === 'COMPLETED' && hasNoCostsYet;

  // Handle start
  const handleStart = async () => {
    setIsStarting(true);
    const formData = new FormData();
    formData.set('workOrderId', workOrder.id);
    const result = await startWorkOrderAction(formData);
    setStartState(result);
    setIsStarting(false);
    if (result?.success) {
      router.refresh();
    }
  };

  // Handle cancel
  const handleCancel = async (reason: string) => {
    setIsCancelling(true);
    const formData = new FormData();
    formData.set('workOrderId', workOrder.id);
    formData.set('reason', reason);
    const result = await cancelWorkOrderAction(formData);
    setCancelState(result);
    setIsCancelling(false);
    setShowCancelModal(false);
    if (result?.success) {
      router.refresh();
    }
  };

  // Handle approve
  const handleApprove = async () => {
    setIsApproving(true);
    const result = await approveWorkOrderAction(workOrder.id);
    setApproveState(result);
    setIsApproving(false);
    if (result?.success) {
      router.refresh();
    }
  };

  // Handle reject
  const handleReject = async (reason: string) => {
    setIsRejecting(true);
    const result = await rejectWorkOrderAction(workOrder.id, reason);
    setRejectState(result);
    setIsRejecting(false);
    setShowRejectModal(false);
    if (result?.success) {
      router.refresh();
    }
  };

  // Handle technician complete (new workflow)
  const handleTechnicianComplete = async (formData: FormData) => {
    setIsTechCompleting(true);
    const result = await completeWorkOrderByTechnicianAction(workOrder.id, formData);
    setTechCompleteState(result);
    setIsTechCompleting(false);
    if (result?.success) {
      router.refresh();
    }
  };

  // Handle manager validate (new workflow)
  const handleManagerValidate = async (formData: FormData) => {
    setIsManagerValidating(true);
    const result = await validateWorkOrderByManagerAction(workOrder.id, formData);
    setManagerValidateState(result);
    setIsManagerValidating(false);
    if (result?.success) {
      router.refresh();
    }
  };

  // Redirect on complete success
  if (completeState?.success) {
    router.push('/work-orders');
    return null;
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <PageHeader
        icon="🔧"
        title={workOrder.title}
        description={`Intervention #${workOrder.id.slice(0, 8)}`}
        actions={
          <div className="flex items-center gap-2">
            <ActionButtons 
              workOrder={workOrder}
              onStart={handleStart}
              onCancel={() => setShowCancelModal(true)}
              onApprove={handleApprove}
              onReject={() => setShowRejectModal(true)}
              isStarting={isStarting}
              isCancelling={isCancelling}
              isApproving={isApproving}
              isRejecting={isRejecting}
              canApprove={canApprove}
            />
            <Link href="/work-orders">
              <Button variant="ghost" icon={<ArrowLeft size={18} />}>
                Retour
              </Button>
            </Link>
          </div>
        }
      />

      <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Error Alerts */}
        {startState?.error && (
          <Alert variant="danger">{startState.error}</Alert>
        )}
        {cancelState?.error && (
          <Alert variant="danger">{cancelState.error}</Alert>
        )}
        {approveState?.error && (
          <Alert variant="danger">{approveState.error}</Alert>
        )}
        {rejectState?.error && (
          <Alert variant="danger">{rejectState.error}</Alert>
        )}

        {/* Pending Approval Notice */}
        {isPending && workOrder.requiresApproval && (
          <Alert variant="warning">
            <div className="flex items-center gap-2">
              <Clock size={18} />
              <div>
                <p className="font-medium">En attente d'approbation</p>
                <p className="text-sm">Cette intervention nécessite une validation avant de pouvoir être démarrée.</p>
                {workOrder.estimatedCost && (
                  <p className="text-sm mt-1">
                    Coût estimé : <strong>{workOrder.estimatedCost.toFixed(2)} €</strong>
                  </p>
                )}
              </div>
            </div>
          </Alert>
        )}

        {/* Status & Priority & Type */}
        <div className={LAYOUT_STYLES.flexRow}>
          <Badge variant={statusConfig.variant === 'info' ? 'primary' : statusConfig.variant} size="lg">
            <StatusIcon size={16} className="mr-1.5" />
            {statusConfig.label}
          </Badge>
          <Badge variant={TYPE_CONFIG[workOrder.type]?.variant || 'neutral'} size="lg">
            {TYPE_CONFIG[workOrder.type]?.icon} {TYPE_CONFIG[workOrder.type]?.label || workOrder.type}
          </Badge>
          <Badge variant={priorityConfig.variant} size="lg">
            {priorityConfig.label}
          </Badge>
          {workOrder.priority === 'HIGH' && (
            <Badge variant="danger" size="lg">
              <AlertTriangle size={14} className="mr-1" />
              Urgent
            </Badge>
          )}
        </div>

        {/* Cancelled Notice */}
        {isCancelled && (
          <Alert variant="warning">
            <div className="flex items-center gap-2">
              <XCircle size={18} />
              Cette intervention a été annulée
            </div>
          </Alert>
        )}

        {/* Rejected Notice */}
        {isRejected && (
          <Alert variant="danger">
            <div className="flex items-start gap-2">
              <ShieldX size={18} className="mt-0.5" />
              <div>
                <p className="font-medium">Cette intervention a été rejetée</p>
                {workOrder.rejectionReason && (
                  <p className="text-sm mt-1">Raison : {workOrder.rejectionReason}</p>
                )}
                {workOrder.approvedByName && workOrder.approvedAt && (
                  <p className="text-sm text-neutral-600 mt-1">
                    Par {workOrder.approvedByName} le {new Date(workOrder.approvedAt).toLocaleString('fr-FR')}
                  </p>
                )}
              </div>
            </div>
          </Alert>
        )}

        {/* Approval Info (when approved) */}
        {workOrder.status === 'APPROVED' && workOrder.approvedByName && (
          <Alert variant="success">
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} />
              <div>
                <p className="font-medium">Intervention approuvée</p>
                <p className="text-sm">
                  Par {workOrder.approvedByName} le {workOrder.approvedAt && new Date(workOrder.approvedAt).toLocaleString('fr-FR')}
                </p>
              </div>
            </div>
          </Alert>
        )}

        {/* Main Info */}
        <Card>
          <h3 className="text-lg font-semibold mb-4">Informations générales</h3>

          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-neutral-600 mb-1">Équipement</dt>
              <dd className="text-sm">
                <Link href={`/assets/${workOrder.assetId}`} className="text-primary-600 hover:underline">
                  {assetName}
                </Link>
              </dd>
            </div>

            {technicianName && (
              <div>
                <dt className="text-sm font-medium text-neutral-600 mb-1 flex items-center gap-1.5">
                  <User size={14} />
                  Technicien assigné
                </dt>
                <dd className="text-sm">{technicianName}</dd>
              </div>
            )}

            {workOrder.scheduledAt && (
              <div>
                <dt className="text-sm font-medium text-neutral-600 mb-1 flex items-center gap-1.5">
                  <Calendar size={14} />
                  Date prévue
                </dt>
                <dd className="text-sm">
                  {new Date(workOrder.scheduledAt).toLocaleString('fr-FR')}
                </dd>
              </div>
            )}

            {workOrder.estimatedDuration && (
              <div>
                <dt className="text-sm font-medium text-neutral-600 mb-1 flex items-center gap-1.5">
                  <Clock size={14} />
                  Durée estimée
                </dt>
                <dd className="text-sm">{workOrder.estimatedDuration} minutes</dd>
              </div>
            )}

            <div>
              <dt className="text-sm font-medium text-neutral-600 mb-1">Date de création</dt>
              <dd className="text-sm">
                {new Date(workOrder.createdAt).toLocaleString('fr-FR')}
              </dd>
            </div>

            {workOrder.startedAt && (
              <div>
                <dt className="text-sm font-medium text-neutral-600 mb-1">Date de début</dt>
                <dd className="text-sm">
                  {new Date(workOrder.startedAt).toLocaleString('fr-FR')}
                </dd>
              </div>
            )}

            {workOrder.completedAt && (
              <div>
                <dt className="text-sm font-medium text-neutral-600 mb-1">Date de fin</dt>
                <dd className="text-sm">
                  {new Date(workOrder.completedAt).toLocaleString('fr-FR')}
                </dd>
              </div>
            )}

            {workOrder.actualDuration && (
              <div>
                <dt className="text-sm font-medium text-neutral-600 mb-1">Durée réelle</dt>
                <dd className="text-sm">{workOrder.actualDuration} minutes</dd>
              </div>
            )}
          </dl>

          {workOrder.description && (
            <div className="mt-6 pt-6 border-t border-neutral-200">
              <h4 className="text-sm font-medium text-neutral-600 mb-2">Description</h4>
              <p className="text-sm text-neutral-700 whitespace-pre-wrap">{workOrder.description}</p>
            </div>
          )}
        </Card>

        {/* Parts Used */}
        {workOrder.parts && workOrder.parts.length > 0 && (
          <Card>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Package size={20} className="text-neutral-600" />
              Pièces utilisées
            </h3>

            <div className="space-y-2">
              {workOrder.parts.map((part, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{part.partName}</div>
                    <div className="text-xs text-neutral-500">Réf: {part.partReference}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {part.quantity} × {part.unitPrice.toFixed(2)} €
                    </div>
                    <div className="text-xs text-neutral-500">
                      Total: {part.totalPrice.toFixed(2)} €
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Costs */}
        <Card>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <DollarSign size={20} className="text-neutral-600" />
            Coûts
          </h3>

          <dl className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <dt className="text-sm text-neutral-600">Coût main d'œuvre</dt>
              <dd className="text-sm font-medium">{workOrder.laborCost.toFixed(2)} €</dd>
            </div>
            <div className="flex items-center justify-between py-2">
              <dt className="text-sm text-neutral-600">Coût matériel</dt>
              <dd className="text-sm font-medium">{workOrder.materialCost.toFixed(2)} €</dd>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-neutral-200">
              <dt className="text-base font-semibold">Coût total</dt>
              <dd className="text-base font-semibold text-primary-600">
                {workOrder.totalCost.toFixed(2)} €
              </dd>
            </div>
          </dl>
        </Card>

        {/* Complete Form (if in progress) */}
        {canTechnicianComplete && (
          <Card>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <CheckCircle size={20} className="text-success-600" />
              Terminer l'intervention
            </h3>

            <div className="mb-4">
              <Alert variant="primary">
                <p className="text-sm">
                  En tant que technicien, vous pouvez marquer cette intervention comme terminée. 
                  Un manager devra ensuite valider et enregistrer les coûts.
                </p>
              </Alert>
            </div>

            <form onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              await handleTechnicianComplete(formData);
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Durée réelle (minutes) <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  name="actualDuration"
                  min="1"
                  placeholder="60"
                  required
                  disabled={isTechCompleting}
                />
                <p className="mt-1 text-xs text-neutral-500">
                  Temps réellement passé sur l'intervention
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Notes de completion
                </label>
                <Textarea
                  name="notes"
                  placeholder="Décrivez le travail effectué, les observations, etc..."
                  rows={4}
                  disabled={isTechCompleting}
                />
              </div>

              {techCompleteState?.error && (
                <Alert variant="danger">{techCompleteState.error}</Alert>
              )}
              
              {techCompleteState?.success && (
                <Alert variant="success">
                  Intervention terminée avec succès
                </Alert>
              )}

              <Button type="submit" loading={isTechCompleting} className="w-full">
                <CheckCircle size={18} className="mr-2" />
                Terminer l'intervention
              </Button>
            </form>
          </Card>
        )}

        {/* Manager Validation Form (if completed and requires approval) */}
        {canManagerValidate && (
          <Card>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <ShieldCheck size={20} className="text-primary-600" />
              Validation de l'intervention
            </h3>

            <div className="mb-4">
              <Alert variant="warning">
                <p className="text-sm">
                  Cette intervention a été terminée par le technicien.
                  Veuillez valider et enregistrer les coûts de main d'œuvre et de matériel.
                </p>
              </Alert>
            </div>

            {workOrder.actualDuration && (
              <div className="mb-4 p-3 bg-neutral-50 rounded-lg">
                <p className="text-sm text-neutral-600">
                  <strong>Durée réelle :</strong> {workOrder.actualDuration} minutes
                </p>
              </div>
            )}

            <form onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              await handleManagerValidate(formData);
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Coût main d'œuvre (€) <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  name="laborCost"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  required
                  disabled={isManagerValidating}
                />
                <p className="mt-1 text-xs text-neutral-500">
                  Coût de la main d'œuvre pour cette intervention
                </p>
              </div>

              <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-neutral-700">
                    Coût matériel (pièces consommées)
                  </span>
                  <span className="text-sm font-semibold text-neutral-900">
                    Calculé automatiquement
                  </span>
                </div>
                <p className="text-xs text-neutral-500">
                  Le coût matériel sera calculé à partir des pièces validées/livrées pour cette intervention
                </p>
              </div>

              <details className="border border-neutral-200 rounded-lg p-4">
                <summary className="cursor-pointer text-sm font-medium text-neutral-700">
                  Ajustement manuel du coût matériel (optionnel)
                </summary>
                <div className="mt-3">
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Ajustement (€)
                  </label>
                  <Input
                    type="number"
                    name="materialCostAdjustment"
                    step="0.01"
                    placeholder="0.00"
                    disabled={isManagerValidating}
                  />
                  <p className="mt-1 text-xs text-neutral-500">
                    Utilisez ce champ pour ajouter des frais supplémentaires ou appliquer une remise
                  </p>
                </div>
              </details>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Notes de validation
                </label>
                <Textarea
                  name="validationNotes"
                  placeholder="Commentaires sur la validation, ajustements de coûts, etc..."
                  rows={4}
                  disabled={isManagerValidating}
                />
              </div>

              {managerValidateState?.error && (
                <Alert variant="danger">{managerValidateState.error}</Alert>
              )}
              
              {managerValidateState?.success && (
                <Alert variant="success">
                  Intervention validée avec succès
                </Alert>
              )}

              <Button type="submit" loading={isManagerValidating} className="w-full">
                <ShieldCheck size={18} className="mr-2" />
                Valider et enregistrer les coûts
              </Button>
            </form>
          </Card>
        )}

        {isCompleted && !canManagerValidate && (
          <Alert variant="success">
            <div className="flex items-center gap-2">
              <CheckCircle size={18} />
              Cette intervention a été terminée le {new Date(workOrder.completedAt!).toLocaleString('fr-FR')}
              {workOrder.approvedById && workOrder.approvedAt && (
                <span className="ml-2 text-sm">
                  • Validée le {new Date(workOrder.approvedAt).toLocaleString('fr-FR')}
                </span>
              )}
            </div>
          </Alert>
        )}
      </div>

      {/* Cancel Modal */}
      <CancelModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancel}
        isPending={isCancelling}
      />

      {/* Reject Modal */}
      <RejectModal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        onConfirm={handleReject}
        isPending={isRejecting}
      />
    </div>
  );
}
