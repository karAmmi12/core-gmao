'use client';

import { createAssetAction } from "@/app/actions";
import { useActionState } from "react";
import { Box } from "lucide-react";
import { Card, CardHeader } from "@/presentation/components/ui/Card";
import { Input } from "@/presentation/components/ui/Input";
import { Button } from "@/presentation/components/ui/Button";

export function AssetForm() {
  const [state, formAction, isPending] = useActionState(createAssetAction, null);

  return (
    <Card>
      <CardHeader icon={<Box className="text-orange-600" size={20} />} title="Nouvel Équipement" />

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

        {state?.error && !state.errors && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-700 text-sm">{state.error}</p>
          </div>
        )}

        {state?.success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-green-700 text-sm">✓ Équipement ajouté avec succès !</p>
          </div>
        )}

        <Button type="submit" isLoading={isPending} className="w-full">
          ➕ Ajouter au parc
        </Button>
      </form>
    </Card>
  );
}