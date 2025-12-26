import { Box, CheckCircle, AlertCircle, Zap } from 'lucide-react';
import { DashboardStatsDTO } from '@/core/application/dto/AssetDTO';
import { assetStatusConfig } from '@/styles/theme';

interface DashboardStatsProps {
  stats: DashboardStatsDTO;
}

export const DashboardStats = ({ stats }: DashboardStatsProps) => {
  const statCards = [
    {
      ...assetStatusConfig.TOTAL,
      value: stats.totalAssets,
    },
    {
      ...assetStatusConfig.RUNNING,
      value: stats.runningAssets,
    },
    {
      ...assetStatusConfig.STOPPED,
      value: stats.stoppedAssets,
    },
    {
      ...assetStatusConfig.BROKEN,
      value: stats.brokenAssets,
    },
  ];

  const iconMap = {
    Box: <Box className={assetStatusConfig.TOTAL.iconColor} size={20} />,
    CheckCircle: <CheckCircle className={assetStatusConfig.RUNNING.iconColor} size={20} />,
    AlertCircle: <AlertCircle className={assetStatusConfig.STOPPED.iconColor} size={20} />,
    Zap: <Zap className={assetStatusConfig.BROKEN.iconColor} size={20} />,
  };

  return (
    <div className="grid-stats">
      {statCards.map((card, index) => (
        <div key={index} className={card.cardClass}>
          <div className="flex items-center justify-between mb-3">
            {iconMap[card.icon as keyof typeof iconMap]}
            <span className={card.labelClass}>
              {card.label}
            </span>
          </div>
          <span className={card.valueClass + ' block'}>
            {card.value}
          </span>
          <span className={card.subtitleClass}>
            {card.subtitle}
          </span>
        </div>
      ))}
    </div>
  );
};
