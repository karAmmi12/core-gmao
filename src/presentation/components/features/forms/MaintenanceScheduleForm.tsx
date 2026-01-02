'use client';

import { useActionState, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input, Select, Textarea, Alert } from '@/components';
import { Button } from '@/components';
import { Card } from '@/components';
import { ActionState } from '@/core/application/types/ActionState';
import { AssetDTO } from '@/core/application/dto/AssetDTO';
import { TechnicianDTO } from '@/core/application/dto/TechnicianDTO';
import { LAYOUT_STYLES, cn } from '@/styles/design-system';
import { Clock, Activity, Info } from 'lucide-react';

interface MaintenanceScheduleFormProps {
  assets: AssetDTO[];
  technicians: TechnicianDTO[];
  createAction: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
}

// Métriques prédéfinies pour faciliter la saisie
const PREDEFINED_METRICS = [
  { label: 'Heures de fonctionnement', unit: 'h' },
  { label: 'Kilométrage', unit: 'km' },
  { label: 'Cycles de production', unit: 'cycles' },
  { label: 'Nombre d\'opérations', unit: 'ops' },
  { label: 'Pression', unit: 'bar' },
  { label: 'Température maximale', unit: '°C' },
  { label: 'Vibration', unit: 'mm/s' },
  { label: 'Autre...', unit: '' },
];

