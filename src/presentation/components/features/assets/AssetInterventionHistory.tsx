'use client';

import { WorkOrderDTO } from '@/core/application/dto/WorkOrderDTO';
import { completeWorkOrderAction } from '@/app/actions';
import { Card, CardHeader } from '@/components';
import { CheckCircle, AlertTriangle, Clock, Package, ChevronDown, ChevronUp } from 'lucide-react';
import { Badge } from '@/components';
import { Button } from '@/components';
import { useState } from 'react';

interface AssetInterventionHistoryProps {
  history: WorkOrderDTO[];
  assetId: string;
}

export const AssetInterventionHistory = ({ history, assetId }: AssetInterventionHistoryProps) => {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = (orderId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedRows(newExpanded);
  };

  if (history.length === 0) {
    return (
      <Card>
        <CardHeader title="Historique des Interventions" />
        <div className="p-12 text-center text-neutral-400">
          <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p>Aucune intervention enregistrée.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden p-0">
      <div className="p-6 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/50">
        <h2 className="text-lg text-heading">Historique des Interventions</h2>
        <span className="badge-neutral">
          {history.length} tickets
        </span>
      </div>

      <table className="w-full text-left text-sm">
        <thead className="bg-neutral-50 text-neutral-500 font-medium border-b border-neutral-100">
          <tr>
            <th className="p-4 w-12"></th>
            <th className="p-4">Priorité</th>
            <th className="p-4">Titre</th>
            <th className="p-4">Date</th>
            <th className="p-4">Statut</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100">
          {history.map((order) => {
            const isExpanded = expandedRows.has(order.id);
            const hasParts = order.parts && order.parts.length > 0;

            return (
              <>
                <tr key={order.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="p-4">
                    {hasParts && (
                      <button
                        onClick={() => toggleRow(order.id)}
                        className="text-neutral-400 hover:text-neutral-600 transition-colors"
                      >
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    )}
                  </td>
                  <td className="p-4">
                    {order.priority === 'HIGH' ? (
                      <span className="inline-flex items-center text-danger-600 font-bold text-xs">
                        <AlertTriangle className="w-3 h-3 mr-1" /> HAUTE
                      </span>
                    ) : (
                      <span className="text-neutral-500 text-xs">BASSE</span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-neutral-700">{order.title}</span>
                      {hasParts && (
                        <Badge variant="neutral" icon={<Package size={10} />}>
                          {order.parts.length}
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-neutral-500">
                    {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="p-4 flex items-center gap-3">
                    {order.status === 'DRAFT' && (
                      <Badge variant="neutral" icon={<Clock size={12} />}>
                        BROUILLON
                      </Badge>
                    )}
                    {order.status === 'PLANNED' && (
                      <Badge variant="warning" icon={<Clock size={12} />}>
                        PLANIFIÉ
                      </Badge>
                    )}
                    {order.status === 'IN_PROGRESS' && (
                      <Badge variant="warning" icon={<AlertTriangle size={12} />}>
                        EN COURS
                      </Badge>
                    )}
                    {order.status === 'COMPLETED' && (
                      <Badge variant="success" icon={<CheckCircle size={12} />}>
                        TERMINÉ
                      </Badge>
                    )}
                    {order.status === 'CANCELLED' && (
                      <Badge variant="neutral">
                        ANNULÉ
                      </Badge>
                    )}

                    {(order.status === 'DRAFT' || order.status === 'PLANNED' || order.status === 'IN_PROGRESS') && (
                      <form action={completeWorkOrderAction}>
                        <input type="hidden" name="workOrderId" value={order.id} />
                        <input type="hidden" name="assetPath" value={`/assets/${assetId}`} />
                        <Button
                          type="submit"
                          variant="secondary"
                          size="sm"
                          title="Marquer comme terminé"
                        >
                          ✓ Valider
                        </Button>
                      </form>
                    )}
                  </td>
                </tr>

                {/* Ligne extensible pour les pièces */}
                {isExpanded && hasParts && (
                  <tr>
                    <td colSpan={5} className="p-0 bg-neutral-50/50">
                      <div className="p-4 pl-16">
                        <div className="flex items-center gap-2 mb-3">
                          <Package size={16} className="text-neutral-500" />
                          <span className="font-semibold text-neutral-700">Pièces utilisées</span>
                        </div>
                        <table className="w-full text-xs">
                          <thead className="border-b border-neutral-200">
                            <tr className="text-neutral-500">
                              <th className="pb-2 text-left">Référence</th>
                              <th className="pb-2 text-left">Pièce</th>
                              <th className="pb-2 text-right">Quantité</th>
                              <th className="pb-2 text-right">Prix unitaire</th>
                              <th className="pb-2 text-right">Total</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-neutral-100">
                            {order.parts!.map((part, idx) => (
                              <tr key={idx}>
                                <td className="py-2 font-mono text-neutral-600">{part.partReference}</td>
                                <td className="py-2 text-neutral-700">{part.partName}</td>
                                <td className="py-2 text-right text-neutral-600">{part.quantity}</td>
                                <td className="py-2 text-right text-neutral-600">{part.unitPrice.toFixed(2)} €</td>
                                <td className="py-2 text-right font-semibold text-neutral-700">{part.totalPrice.toFixed(2)} €</td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot className="border-t-2 border-neutral-300">
                            <tr>
                              <td colSpan={4} className="pt-2 text-right font-semibold text-neutral-700">
                                Coût total matériel:
                              </td>
                              <td className="pt-2 text-right font-bold text-primary-600">
                                {order.parts!.reduce((sum, p) => sum + p.totalPrice, 0).toFixed(2)} €
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            );
          })}
        </tbody>
      </table>
    </Card>
  );
};
