'use client';

import { AssetDTO } from '@/core/application/dto/AssetDTO';
import { Card } from '@/components';
import { AssetStatusBadge } from './AssetStatusBadge';
import { updateAssetStatusAction } from '@/app/actions';
import { Button } from '@/components';
import { useState } from 'react';

interface AssetDetailCardProps {
  asset: AssetDTO;
}

export const AssetDetailCard = ({ asset }: AssetDetailCardProps) => {
  const [isChangingStatus, setIsChangingStatus] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(asset.status);

  const handleStatusChange = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsChangingStatus(true);
    
    const formData = new FormData(e.currentTarget);
    await updateAssetStatusAction(formData);
    
    setIsChangingStatus(false);
  };

  return (
    <Card>
      <div className="space-y-6">
        {/* En-tête avec nom et statut */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">{asset.name}</h1>
            <p className="text-neutral-500 font-mono">SN: {asset.serialNumber}</p>
          </div>
          <AssetStatusBadge status={asset.status} />
        </div>

        {/* Informations supplémentaires */}
        {(asset.assetType || asset.location || asset.manufacturer || asset.modelNumber) && (
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-neutral-200">
            {asset.assetType && (
              <div>
                <p className="text-sm text-neutral-500">Type</p>
                <p className="font-medium text-neutral-900">{asset.assetType}</p>
              </div>
            )}
            {asset.location && (
              <div>
                <p className="text-sm text-neutral-500">Localisation</p>
                <p className="font-medium text-neutral-900">{asset.location}</p>
              </div>
            )}
            {asset.manufacturer && (
              <div>
                <p className="text-sm text-neutral-500">Fabricant</p>
                <p className="font-medium text-neutral-900">{asset.manufacturer}</p>
              </div>
            )}
            {asset.modelNumber && (
              <div>
                <p className="text-sm text-neutral-500">Modèle</p>
                <p className="font-medium text-neutral-900">{asset.modelNumber}</p>
              </div>
            )}
          </div>
        )}

        {/* Formulaire de changement de statut */}
        <div className="pt-4 border-t border-neutral-200">
          <h3 className="text-sm font-semibold text-neutral-700 mb-3">🔧 Changer le statut</h3>
          <form onSubmit={handleStatusChange} className="flex gap-3">
            <input type="hidden" name="assetId" value={asset.id} />
            <input type="hidden" name="currentPath" value={`/assets/${asset.id}`} />
            
            <select
              name="status"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              disabled={isChangingStatus}
            >
              <option value="RUNNING">✅ En fonctionnement</option>
              <option value="STOPPED">⏸️ Arrêté</option>
              <option value="MAINTENANCE">🔧 En maintenance</option>
            </select>
            
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isChangingStatus}
              disabled={selectedStatus === asset.status}
            >
              Mettre à jour
            </Button>
          </form>
        </div>
      </div>
    </Card>
  );
};
