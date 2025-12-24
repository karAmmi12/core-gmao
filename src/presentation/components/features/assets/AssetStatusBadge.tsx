import { Badge } from '@/presentation/components/ui/Badge';
import { CheckCircle, AlertCircle, Zap } from 'lucide-react';

interface AssetStatusBadgeProps {
  status: string;
}

export const AssetStatusBadge = ({ status }: AssetStatusBadgeProps) => {
  if (status === 'RUNNING') {
    return (
      <Badge variant="success" icon={<CheckCircle size={12} />}>
        Opérationnel
      </Badge>
    );
  }

  if (status === 'STOPPED') {
    return (
      <Badge variant="warning" icon={<AlertCircle size={12} />}>
        Arrêté
      </Badge>
    );
  }

  if (status === 'BROKEN' || status === 'MAINTENANCE') {
    return (
      <Badge variant="danger" icon={<Zap size={12} />}>
        En panne
      </Badge>
    );
  }

  return (
    <Badge variant="neutral">
      {status}
    </Badge>
  );
};
