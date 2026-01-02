'use client';

// =============================================================================
// PART REQUESTS CONTENT - Interface des demandes de pièces
// =============================================================================

import { useState, useTransition } from 'react';
import { Card, CardHeader, Button, Badge, Input } from '@/presentation/components/ui';
import { 
  Package, 
  Plus, 
  Check, 
  X, 
  Clock, 
  AlertTriangle,
  Truck,
  Filter
} from 'lucide-react';
import { 
  createPartRequest, 
  approvePartRequest, 
  rejectPartRequest, 
  deliverPartRequest,
  cancelPartRequest 
} from '@/app/part-requests/actions';
import { usePermissions } from '@/presentation/hooks/usePermissions';
import type { UserRole } from '@/core/domain/entities/User';

interface PartRequestsContentProps {
  requests: Array<{
    id: string;
    partId: string;
    partReference: string;
    partName: string;
    quantity: number;
    requestedById: string;
    requestedByName: string;
    reason: string;
    urgency: string;
    status: string;
    workOrderId?: string;
    workOrderTitle?: string;
    assetId?: string;
    assetName?: string;
    approvedByName?: string;
    approvedAt?: string;
    rejectionReason?: string;
    deliveredAt?: string;
    createdAt: string;
  }>;
  pendingCount: number;
  userRole: UserRole;
  userId: string;
  parts: Array<{
    id: string;
    reference: string;
    name: string;
    quantityInStock: number;
  }>;
}

const STATUS_CONFIG: Record<string, { label: string; variant: 'primary' | 'success' | 'warning' | 'danger' | 'neutral' }> = {
  PENDING: { label: 'En attente', variant: 'warning' },
  APPROVED: { label: 'Approuvé', variant: 'success' },
  REJECTED: { label: 'Refusé', variant: 'danger' },
  DELIVERED: { label: 'Livré', variant: 'primary' },
  CANCELLED: { label: 'Annulé', variant: 'neutral' },
};

const URGENCY_CONFIG: Record<string, { label: string; color: string }> = {
  LOW: { label: 'Basse', color: 'text-gray-500' },
  NORMAL: { label: 'Normale', color: 'text-blue-500' },
  HIGH: { label: 'Haute', color: 'text-orange-500' },
  CRITICAL: { label: 'Critique', color: 'text-red-600 font-bold' },
};

