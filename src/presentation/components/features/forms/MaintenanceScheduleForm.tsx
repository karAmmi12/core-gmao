'use client';

import { useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components';
import { Button } from '@/components';
import { Card } from '@/components';
import { ActionState } from '@/core/application/types/ActionState';
import { AssetDTO } from '@/core/application/dto/AssetDTO';
import { TechnicianDTO } from '@/core/application/dto/TechnicianDTO';
import { LAYOUT_STYLES, cn } from '@/styles/design-system';

interface MaintenanceScheduleFormProps {
  assets: AssetDTO[];
  technicians: TechnicianDTO[];
  createAction: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
}

export function MaintenanceScheduleForm({ assets, technicians, createAction }: MaintenanceScheduleFormProps) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(createAction, {
    success: false,
    errors: {},
  });

  useEffect(() => {
    if (state?.success) {
      router.push('/maintenance');
    }
  }, [state?.success, router]);

  return (
    <form action={formAction}>
      <Card>
        <div className="space-y-6">
          <div>
            <label htmlFor="assetId" className="block text-sm font-medium text-gray-700 mb-1">
              Équipement *
            </label>
            <select
              id="assetId"
              name="assetId"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Sélectionnez un équipement</option>
              {assets.map((asset) => (
                <option key={asset.id} value={asset.id}>
                  {asset.name} ({asset.location})
                </option>
              ))}
            </select>
            {state?.errors?.assetId && (
              <p className="text-red-600 text-sm mt-1">{state.errors.assetId}</p>
            )}
          </div>

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Titre *
            </label>
            <Input
              id="title"
              name="title"
              type="text"
              placeholder="ex: Vérification mensuelle des filtres"
              required
            />
            {state?.errors?.title && (
              <p className="text-red-600 text-sm mt-1">{state.errors.title}</p>
            )}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Détails de la maintenance préventive..."
            />
          </div>

          <div className={LAYOUT_STYLES.grid2}>
            <div>
              <label htmlFor="frequency" className="block text-sm font-medium text-gray-700 mb-1">
                Fréquence *
              </label>
              <select
                id="frequency"
                name="frequency"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="DAILY">Quotidien</option>
                <option value="WEEKLY">Hebdomadaire</option>
                <option value="MONTHLY">Mensuel</option>
                <option value="QUARTERLY">Trimestriel</option>
                <option value="YEARLY">Annuel</option>
              </select>
              {state?.errors?.frequency && (
                <p className="text-red-600 text-sm mt-1">{state.errors.frequency}</p>
              )}
            </div>

            <div>
              <label htmlFor="intervalValue" className="block text-sm font-medium text-gray-700 mb-1">
                Intervalle *
              </label>
              <Input
                id="intervalValue"
                name="intervalValue"
                type="number"
                min="1"
                max="100"
                defaultValue="1"
                placeholder="1"
                required
              />
              {state?.errors?.intervalValue && (
                <p className="text-red-600 text-sm mt-1">{state.errors.intervalValue}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Ex: 2 avec fréquence "Mensuel" = tous les 2 mois
              </p>
            </div>
          </div>

          <div>
            <label htmlFor="nextDueDate" className="block text-sm font-medium text-gray-700 mb-1">
              Prochaine date prévue *
            </label>
            <Input
              id="nextDueDate"
              name="nextDueDate"
              type="date"
              required
            />
            {state?.errors?.nextDueDate && (
              <p className="text-red-600 text-sm mt-1">{state.errors.nextDueDate}</p>
            )}
          </div>

          <div className={LAYOUT_STYLES.grid2}>
            <div>
              <label htmlFor="estimatedDuration" className="block text-sm font-medium text-gray-700 mb-1">
                Durée estimée (heures)
              </label>
              <Input
                id="estimatedDuration"
                name="estimatedDuration"
                type="number"
                step="0.5"
                min="0"
                placeholder="2.5"
              />
            </div>

            <div>
              <label htmlFor="assignedToId" className="block text-sm font-medium text-gray-700 mb-1">
                Technicien assigné
              </label>
              <select
                id="assignedToId"
                name="assignedToId"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Non assigné</option>
                {technicians.map((tech) => (
                  <option key={tech.id} value={tech.id}>
                    {tech.name} - {tech.specialization}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
              Priorité *
            </label>
            <select
              id="priority"
              name="priority"
              defaultValue="LOW"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="LOW">Basse</option>
              <option value="HIGH">Haute</option>
            </select>
          </div>

          {state?.errors?.form && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {state.errors.form}
            </div>
          )}

          <div className={cn(LAYOUT_STYLES.flexRow, 'pt-4')}>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Création...' : 'Créer le planning'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.back()}
            >
              Annuler
            </Button>
          </div>
        </div>
      </Card>
    </form>
  );
}
