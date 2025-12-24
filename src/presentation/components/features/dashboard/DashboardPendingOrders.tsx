import { Card } from '@/presentation/components/ui/Card';
import { Activity } from 'lucide-react';

interface DashboardPendingOrdersProps {
  pendingCount: number;
  availabilityRate: number;
}

export const DashboardPendingOrders = ({ pendingCount, availabilityRate }: DashboardPendingOrdersProps) => {
  return (
    <Card variant="gradient" gradient="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
      <div className="flex items-center gap-2 mb-3">
        <Activity className="text-orange-600" size={20} />
        <h3 className="font-bold text-slate-900">Interventions en cours</h3>
      </div>
      <div className="text-4xl font-black text-orange-600 mb-2">
        {pendingCount}
      </div>
      <p className="text-sm text-slate-700 mb-4">
        Tickets ouverts nécessitant une action
      </p>
      <div className="bg-white rounded-lg p-3 border border-orange-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600">Taux de disponibilité</span>
          <span className="font-bold text-slate-900">
            {availabilityRate.toFixed(0)}%
          </span>
        </div>
        <div className="mt-2 bg-slate-200 rounded-full h-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-orange-500 to-orange-600 h-full transition-all duration-500"
            style={{ width: `${availabilityRate}%` }}
          />
        </div>
      </div>
    </Card>
  );
};
