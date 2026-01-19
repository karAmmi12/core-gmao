'use client';

import { createAssetAction } from "@/app/actions";
import { Box } from "lucide-react";
import { Input } from '@/components';
import { AssetDTO } from "@/core/application/dto/AssetDTO";
import type { ConfigurationItemDTO } from '@/core/application/dto/ConfigurationDTO';
import { LAYOUT_STYLES } from '@/styles/design-system';
import { DataForm } from '@/presentation/components/forms/DataForm';

interface AssetFormProps {
  assets?: AssetDTO[];
  assetTypes: ConfigurationItemDTO[];
}

export function AssetForm({ assets = [], assetTypes }: AssetFormProps) {
  return (
    <DataForm
      action={createAssetAction}
      title="Nouvel Équipement"
      icon={<Box className="text-primary-600" size={20} />}
      submitLabel="➕ Ajouter au parc"
    >
      {({ errors }) => (
        <>
          <Input
            label="Nom de la machine"
            name="name"
            placeholder="Ex: Presse Hydraulique"
            error={errors?.name?.[0]}
          />

          <Input
            label="N° de Série"
            name="serial"
            placeholder="Ex: SN-2024-001"
            error={errors?.serialNumber?.[0]}
          />

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-neutral-700 mb-1">
              Statut *
            </label>
            <select
              id="status"
              name="status"
              defaultValue="RUNNING"
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="RUNNING">✅ En fonctionnement</option>
              <option value="STOPPED">⏸️ Arrêté</option>
              <option value="MAINTENANCE">🔧 En maintenance</option>
            </select>
            {errors?.status?.[0] && (
              <p className="text-danger-600 text-sm mt-1">{errors.status[0]}</p>
            )}
          </div>

          <div>
            <label htmlFor="assetType" className="block text-sm font-medium text-neutral-700 mb-1">
              Type d'actif
            </label>
            <select
              id="assetType"
              name="assetType"
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">-- Sélectionner --</option>
              {assetTypes.map((type) => (
                <option key={type.id} value={type.code}>
                  {type.label}
                </option>
              ))}
            </select>
            {errors?.assetType?.[0] && (
              <p className="text-danger-600 text-sm mt-1">{errors.assetType[0]}</p>
            )}
          </div>

          {assets.length > 0 && (
            <div>
              <label htmlFor="parentId" className="block text-sm font-medium text-neutral-700 mb-1">
                Actif parent (optionnel)
              </label>
              <select
                id="parentId"
                name="parentId"
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">-- Aucun (actif racine) --</option>
                {assets.map((asset) => (
                  <option key={asset.id} value={asset.id}>
                    {asset.name} ({asset.serialNumber})
                  </option>
                ))}
              </select>
              {errors?.parentId?.[0] && (
                <p className="text-danger-600 text-sm mt-1">{errors.parentId[0]}</p>
              )}
            </div>
          )}

          <div className={LAYOUT_STYLES.gridResponsive2}>
            <Input
              label="Localisation (optionnel)"
              name="location"
              placeholder="Ex: Atelier A - Zone 3"
              error={errors?.location?.[0]}
            />

            <Input
              label="Fabricant (optionnel)"
              name="manufacturer"
              placeholder="Ex: Schneider Electric"
              error={errors?.manufacturer?.[0]}
            />
          </div>

          <Input
            label="Numéro de modèle (optionnel)"
            name="modelNumber"
            placeholder="Ex: HPP-500-2024"
            error={errors?.modelNumber?.[0]}
          />
        </>
      )}
    </DataForm>
  );
}
