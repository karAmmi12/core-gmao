// =============================================================================
// PART REQUEST ACTION BUTTONS - Boutons d'action avec permissions
// =============================================================================
// Composant qui affiche les boutons d'action appropriés selon les permissions
// de l'utilisateur et le contexte de la demande de pièce.
// =============================================================================

'use client';

import { useState } from 'react';
import { PermissionService } from '@/core/domain/authorization/PermissionService';
import type { UserRole } from '@/core/domain/entities/User';
import { Button } from '@/presentation/components/ui';

interface PartRequestActionButtonsProps {
  requestId: string;
  requestedById: string;
  status: string;
  userRole: UserRole;
  userId: string;
  onApprove?: (id: string, notes?: string) => Promise<void>;
  onReject?: (id: string, reason: string) => Promise<void>;
  onDeliver?: (id: string) => Promise<void>;
  onCancel?: (id: string) => Promise<void>;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => Promise<void>;
}

export function PartRequestActionButtons({
  requestId,
  requestedById,
  status,
  userRole,
  userId,
  onApprove,
  onReject,
  onDeliver,
  onCancel,
  onEdit,
  onDelete,
}: PartRequestActionButtonsProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [notes, setNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  // Construire le contexte pour les vérifications de permissions
  const context = {
    requestedById,
    status,
  };

  // Vérifier les permissions selon le contexte
  const canApprove = PermissionService.canPerformPartRequestAction(
    userRole,
    userId,
    'approve',
    context
  );

  const canReject = PermissionService.canPerformPartRequestAction(
    userRole,
    userId,
    'reject',
    context
  );

  const canDeliver = PermissionService.canPerformPartRequestAction(
    userRole,
    userId,
    'deliver',
    context
  );

  const canCancel = PermissionService.canPerformPartRequestAction(
    userRole,
    userId,
    'cancel',
    context
  );

  const canUpdate = PermissionService.canPerformPartRequestAction(
    userRole,
    userId,
    'update',
    context
  );

  const canDelete = PermissionService.canPerformPartRequestAction(
    userRole,
    userId,
    'delete',
    context
  );

  // Handlers
  const handleApprove = async () => {
    if (!onApprove) return;
    setLoading('approve');
    try {
      await onApprove(requestId, notes || undefined);
      setShowApproveModal(false);
      setNotes('');
    } finally {
      setLoading(null);
    }
  };

  const handleReject = async () => {
    if (!onReject || !rejectionReason) return;
    setLoading('reject');
    try {
      await onReject(requestId, rejectionReason);
      setShowRejectModal(false);
      setRejectionReason('');
    } finally {
      setLoading(null);
    }
  };

  const handleDeliver = async () => {
    if (!onDeliver) return;
    setLoading('deliver');
    try {
      await onDeliver(requestId);
    } finally {
      setLoading(null);
    }
  };

  const handleCancel = async () => {
    if (!onCancel) return;
    setLoading('cancel');
    try {
      await onCancel(requestId);
    } finally {
      setLoading(null);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette demande ?')) return;
    setLoading('delete');
    try {
      await onDelete(requestId);
    } finally {
      setLoading(null);
    }
  };

  // Afficher les boutons uniquement si l'utilisateur a les permissions
  return (
    <div className="flex gap-2 flex-wrap">
      {/* Bouton Approuver - Visible uniquement pour ADMIN et MANAGER */}
      {canApprove && status === 'PENDING' && (
        <Button
          variant="success"
          size="sm"
          onClick={() => setShowApproveModal(true)}
          disabled={loading !== null}
        >
          {loading === 'approve' ? 'Approbation...' : 'Approuver'}
        </Button>
      )}

      {/* Bouton Rejeter - Visible uniquement pour ADMIN et MANAGER */}
      {canReject && status === 'PENDING' && (
        <Button
          variant="danger"
          size="sm"
          onClick={() => setShowRejectModal(true)}
          disabled={loading !== null}
        >
          {loading === 'reject' ? 'Rejet...' : 'Rejeter'}
        </Button>
      )}

      {/* Bouton Livrer - Visible pour ADMIN, MANAGER et STOCK_MANAGER */}
      {canDeliver && status === 'APPROVED' && (
        <Button
          variant="primary"
          size="sm"
          onClick={handleDeliver}
          disabled={loading !== null}
        >
          {loading === 'deliver' ? 'Livraison...' : 'Livrer'}
        </Button>
      )}

      {/* Bouton Modifier - Visible si propriétaire ET statut PENDING */}
      {canUpdate && status === 'PENDING' && onEdit && (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onEdit(requestId)}
          disabled={loading !== null}
        >
          Modifier
        </Button>
      )}

      {/* Bouton Annuler - Visible si propriétaire ET statut PENDING/APPROVED */}
      {canCancel && ['PENDING', 'APPROVED'].includes(status) && (
        <Button
          variant="warning"
          size="sm"
          onClick={handleCancel}
          disabled={loading !== null}
        >
          {loading === 'cancel' ? 'Annulation...' : 'Annuler'}
        </Button>
      )}

      {/* Bouton Supprimer - Visible si propriétaire ET statut PENDING */}
      {canDelete && status === 'PENDING' && (
        <Button
          variant="danger"
          size="sm"
          onClick={handleDelete}
          disabled={loading !== null}
        >
          {loading === 'delete' ? 'Suppression...' : 'Supprimer'}
        </Button>
      )}

      {/* Modal Approbation */}
      {showApproveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Approuver la demande</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Notes (optionnel)
              </label>
              <textarea
                className="w-full border rounded px-3 py-2"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ajouter des notes..."
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setShowApproveModal(false);
                  setNotes('');
                }}
                disabled={loading === 'approve'}
              >
                Annuler
              </Button>
              <Button
                variant="success"
                size="sm"
                onClick={handleApprove}
                disabled={loading === 'approve'}
              >
                {loading === 'approve' ? 'Approbation...' : 'Confirmer'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Rejet */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Rejeter la demande</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Raison du rejet <span className="text-red-500">*</span>
              </label>
              <textarea
                className="w-full border rounded px-3 py-2"
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Indiquez la raison du rejet..."
                required
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason('');
                }}
                disabled={loading === 'reject'}
              >
                Annuler
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleReject}
                disabled={loading === 'reject' || !rejectionReason}
              >
                {loading === 'reject' ? 'Rejet...' : 'Confirmer le rejet'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// EXEMPLE D'UTILISATION
// =============================================================================

/*
// Dans une page ou un composant parent:

import { PartRequestActionButtons } from '@/presentation/components/features/part-requests/PartRequestActionButtons';
import { approvePartRequest, rejectPartRequest, deliverPartRequest } from '@/app/part-requests/actions';

export default function PartRequestDetailPage({ request, session }) {
  const handleApprove = async (id: string, notes?: string) => {
    const result = await approvePartRequest(id, notes);
    if (result.success) {
      // Rafraîchir ou afficher un message
      toast.success('Demande approuvée');
    } else {
      toast.error(result.error);
    }
  };

  const handleReject = async (id: string, reason: string) => {
    const result = await rejectPartRequest(id, reason);
    if (result.success) {
      toast.success('Demande rejetée');
    } else {
      toast.error(result.error);
    }
  };

  const handleDeliver = async (id: string) => {
    const result = await deliverPartRequest(id);
    if (result.success) {
      toast.success('Pièce livrée');
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div>
      <h1>{request.partName}</h1>
      <PartRequestActionButtons
        requestId={request.id}
        requestedById={request.requestedById}
        status={request.status}
        userRole={session.user.role}
        userId={session.user.id}
        onApprove={handleApprove}
        onReject={handleReject}
        onDeliver={handleDeliver}
      />
    </div>
  );
}
*/
