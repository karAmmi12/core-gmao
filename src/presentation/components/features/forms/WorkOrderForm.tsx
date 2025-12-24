'use client';

import { createWorkOrderAction } from '@/app/actions';
import { Card, CardHeader } from '@/presentation/components/ui/Card';
import { Input, Select } from '@/presentation/components/ui/Input';
import { Button } from '@/presentation/components/ui/Button';
import { Activity } from 'lucide-react';
import { AssetDTO } from '@/core/application/dto/AssetDTO';
import { useActionState } from 'react';

interface WorkOrderFormProps {
  assets: AssetDTO[];
}

export const WorkOrderForm = ({ assets }: WorkOrderFormProps) => {
  const [state, formAction, isPending] = useActionState(createWorkOrderAction, null);

  return (
    <Card>
      <CardHeader icon={<Activity className="text-orange-600" size={20} />} title="Nouvelle Intervention" />

      <form action={formAction} className="space-y-4">
        <Input
          label="Description"
          name="title"
          placeholder="Ex: Remplacement courroie"
          error={state?.errors?.title?.[0]}
        />

        <Select label="Priorité" name="priority" error={state?.errors?.priority?.[0]}>
          <option value="LOW">Basse</option>
          <option value="HIGH">Haute</option>
        </Select>

        <Select label="Équipement concerné" name="assetId" error={state?.errors?.assetId?.[0]}>
          <option value="">-- Sélectionner --</option>
          {assets.map((asset) => (
            <option key={asset.id} value={asset.id}>
              {asset.name} ({asset.serialNumber})
            </option>
          ))}
        </Select>

        {state?.error && !state.errors && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-700 text-sm">{state.error}</p>
          </div>
        )}

        {state?.success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-green-700 text-sm">✓ Intervention créée avec succès !</p>
          </div>
        )}

        <Button type="submit" isLoading={isPending} className="w-full">
          ➕ Planifier
        </Button>
      </form>
    </Card>
  );
};
