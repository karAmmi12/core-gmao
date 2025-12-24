import { Box, CheckCircle, AlertCircle, Zap } from 'lucide-react';
import { DashboardStatsDTO } from '@/core/application/dto/AssetDTO';

interface DashboardStatsProps {
  stats: DashboardStatsDTO;
}

export const DashboardStats = ({ stats }: DashboardStatsProps) => {
  const statCards = [
    {
      icon: <Box className="text-slate-600" size={20} />,
      label: 'Total',
      value: stats.totalAssets,
      subtitle: 'Équipements',
      gradient: 'from-slate-50 to-slate-100',
      border: 'border-slate-200',
      labelColor: 'text-slate-500',
      valueColor: 'text-slate-900',
      subtitleColor: 'text-slate-600',
    },
    {
      icon: <CheckCircle className="text-green-600" size={20} />,
      label: 'Actifs',
      value: stats.runningAssets,
      subtitle: 'En marche',
      gradient: 'from-green-50 to-green-100',
      border: 'border-green-200',
      labelColor: 'text-green-700',
      valueColor: 'text-green-900',
      subtitleColor: 'text-green-700',
    },
    {
      icon: <AlertCircle className="text-yellow-600" size={20} />,
      label: 'Arrêtés',
      value: stats.stoppedAssets,
      subtitle: 'Maintenance préventive',
      gradient: 'from-yellow-50 to-yellow-100',
      border: 'border-yellow-200',
      labelColor: 'text-yellow-700',
      valueColor: 'text-yellow-900',
      subtitleColor: 'text-yellow-700',
    },
    {
      icon: <Zap className="text-red-600" size={20} />,
      label: 'Pannes',
      value: stats.brokenAssets,
      subtitle: 'Interventions urgentes',
      gradient: 'from-red-50 to-red-100',
      border: 'border-red-200',
      labelColor: 'text-red-700',
      valueColor: 'text-red-900',
      subtitleColor: 'text-red-700',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {statCards.map((card, index) => (
        <div
          key={index}
          className={`bg-gradient-to-br ${card.gradient} rounded-xl border ${card.border} p-5`}
        >
          <div className="flex items-center justify-between mb-3">
            {card.icon}
            <span className={`text-xs font-bold ${card.labelColor} uppercase tracking-wide`}>
              {card.label}
            </span>
          </div>
          <span className={`text-3xl font-bold ${card.valueColor} block`}>
            {card.value}
          </span>
          <span className={`text-sm ${card.subtitleColor}`}>
            {card.subtitle}
          </span>
        </div>
      ))}
    </div>
  );
};
