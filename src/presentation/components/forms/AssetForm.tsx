'use client';

import { createAssetAction } from "@/app/actions";
import { useActionState } from "react";
import { Box } from "lucide-react";
import { Card, CardHeader } from "@/presentation/components/ui/Card";
import { Input } from "@/presentation/components/ui/Input";
import { Button } from "@/presentation/components/ui/Button";
import { AssetDTO } from "@/core/application/dto/AssetDTO";

interface AssetFormProps {
  assets?: AssetDTO[];
}

export function AssetForm({ assets = [] }: AssetFormProps) {
  const [state, formAction, isPending] = useActionState(createAssetAction, null);

  return (
    <Card>
      <CardHeader icon={<Box className="text-primary-600" size={20} />} title="Nouvel Équipement" />

      <form action={formAction} className="space-y-4">
        <Input
          label="Nom de la machine"
          name="name"
          placeholder="Ex: Presse Hydraulique"
          error={state?.errors?.name?.[0]}
        />

        <Input
          label="N° de Série"
          name="serial"
          placeholder="Ex: SN-2024-001"
          error={state?.errors?.serialNumber?.[0]}
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
          {state?.errors?.status?.[0] && (
            <p className="text-danger-600 text-sm mt-1">{state.errors.status[0]}</p>
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
            <option value="SITE">Site</option>
            <option value="BUILDING">Bâtiment</option>
            <option value="LINE">Ligne de production</option>
            <option value="MACHINE">Machine</option>
            <option value="COMPONENT">Composant</option>
          </select>
          {state?.errors?.assetType?.[0] && (
            <p className="text-danger-600 text-sm mt-1">{state.errors.assetType[0]}</p>
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
            {state?.errors?.parentId?.[0] && (
              <p className="text-danger-600 text-sm mt-1">{state.errors.parentId[0]}</p>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Localisation (optionnel)"
            name="location"
            placeholder="Ex: Atelier A - Zone 3"
            error={state?.errors?.location?.[0]}
          />

          <Input
            label="Fabricant (optionnel)"
            name="manufacturer"
            placeholder="Ex: Schneider Electric"
            error={state?.errors?.manufacturer?.[0]}
          />
        </div>

        <Input
          label="Numéro de modèle (optionnel)"
          name="modelNumber"
          placeholder="Ex: HPP-500-2024"
          error={state?.errors?.modelNumber?.[0]}
        />

        {state?.error && !state.errors && (
          <div className="bg-danger-50 border border-danger-200 rounded-lg p-3">
            <p className="text-danger-700 text-sm">{state.error}</p>
          </div>
        )}

        {state?.success && (
          <div className="bg-success-50 border border-success-200 rounded-lg p-3">
            <p className="text-success-700 text-sm">✓ Équipement ajouté avec succès !</p>
          </div>
        )}

        <Button type="submit" isLoading={isPending} className="w-full">
          ➕ Ajouter au parc
        </Button>
      </form>
    </Card>
  );
}
