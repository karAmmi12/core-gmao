import Link from 'next/link';
import { Box } from 'lucide-react';
import { AssetDTO } from '@/core/application/dto/AssetDTO';
import { AssetStatusBadge } from '@/presentation/components/features/assets/AssetStatusBadge';
import { Card } from '@/presentation/components/ui/Card';

interface DashboardAssetTableProps {
  assets: AssetDTO[];
}

export const DashboardAssetTable = ({ assets }: DashboardAssetTableProps) => {
  if (assets.length === 0) {
    return (
      <Card>
        <div className="p-12 text-center">
          <Box className="mx-auto text-slate-300 mb-3" size={48} />
          <p className="text-slate-500">Aucun équipement enregistré</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden p-0">
      <div className="border-b border-slate-200 px-6 py-4 bg-slate-50">
        <h2 className="text-lg font-bold text-slate-900">Parc Machine</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-bold text-slate-600 uppercase tracking-wide">
                Nom
              </th>
              <th className="text-left px-6 py-3 text-xs font-bold text-slate-600 uppercase tracking-wide">
                N° Série
              </th>
              <th className="text-left px-6 py-3 text-xs font-bold text-slate-600 uppercase tracking-wide">
                État
              </th>
              <th className="text-left px-6 py-3 text-xs font-bold text-slate-600 uppercase tracking-wide">
                Ajouté le
              </th>
              <th className="text-left px-6 py-3 text-xs font-bold text-slate-600 uppercase tracking-wide">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {assets.map((asset) => (
              <tr key={asset.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <span className="font-semibold text-slate-900">{asset.name}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="font-mono text-sm text-slate-600">
                    {asset.serialNumber}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <AssetStatusBadge status={asset.status} />
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {new Date(asset.createdAt).toLocaleDateString('fr-FR')}
                </td>
                <td className="px-6 py-4">
                  <Link
                    href={`/assets/${asset.id}`}
                    className="text-orange-600 hover:text-orange-500 font-medium text-sm transition-colors"
                  >
                    Voir détails →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
