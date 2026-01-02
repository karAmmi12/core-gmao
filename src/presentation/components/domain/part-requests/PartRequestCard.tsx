/**
 * Carte affichant une demande de pièce
 * Composant réutilisable avec toutes les infos et actions
 */

'use client';

import { Card, CardHeader, Badge } from '@/components';
import { Package, Clock, User, Wrench, AlertTriangle } from 'lucide-react';
import { cn } from '@/styles/design-system';
import type { PartRequest } from '@/presentation/hooks/domain';
import { PartRequestStatusBadge } from './PartRequestStatusBadge';
import { PartRequestUrgencyBadge } from './PartRequestUrgencyBadge';
import { PartRequestActions } from './PartRequestActions';

interface PartRequestCardProps {
  request: PartRequest;
  isManager?: boolean;
  isStockManager?: boolean;
  isPending?: boolean;
  onApprove?: (id: string) => void;
  onReject?: (id: string, reason: string) => void;
  onDeliver?: (id: string) => void;
  onCancel?: (id: string) => void;
}

export function PartRequestCard({ 
  request, 
  isManager,
  isStockManager,
  isPending,
  onApprove,
  onReject,
  onDeliver,
  onCancel
}: PartRequestCardProps) {
  const isUrgent = request.urgency === 'HIGH' || request.urgency === 'CRITICAL';

  return (
    <Card className={cn(
      'hover:shadow-md transition-shadow',
      isUrgent && request.status === 'PENDING' && 'border-l-4 border-l-orange-500'
    )}>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div className="p-2 rounded-lg bg-primary-50 text-primary-600 shrink-0">
              <Package className="w-5 h-5" />
            </div>
            
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h3 className="font-semibold text-neutral-900 truncate">
                  {request.partName}
                </h3>
                <Badge variant="neutral" size="sm">
                  {request.partReference}
                </Badge>
              </div>
              
              <p className="text-sm text-neutral-600">
                Quantité demandée : <span className="font-semibold">{request.quantity}</span>
              </p>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-2 shrink-0">
            <PartRequestStatusBadge status={request.status} />
            <PartRequestUrgencyBadge urgency={request.urgency} />
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="p-4 pt-0 space-y-3">
        {/* Raison */}
        {request.reason && (
          <div>
            <p className="text-sm text-neutral-600">
              <span className="font-medium">Raison :</span> {request.reason}
            </p>
          </div>
        )}

        {/* Lien intervention */}
        {request.workOrderId && (
          <div className="flex items-center gap-2 text-sm">
            <Wrench className="w-4 h-4 text-neutral-500" />
            <span className="text-neutral-600">
              Intervention : <span className="font-medium">{request.workOrderTitle}</span>
            </span>
          </div>
        )}

        {/* Équipement */}
        {request.assetName && (
          <div className="flex items-center gap-2 text-sm">
            <AlertTriangle className="w-4 h-4 text-neutral-500" />
            <span className="text-neutral-600">
              Équipement : <span className="font-medium">{request.assetName}</span>
            </span>
          </div>
        )}

        {/* Demandeur */}
        <div className="flex items-center gap-2 text-sm">
          <User className="w-4 h-4 text-neutral-500" />
          <span className="text-neutral-600">
            Demandé par : <span className="font-medium">{request.requestedByName}</span>
          </span>
        </div>

        {/* Date */}
        <div className="flex items-center gap-2 text-sm">
          <Clock className="w-4 h-4 text-neutral-500" />
          <span className="text-neutral-600">
            {new Date(request.createdAt).toLocaleString('fr-FR', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        </div>

        {/* Approbation */}
        {request.approvedByName && request.approvedAt && (
          <div className="text-sm p-2 bg-success-50 rounded-lg border border-success-200">
            <span className="text-success-700">
              Approuvé par <span className="font-medium">{request.approvedByName}</span> le{' '}
              {new Date(request.approvedAt).toLocaleDateString('fr-FR')}
            </span>
          </div>
        )}

        {/* Livraison */}
        {request.deliveredAt && (
          <div className="text-sm p-2 bg-primary-50 rounded-lg border border-primary-200">
            <span className="text-primary-700">
              Livré le {new Date(request.deliveredAt).toLocaleDateString('fr-FR')}
            </span>
          </div>
        )}

        {/* Refus */}
        {request.status === 'REJECTED' && request.rejectionReason && (
          <div className="text-sm p-2 bg-danger-50 rounded-lg border border-danger-200">
            <span className="text-danger-700 font-medium">Raison du refus :</span>
            <p className="text-danger-600 mt-1">{request.rejectionReason}</p>
          </div>
        )}

        {/* Actions */}
        <PartRequestActions
          request={request}
          isManager={isManager}
          isStockManager={isStockManager}
          isPending={isPending}
          onApprove={onApprove}
          onReject={onReject}
          onDeliver={onDeliver}
          onCancel={onCancel}
        />
      </div>
    </Card>
  );
}
