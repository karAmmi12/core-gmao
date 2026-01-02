/**
 * Boutons d'action pour les demandes de pièces
 * Gère les actions manager (approve/reject) et stock (deliver)
 */

'use client';

import { useState } from 'react';
import { Button, Input, Modal } from '@/components';
import { Check, X, Truck } from 'lucide-react';
import { LAYOUT_STYLES } from '@/styles/design-system';
import type { PartRequest } from '@/presentation/hooks/domain';

interface PartRequestActionsProps {
  request: PartRequest;
  isManager?: boolean;
  isStockManager?: boolean;
  isPending?: boolean;
  onApprove?: (id: string) => void;
  onReject?: (id: string, reason: string) => void;
  onDeliver?: (id: string) => void;
  onCancel?: (id: string) => void;
}

export function PartRequestActions({ 
  request,
  isManager,
  isStockManager,
  isPending,
  onApprove,
  onReject,
  onDeliver,
  onCancel
}: PartRequestActionsProps) {
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  // Actions manager pour demandes PENDING
  if (isManager && request.status === 'PENDING') {
    return (
      <>
        <div className={LAYOUT_STYLES.flexRow}>
          <Button
            variant="success"
            size="sm"
            onClick={() => onApprove?.(request.id)}
            disabled={isPending}
            icon={<Check className="w-4 h-4" />}
          >
            Approuver
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => setShowRejectModal(true)}
            disabled={isPending}
            icon={<X className="w-4 h-4" />}
          >
            Refuser
          </Button>
        </div>

        {/* Modal de refus */}
        <Modal
          isOpen={showRejectModal}
          onClose={() => {
            setShowRejectModal(false);
            setRejectionReason('');
          }}
          title="Refuser la demande"
        >
          <div className="space-y-4">
            <div>
              <p className="text-sm text-neutral-600 mb-2">
                Pièce : <span className="font-semibold">{request.partName}</span>
              </p>
              <p className="text-sm text-neutral-600">
                Quantité : <span className="font-semibold">{request.quantity}</span>
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Raison du refus *
              </label>
              <Input
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Ex: Stock insuffisant, référence incorrecte..."
                required
              />
            </div>

            <div className={LAYOUT_STYLES.flexRow}>
              <Button
                variant="secondary"
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason('');
                }}
              >
                Annuler
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  if (rejectionReason.trim()) {
                    onReject?.(request.id, rejectionReason);
                    setShowRejectModal(false);
                    setRejectionReason('');
                  }
                }}
                disabled={!rejectionReason.trim() || isPending}
              >
                Confirmer le refus
              </Button>
            </div>
          </div>
        </Modal>
      </>
    );
  }

  // Actions gestionnaire de stock pour demandes APPROVED
  if (isStockManager && request.status === 'APPROVED') {
    return (
      <Button
        variant="primary"
        size="sm"
        onClick={() => {
          if (confirm('Confirmer la remise de la pièce ? Le stock sera mis à jour.')) {
            onDeliver?.(request.id);
          }
        }}
        disabled={isPending}
        icon={<Truck className="w-4 h-4" />}
      >
        Marquer comme livré
      </Button>
    );
  }

  // Annulation pour le demandeur sur demandes PENDING
  if (request.status === 'PENDING' && onCancel) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          if (confirm('Annuler cette demande ?')) {
            onCancel(request.id);
          }
        }}
        disabled={isPending}
        icon={<X className="w-4 h-4" />}
      >
        Annuler
      </Button>
    );
  }

  return null;
}
