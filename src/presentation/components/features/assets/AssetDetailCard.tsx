import { Asset } from '@/core/domain/entities/Asset';
import { Card } from '@/presentation/components/ui/Card';
import { AssetStatusBadge } from './AssetStatusBadge';

interface AssetDetailCardProps {
  asset: Asset;
}

export const AssetDetailCard = ({ asset }: AssetDetailCardProps) => {
  return (
    <Card>
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-2">{asset.name}</h1>
          <p className="text-slate-500 font-mono">SN: {asset.serialNumber}</p>
        </div>
        <AssetStatusBadge status={asset.status} />
      </div>
    </Card>
  );
};