export function MaintenanceScheduleForm({ assets, technicians, createAction }: MaintenanceScheduleFormProps) {
  const router = useRouter();
  const [triggerType, setTriggerType] = useState<'TIME_BASED' | 'THRESHOLD_BASED'>('TIME_BASED');
  const [selectedMetric, setSelectedMetric] = useState('');
  const [customMetric, setCustomMetric] = useState('');
  const [thresholdUnit, setThresholdUnit] = useState('');
  
  const [state, formAction, isPending] = useActionState(createAction, {
    success: false,
    errors: {},
  });

  useEffect(() => {
    if (state?.success) {
      router.push('/maintenance');
    }
  }, [state?.success, router]);

  // Quand on sélectionne un métrique prédéfini
  const handleMetricChange = (value: string) => {
    setSelectedMetric(value);
    const metric = PREDEFINED_METRICS.find(m => m.label === value);
    if (metric && metric.label !== 'Autre...') {
      setThresholdUnit(metric.unit);
    }
  };

  const maintenanceType = triggerType === 'TIME_BASED' ? 'PREVENTIVE' : 'PREDICTIVE';
  const actualMetric = selectedMetric === 'Autre...' ? customMetric : selectedMetric;

  return (
    <form action={formAction}>
      {/* Hidden fields */}
      <input type="hidden" name="triggerType" value={triggerType} />
      <input type="hidden" name="maintenanceType" value={maintenanceType} />
      {triggerType === 'THRESHOLD_BASED' && (
        <>
          <input type="hidden" name="thresholdMetric" value={actualMetric} />
          <input type="hidden" name="thresholdUnit" value={thresholdUnit} />
        </>
      )}

      <div className="space-y-6">
        {/* Type de déclenchement */}
        <Card>
          <h3 className="text-lg font-semibold mb-4">Type de maintenance</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setTriggerType('TIME_BASED')}
              className={cn(
                'p-4 rounded-lg border-2 text-left transition-all',
                triggerType === 'TIME_BASED'
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-neutral-200 hover:border-neutral-300'
              )}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center',
                  triggerType === 'TIME_BASED' ? 'bg-primary-100' : 'bg-neutral-100'
                )}>
                  <Clock size={20} className={triggerType === 'TIME_BASED' ? 'text-primary-600' : 'text-neutral-500'} />
                </div>
                <div>
                  <span className="font-semibold">📅 Préventive</span>
                  <span className="text-xs ml-2 px-2 py-0.5 bg-green-100 text-green-700 rounded">Temporelle</span>
                </div>
              </div>
              <p className="text-sm text-neutral-600">
                Maintenance planifiée selon un calendrier régulier (tous les X jours/semaines/mois)
              </p>
            </button>

            <button
              type="button"
              onClick={() => setTriggerType('THRESHOLD_BASED')}
              className={cn(
                'p-4 rounded-lg border-2 text-left transition-all',
                triggerType === 'THRESHOLD_BASED'
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-neutral-200 hover:border-neutral-300'
              )}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center',
                  triggerType === 'THRESHOLD_BASED' ? 'bg-primary-100' : 'bg-neutral-100'
                )}>
                  <Activity size={20} className={triggerType === 'THRESHOLD_BASED' ? 'text-primary-600' : 'text-neutral-500'} />
                </div>
                <div>
                  <span className="font-semibold">📊 Prédictive</span>
                  <span className="text-xs ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 rounded">Sur seuil</span>
                </div>
              </div>
              <p className="text-sm text-neutral-600">
                Maintenance déclenchée quand un compteur atteint un seuil (heures, km, cycles...)
              </p>
            </button>
          </div>
        </Card>

        {/* Informations de base */}
        <Card>
          <h3 className="text-lg font-semibold mb-4">Informations générales</h3>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="assetId" className="block text-sm font-medium text-neutral-700 mb-1">
                Équipement <span className="text-red-500">*</span>
              </label>
              <Select id="assetId" name="assetId" required>
                <option value="">Sélectionnez un équipement</option>
                {assets.map((asset) => (
                  <option key={asset.id} value={asset.id}>
                    {asset.name} ({asset.location})
                  </option>
                ))}
              </Select>
              {state?.errors?.assetId && (
                <p className="text-red-600 text-sm mt-1">{state.errors.assetId}</p>
              )}
            </div>

            <div>
              <label htmlFor="title" className="block text-sm font-medium text-neutral-700 mb-1">
                Titre <span className="text-red-500">*</span>
              </label>
              <Input
                id="title"
                name="title"
                type="text"
                placeholder={triggerType === 'TIME_BASED' 
                  ? "ex: Vérification mensuelle des filtres"
                  : "ex: Vidange moteur à 500h"
                }
                required
              />
              {state?.errors?.title && (
                <p className="text-red-600 text-sm mt-1">{state.errors.title}</p>
              )}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-neutral-700 mb-1">
                Description
              </label>
              <Textarea
                id="description"
                name="description"
                rows={3}
                placeholder="Détails de la maintenance..."
              />
            </div>
          </div>
        </Card>

        {/* Configuration selon le type */}
        <Card>
          <h3 className="text-lg font-semibold mb-4">
            {triggerType === 'TIME_BASED' ? '⏰ Planification temporelle' : '📊 Configuration du seuil'}
          </h3>

          {triggerType === 'TIME_BASED' ? (
            // TIME_BASED fields
            <div className="space-y-4">
              <div className={LAYOUT_STYLES.grid2}>
                <div>
                  <label htmlFor="frequency" className="block text-sm font-medium text-neutral-700 mb-1">
                    Fréquence <span className="text-red-500">*</span>
                  </label>
                  <Select id="frequency" name="frequency" required>
                    <option value="DAILY">Quotidien</option>
                    <option value="WEEKLY">Hebdomadaire</option>
                    <option value="MONTHLY">Mensuel</option>
                    <option value="QUARTERLY">Trimestriel</option>
                    <option value="YEARLY">Annuel</option>
                  </Select>
                  {state?.errors?.frequency && (
                    <p className="text-red-600 text-sm mt-1">{state.errors.frequency}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="intervalValue" className="block text-sm font-medium text-neutral-700 mb-1">
                    Intervalle <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="intervalValue"
                    name="intervalValue"
                    type="number"
                    min="1"
                    max="100"
                    defaultValue="1"
                    required
                  />
                  <p className="text-xs text-neutral-500 mt-1">
                    Ex: 2 avec "Mensuel" = tous les 2 mois
                  </p>
                </div>
              </div>

              <div>
                <label htmlFor="nextDueDate" className="block text-sm font-medium text-neutral-700 mb-1">
                  Prochaine date prévue <span className="text-red-500">*</span>
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
            </div>
          ) : (
            // THRESHOLD_BASED fields
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg mb-4">
                <Info size={18} className="mt-0.5 shrink-0 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-800">Maintenance prédictive</p>
                  <p className="text-sm mt-1 text-blue-700">
                    Définissez un compteur et son seuil. L'intervention sera déclenchée automatiquement 
                    quand la valeur actuelle atteindra le seuil défini.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Type de compteur <span className="text-red-500">*</span>
                </label>
                <Select 
                  value={selectedMetric} 
                  onChange={(e) => handleMetricChange(e.target.value)}
                >
                  <option value="">Sélectionnez un type</option>
                  {PREDEFINED_METRICS.map((m) => (
                    <option key={m.label} value={m.label}>{m.label}</option>
                  ))}
                </Select>
              </div>

              {selectedMetric === 'Autre...' && (
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Nom du compteur personnalisé <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={customMetric}
                    onChange={(e) => setCustomMetric(e.target.value)}
                    placeholder="Ex: Nombre de pièces produites"
                  />
                </div>
              )}

              <div className={LAYOUT_STYLES.grid2}>
                <div>
                  <label htmlFor="thresholdValue" className="block text-sm font-medium text-neutral-700 mb-1">
                    Seuil de déclenchement <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <Input
                      id="thresholdValue"
                      name="thresholdValue"
                      type="number"
                      min="1"
                      placeholder="500"
                      required={triggerType === 'THRESHOLD_BASED'}
                      className="flex-1"
                    />
                    <Input
                      value={thresholdUnit}
                      onChange={(e) => setThresholdUnit(e.target.value)}
                      placeholder="unité"
                      className="w-24"
                    />
                  </div>
                  <p className="text-xs text-neutral-500 mt-1">
                    Maintenance déclenchée quand le compteur atteint cette valeur
                  </p>
                  {state?.errors?.thresholdValue && (
                    <p className="text-red-600 text-sm mt-1">{state.errors.thresholdValue}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="currentValue" className="block text-sm font-medium text-neutral-700 mb-1">
                    Valeur actuelle
                  </label>
                  <Input
                    id="currentValue"
                    name="currentValue"
                    type="number"
                    min="0"
                    defaultValue="0"
                    placeholder="0"
                  />
                  <p className="text-xs text-neutral-500 mt-1">
                    Valeur actuelle du compteur (sera mise à jour régulièrement)
                  </p>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Options supplémentaires */}
        <Card>
          <h3 className="text-lg font-semibold mb-4">Options</h3>

          <div className={LAYOUT_STYLES.grid2}>
            <div>
              <label htmlFor="estimatedDuration" className="block text-sm font-medium text-neutral-700 mb-1">
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
              <label htmlFor="assignedToId" className="block text-sm font-medium text-neutral-700 mb-1">
                Technicien assigné
              </label>
              <Select id="assignedToId" name="assignedToId">
                <option value="">Non assigné</option>
                {technicians.map((tech) => (
                  <option key={tech.id} value={tech.id}>
                    {tech.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="mt-4">
            <label htmlFor="priority" className="block text-sm font-medium text-neutral-700 mb-1">
              Priorité
            </label>
            <Select id="priority" name="priority" defaultValue="LOW">
              <option value="LOW">Normale</option>
              <option value="HIGH">Haute</option>
            </Select>
          </div>
        </Card>

        {/* Erreurs et actions */}
        {state?.error && (
          <Alert variant="danger">{state.error}</Alert>
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
    </form>
  );
}
