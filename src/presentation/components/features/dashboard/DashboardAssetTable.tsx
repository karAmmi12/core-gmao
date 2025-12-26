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
          <Box className="mx-auto text-neutral-300 mb-3" size={48} />
          <p className="text-neutral-500">Aucun équipement enregistré</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden p-0">
      <div className="border-b border-neutral-200 px-6 py-4 bg-neutral-50">
        <h2 className="text-lg text-heading">Parc Machine</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-neutral-50 border-b border-neutral-200">
            <tr>
              <th className="text-left px-6 py-3 text-label text-neutral-600">
                Nom
              </th>
              <th className="text-left px-6 py-3 text-label text-neutral-600">
                N° Série
              </th>
              <th className="text-left px-6 py-3 text-label text-neutral-600">
                État
              </th>
              <th className="text-left px-6 py-3 text-label text-neutral-600">
                Ajouté le
              </th>
              <th className="text-left px-6 py-3 text-label text-neutral-600">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {assets.map((asset) => (
              <tr key={asset.id} className="hover:bg-neutral-50 transition-colors">
                <td className="px-6 py-4">
                  <span className="font-semibold text-neutral-900">{asset.name}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="font-mono text-sm text-neutral-600">
                    {asset.serialNumber}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <AssetStatusBadge status={asset.status} />
                </td>
                <td className="px-6 py-4 text-sm text-neutral-600">
                  {new Date(asset.createdAt).toLocaleDateString('fr-FR')}
                </td>
                <td className="px-6 py-4">
                  <Link
                    href={`/assets/${asset.id}`}
                    className="link-primary font-medium text-sm"
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