export function PartRequestsContent({ 
  requests, 
  pendingCount, 
  userRole,
  userId,
  parts 
}: PartRequestsContentProps) {
  const [isPending, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Utiliser le hook de permissions
  const permissions = usePermissions({ userRole, userId });
  // Filtrer les demandes
  const filteredRequests = requests.filter(r => 
    statusFilter === 'all' || r.status === statusFilter
  );

  // Regrouper par statut pour les stats
  const stats = {
    pending: requests.filter(r => r.status === 'PENDING').length,
    approved: requests.filter(r => r.status === 'APPROVED').length,
    delivered: requests.filter(r => r.status === 'DELIVERED').length,
    rejected: requests.filter(r => r.status === 'REJECTED').length,
  };

  const handleCreateRequest = async (formData: FormData) => {
    startTransition(async () => {
      const result = await createPartRequest(formData);
      if (result?.success) {
        setShowForm(false);
      } else if (result?.error) {
        alert(result.error);
      }
    });
  };

  const handleApprove = (id: string) => {
    startTransition(async () => {
      const result = await approvePartRequest(id);
      if (result && !result.success) {
        alert(result.error);
      }
    });
  };

  const handleReject = (id: string) => {
    if (!rejectionReason.trim()) {
      alert('Veuillez indiquer la raison du refus');
      return;
    }
    startTransition(async () => {
      const result = await rejectPartRequest(id, rejectionReason);
      if (result?.success) {
        setRejectingId(null);
        setRejectionReason('');
      } else if (result?.error) {
        alert(result.error);
      }
    });
  };

  const handleDeliver = (id: string) => {
    if (!confirm('Confirmer la remise de la pièce ? Le stock sera mis à jour.')) return;
    startTransition(async () => {
      const result = await deliverPartRequest(id);
      if (result && !result.success) {
        alert(result.error);
      }
    });
  };

  const handleCancel = (id: string) => {
    if (!confirm('Annuler cette demande ?')) return;
    startTransition(async () => {
      const result = await cancelPartRequest(id);
      if (result && !result.success) {
        alert(result.error);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Demandes de pièces</h1>
          <p className="text-neutral-600">
            {permissions.isManager
              ? `${pendingCount} demande${pendingCount > 1 ? 's' : ''} en attente de validation`
              : 'Vos demandes de pièces détachées'
            }
          </p>
        </div>
        {permissions.partRequest.canCreate && (
          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle demande
          </Button>
        )}
      </div>

      {/* Stats (Manager only) */}
      {permissions.isManager && (
        <div className="grid grid-cols-4 gap-4">
          <Card 
            className={`cursor-pointer ${statusFilter === 'PENDING' ? 'ring-2 ring-yellow-400' : ''}`}
            hover
          >
            <div onClick={() => setStatusFilter('PENDING')} className="flex items-center gap-3 p-4">
              <Clock className="w-8 h-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{stats.pending}</p>
                <p className="text-sm text-neutral-600">En attente</p>
              </div>
            </div>
          </Card>
          <Card 
            className={`cursor-pointer ${statusFilter === 'APPROVED' ? 'ring-2 ring-green-400' : ''}`}
            hover
          >
            <div onClick={() => setStatusFilter('APPROVED')} className="flex items-center gap-3 p-4">
              <Check className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{stats.approved}</p>
                <p className="text-sm text-neutral-600">À livrer</p>
              </div>
            </div>
          </Card>
          <Card 
            className={`cursor-pointer ${statusFilter === 'DELIVERED' ? 'ring-2 ring-blue-400' : ''}`}
            hover
          >
            <div onClick={() => setStatusFilter('DELIVERED')} className="flex items-center gap-3 p-4">
              <Truck className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{stats.delivered}</p>
                <p className="text-sm text-neutral-600">Livrées</p>
              </div>
            </div>
          </Card>
          <Card 
            className={`cursor-pointer ${statusFilter === 'REJECTED' ? 'ring-2 ring-red-400' : ''}`}
            hover
          >
            <div onClick={() => setStatusFilter('REJECTED')} className="flex items-center gap-3 p-4">
              <X className="w-8 h-8 text-red-500" />
              <div>
                <p className="text-2xl font-bold">{stats.rejected}</p>
                <p className="text-sm text-neutral-600">Refusées</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Filtre */}
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-neutral-500" />
        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded px-3 py-1.5 text-sm"
        >
          <option value="all">Tous les statuts</option>
          <option value="PENDING">En attente</option>
          <option value="APPROVED">Approuvées</option>
          <option value="DELIVERED">Livrées</option>
          <option value="REJECTED">Refusées</option>
          <option value="CANCELLED">Annulées</option>
        </select>
        {statusFilter !== 'all' && (
          <Button variant="ghost" size="sm" onClick={() => setStatusFilter('all')}>
            Réinitialiser
          </Button>
        )}
      </div>

      {/* Formulaire de création */}
      {showForm && (
        <Card>
          <CardHeader title="Nouvelle demande de pièce" />
          <form action={handleCreateRequest} className="space-y-4 p-4 pt-0">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Pièce *</label>
                <select name="partId" required className="w-full border rounded px-3 py-2">
                  <option value="">Sélectionner une pièce</option>
                  {parts.map(part => (
                    <option key={part.id} value={part.id}>
                      {part.reference} - {part.name} (Stock: {part.quantityInStock})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Input 
                  type="number" 
                  name="quantity" 
                  label="Quantité *"
                  min={1}
                  defaultValue={1} 
                  required 
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Urgence</label>
              <select name="urgency" className="w-full border rounded px-3 py-2">
                <option value="LOW">Basse - Pas urgent</option>
                <option value="NORMAL">Normale</option>
                <option value="HIGH">Haute - Urgent</option>
                <option value="CRITICAL">Critique - Arrêt production</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Raison de la demande *</label>
              <textarea 
                name="reason" 
                required
                rows={3}
                className="w-full border rounded px-3 py-2"
                placeholder="Décrivez pourquoi vous avez besoin de cette pièce..."
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
                Annuler
              </Button>
              <Button type="submit" loading={isPending}>
                Envoyer la demande
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Liste des demandes */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <Card className="p-8 text-center text-neutral-500">
            <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Aucune demande {statusFilter !== 'all' ? 'avec ce statut' : ''}</p>
          </Card>
        ) : (
          filteredRequests.map(request => (
            <Card 
              key={request.id} 
              className={request.status === 'PENDING' && request.urgency === 'CRITICAL' ? 'border-red-300 bg-red-50' : ''}
            >
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium">{request.partReference}</span>
                      <span className="text-neutral-600">- {request.partName}</span>
                      <Badge variant={STATUS_CONFIG[request.status]?.variant || 'default'}>
                        {STATUS_CONFIG[request.status]?.label || request.status}
                      </Badge>
                      {request.urgency !== 'NORMAL' && (
                        <span className={`flex items-center gap-1 text-sm ${URGENCY_CONFIG[request.urgency]?.color}`}>
                          <AlertTriangle className="w-4 h-4" />
                          {URGENCY_CONFIG[request.urgency]?.label}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm text-neutral-600 mb-2">
                      <div>
                        <span className="font-medium">Quantité:</span> {request.quantity}
                      </div>
                      <div>
                        <span className="font-medium">Demandeur:</span> {request.requestedByName}
                      </div>
                      <div>
                        <span className="font-medium">Date:</span>{' '}
                        {new Date(request.createdAt).toLocaleDateString('fr-FR')}
                      </div>
                    </div>

                    <p className="text-sm bg-neutral-50 p-2 rounded mb-2">
                      <span className="font-medium">Raison:</span> {request.reason}
                    </p>

                    {request.workOrderTitle && (
                      <p className="text-sm text-neutral-500">
                        Lié à: {request.workOrderTitle}
                      </p>
                    )}

                    {request.rejectionReason && (
                      <p className="text-sm text-red-600 mt-2">
                        <span className="font-medium">Refusé:</span> {request.rejectionReason}
                      </p>
                    )}

                    {request.approvedByName && request.status !== 'REJECTED' && (
                      <p className="text-sm text-green-600 mt-2">
                        Approuvé par {request.approvedByName} le{' '}
                        {request.approvedAt && new Date(request.approvedAt).toLocaleDateString('fr-FR')}
                      </p>
                    )}

                    {request.deliveredAt && (
                      <p className="text-sm text-blue-600 mt-2">
                        Livré le {new Date(request.deliveredAt).toLocaleDateString('fr-FR')}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 ml-4">
                    {/* Actions Manager - Approuver/Rejeter */}
                    {permissions.partRequest.canApprove && request.status === 'PENDING' && (
                      <>
                        {rejectingId === request.id ? (
                          <div className="space-y-2">
                            <Input
                              placeholder="Raison du refus..."
                              value={rejectionReason}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRejectionReason(e.target.value)}
                              className="w-48"
                            />
                            <div className="flex gap-1">
                              <Button 
                                size="sm" 
                                variant="danger"
                                onClick={() => handleReject(request.id)}
                                loading={isPending}
                              >
                                Confirmer
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => {
                                  setRejectingId(null);
                                  setRejectionReason('');
                                }}
                              >
                                Annuler
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="text-green-600 border-green-300 hover:bg-green-50"
                              onClick={() => handleApprove(request.id)}
                              loading={isPending}
                            >
                              <Check className="w-4 h-4 mr-1" />
                              Approuver
                            </Button>
                            {permissions.partRequest.canReject && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="text-red-600 border-red-300 hover:bg-red-50"
                                onClick={() => setRejectingId(request.id)}
                                disabled={isPending}
                              >
                                <X className="w-4 h-4 mr-1" />
                                Refuser
                              </Button>
                            )}
                          </>
                        )}
                      </>
                    )}

                    {/* Bouton Livrer - Uniquement ADMIN et STOCK_MANAGER */}
                    {permissions.partRequest.canDeliver && request.status === 'APPROVED' && (
                      <Button 
                        size="sm"
                        onClick={() => handleDeliver(request.id)}
                        loading={isPending}
                      >
                        <Truck className="w-4 h-4 mr-1" />
                        Livrer
                      </Button>
                    )}

                    {/* Bouton Annuler - Pour le demandeur si PENDING */}
                    {permissions.partRequest.canCancel({ 
                      requestedById: request.requestedById, 
                      status: request.status 
                    }) && (
                      <Button 
                        size="sm" 
                        variant="ghost"
                        className="text-neutral-500"
                        onClick={() => handleCancel(request.id)}
                        disabled={isPending}
                      >
                        Annuler
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
