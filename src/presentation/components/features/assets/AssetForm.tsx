'use client';

import { useState } from 'react';
import { createAssetAction } from "@/app/actions";
import { Box, FileText, Edit3 } from "lucide-react";
import { Input } from '@/components';
import { AssetDTO } from "@/core/application/dto/AssetDTO";
import type { ConfigurationItemDTO } from '@/core/application/dto/ConfigurationDTO';
import { LAYOUT_STYLES } from '@/styles/design-system';
import { DataForm } from '@/presentation/components/forms/DataForm';
import { DocumentUploader } from '@/presentation/components/features/DocumentUploader';
import { Card } from '@/presentation/components/ui';

interface AssetFormProps {
  assets?: AssetDTO[];
  assetTypes: ConfigurationItemDTO[];
}

export function AssetForm({ assets = [], assetTypes }: AssetFormProps) {
  const [activeTab, setActiveTab] = useState<'manual' | 'scan'>('manual');
  const [extractedData, setExtractedData] = useState<any>(null);

  // Si des données ont été extraites, pré-remplir le formulaire
  const handleDocumentProcessed = (result: any) => {
    setExtractedData(result.extractedData);
    // Basculer vers l'onglet manuel pour voir les données pré-remplies
    setActiveTab('manual');
  };

  return (
    <Card className="p-6">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Box className="text-primary-600" size={20} />
          <h2 className="text-xl font-semibold">Nouvel Équipement</h2>
        </div>

        {/* Onglets */}
        <div className="flex border-b border-gray-200">
          <button
            type="button"
            onClick={() => setActiveTab('manual')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'manual'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Edit3 size={16} />
              Saisie manuelle
            </div>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('scan')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'scan'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <FileText size={16} />
              🤖 Scanner une fiche technique
            </div>
          </button>
        </div>
      </div>

      {/* Contenu des onglets */}
      {activeTab === 'scan' ? (
        <div className="py-4">
          <DocumentUploader
            type="technical_sheet"
            onProcessed={handleDocumentProcessed}
          />

          {extractedData && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                ✅ Données extraites ! Basculez sur l'onglet "Saisie manuelle" pour voir le formulaire pré-rempli.
              </p>
            </div>
          )}
        </div>
      ) : (
        <DataForm
          action={createAssetAction}
          submitLabel="➕ Ajouter au parc"
        >
          {({ errors }) => (
            <>
          <Input
            label="Nom de la machine"
            name="name"
            placeholder="Ex: Presse Hydraulique"
            defaultValue={extractedData?.name || ''}
            error={errors?.name?.[0]}
          />

          <Input
            label="N° de Série"
            name="serial"
            defaultValue={extractedData?.serialNumber || ''}
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
              defaultValue={extractedData?.manufacturer || ''}
              error={errors?.manufacturer?.[0]}
            />
          </div>

          <Input
            label="Numéro de modèle (optionnel)"
            name="modelNumber"
            placeholder="Ex: HPP-500-2024"
            defaultValue={extractedData?.modelNumber || ''}
            error={errors?.modelNumber?.[0]}
          />

          {extractedData?.specifications && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm font-medium text-green-800 mb-2">
                📋 Spécifications extraites par IA :
              </p>
              <pre className="text-xs text-green-700 overflow-auto">
                {JSON.stringify(extractedData.specifications, null, 2)}
              </pre>
            </div>
          )}
        </>
      )}
    </DataForm>
      )}
    </Card>
  );
}
