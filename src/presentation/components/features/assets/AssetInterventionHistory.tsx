import { WorkOrder } from '@/core/domain/entities/WorkOrder';
import { completeWorkOrderAction } from '@/app/actions';
import { Card, CardHeader } from '@/presentation/components/ui/Card';
import { CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import { Badge } from '@/presentation/components/ui/Badge';
import { Button } from '@/presentation/components/ui/Button';

interface AssetInterventionHistoryProps {
  history: WorkOrder[];
  assetId: string;
}

export const AssetInterventionHistory = ({ history, assetId }: AssetInterventionHistoryProps) => {
  if (history.length === 0) {
    return (
      <Card>
        <CardHeader title="Historique des Interventions" />
        <div className="p-12 text-center text-slate-400">
          <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p>Aucune intervention enregistrée.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden p-0">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <h2 className="text-lg font-bold text-slate-800">Historique des Interventions</h2>
        <span className="text-xs bg-slate-200 text-slate-600 px-2 py-1 rounded-full">
          {history.length} tickets
        </span>
      </div>

      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
          <tr>
            <th className="p-4">Priorité</th>
            <th className="p-4">Titre</th>
            <th className="p-4">Date</th>
            <th className="p-4">Statut</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {history.map((order) => (
            <tr key={order.id} className="hover:bg-slate-50 transition-colors">
              <td className="p-4">
                {order.priority === 'HIGH' ? (
                  <span className="inline-flex items-center text-red-600 font-bold text-xs">
                    <AlertTriangle className="w-3 h-3 mr-1" /> HAUTE
                  </span>
                ) : (
                  <span className="text-slate-500 text-xs">BASSE</span>
                )}
              </td>
              <td className="p-4 font-medium text-slate-700">{order.title}</td>
              <td className="p-4 text-slate-500">
                {new Date(order.createdAt).toLocaleDateString('fr-FR')}
              </td>
              <td className="p-4 flex items-center gap-3">
                {order.status === 'PENDING' ? (
                  <Badge variant="warning" icon={<Clock size={12} />}>
                    EN ATTENTE
                  </Badge>
                ) : (
                  <Badge variant="success" icon={<CheckCircle size={12} />}>
                    TERMINÉ
                  </Badge>
                )}

                {order.status === 'PENDING' && (
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
          ))}
        </tbody>
      </table>
    </Card>
  );
};
