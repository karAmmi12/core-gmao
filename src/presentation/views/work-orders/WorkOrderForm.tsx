'use client';

import { useActionState, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Calendar, Clock, Info } from 'lucide-react';
import Link from 'next/link';
import { createWorkOrderAction } from '@/app/actions';
import {
  Card,
  Input,
  Select,
  Button,
  Alert,
  Badge,
  PageHeader,
  Textarea
} from '@/components';
import { LAYOUT_STYLES } from '@/styles/design-system';

// ============================================================================
// Types
// ============================================================================

interface WorkOrderFormProps {
  assets: { id: string; name: string; serialNumber: string }[];
  technicians: { id: string; name: string; skills: string[] }[];
  parts: { id: string; reference: string; name: string; quantityInStock: number; unitPrice: number }[];
  priorities: { code: string; label: string }[];
  userRole: string;
}

interface SelectedPart {
  partId: string;
  quantity: number;
  unitPrice: number;
}

// Types disponibles pour création manuelle
// PREVENTIVE et PREDICTIVE sont générées automatiquement via la page "Maintenance Planifiée"
const MAINTENANCE_TYPES = [
  { 
    code: 'CORRECTIVE', 
    label: 'Corrective', 
    description: 'Suite à une panne, défaillance ou dysfonctionnement constaté',
    icon: '🔧'
  },
  { 
    code: 'CONDITIONAL', 
    label: 'Conditionnelle', 
    description: 'Suite à une inspection ou observation révélant un besoin d\'intervention',
    icon: '👁️'
  },
];

// ============================================================================
// Main Component
// ============================================================================

export default function WorkOrderForm({ assets, technicians, parts, priorities, userRole }: WorkOrderFormProps) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(createWorkOrderAction, null);
  const canAssign = userRole === 'MANAGER' || userRole === 'ADMIN';
  const [selectedParts, setSelectedParts] = useState<SelectedPart[]>([]);
  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [priority, setPriority] = useState('LOW');
  const [maintenanceType, setMaintenanceType] = useState('CORRECTIVE');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');

  // Redirect on success
  if (state?.success) {
    router.push('/work-orders');
    return null;
  }

  // Add part to selection
  const addPart = () => {
    setSelectedParts([...selectedParts, { partId: '', quantity: 1, unitPrice: 0 }]);
  };

  // Update part in selection
  const updatePart = (index: number, field: keyof SelectedPart, value: string | number) => {
    const updated = [...selectedParts];
    if (field === 'partId') {
      const part = parts.find(p => p.id === value);
      updated[index] = {
        ...updated[index],
        partId: value as string,
        unitPrice: part?.unitPrice || 0
      };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setSelectedParts(updated);
  };

  // Remove part from selection
  const removePart = (index: number) => {
    setSelectedParts(selectedParts.filter((_, i) => i !== index));
  };

  // Calculate total material cost
  const totalMaterialCost = selectedParts.reduce((sum, sp) => {
    return sum + (sp.quantity * sp.unitPrice);
  }, 0);

  return (
    <div className="min-h-screen bg-neutral-50">
      <PageHeader
        icon="🔧"
        title="Nouvelle intervention"
        description="Créer un ordre de travail"
      />

      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <form action={formAction} className="space-y-6">
          {/* Hidden input pour les pièces sélectionnées */}
          <input 
            type="hidden" 
            name="parts" 
            value={JSON.stringify(selectedParts.filter(p => p.partId))} 
          />

          {/* Basic Info */}
          <Card>
            <h3 className="text-lg font-semibold mb-4">Informations générales</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Titre de l'intervention <span className="text-red-500">*</span>
                </label>
                <Input
                  name="title"
                  placeholder="Ex: Remplacement du filtre à air"
                  required
                  disabled={isPending}
                  error={state?.errors?.title?.[0]}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Description
                </label>
                <Textarea
                  name="description"
                  placeholder="Décrivez les travaux à effectuer..."
                  rows={4}
                  disabled={isPending}
                />
              </div>

              <div className={LAYOUT_STYLES.grid2}>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Équipement <span className="text-red-500">*</span>
                  </label>
                  <Select
                    name="assetId"
                    value={selectedAssetId}
                    onChange={(e) => setSelectedAssetId(e.target.value)}
                    required
                    disabled={isPending}
                  >
                    <option value="">-- Sélectionner un équipement --</option>
                    {assets.map((asset) => (
                      <option key={asset.id} value={asset.id}>
                        {asset.name} ({asset.serialNumber})
                      </option>
                    ))}
                  </Select>
                  {state?.errors?.assetId && (
                    <p className="text-xs text-red-600 mt-1">{state.errors.assetId[0]}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Type d'intervention <span className="text-red-500">*</span>
                  </label>
                  <Select
                    name="type"
                    value={maintenanceType}
                    onChange={(e) => setMaintenanceType(e.target.value)}
                    required
                    disabled={isPending}
                  >
                    {MAINTENANCE_TYPES.map((t) => (
                      <option key={t.code} value={t.code}>
                        {t.icon} {t.label}
                      </option>
                    ))}
                  </Select>
                  <p className="text-xs text-neutral-500 mt-1">
                    {MAINTENANCE_TYPES.find(t => t.code === maintenanceType)?.description}
                  </p>
                </div>
              </div>

              {/* Info box pour la maintenance préventive */}
              <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <Info size={18} className="text-blue-600 mt-0.5 shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium">Besoin de planifier une maintenance préventive ?</p>
                  <p className="text-blue-600 mt-0.5">
                    Les interventions préventives et prédictives sont générées automatiquement.{' '}
                    <Link href="/maintenance" className="underline font-medium hover:text-blue-800">
                      Accéder à la planification →
                    </Link>
                  </p>
                </div>
              </div>

              <div className={LAYOUT_STYLES.grid2}>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Priorité <span className="text-red-500">*</span>
                  </label>
                  <Select
                    name="priority"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    required
                    disabled={isPending}
                  >
                    {priorities.map((p) => (
                      <option key={p.code} value={p.code}>
                        {p.label}
                      </option>
                    ))}
                  </Select>
                </div>
                <div></div>
              </div>
            </div>
          </Card>

          {/* Scheduling - Only for Managers/Admins */}
          {canAssign && (
            <Card>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Calendar size={20} className="text-neutral-600" />
                Planification & Assignation
              </h3>

              <div className={LAYOUT_STYLES.grid3}>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Technicien assigné
                  </label>
                  <Select name="assignedToId" disabled={isPending}>
                    <option value="">-- Non assigné --</option>
                    {technicians.map((tech) => (
                      <option key={tech.id} value={tech.id}>
                        {tech.name}
                      </option>
                    ))}
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Date prévue
                  </label>
                  <Input
                    type="date"
                    name="scheduledDate"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    disabled={isPending}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Heure prévue
                  </label>
                  <Input
                    type="time"
                    name="scheduledTime"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    disabled={isPending}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Durée estimée (minutes)
                  </label>
                  <Input
                    type="number"
                    name="estimatedDuration"
                    min="1"
                    placeholder="60"
                    disabled={isPending}
                  />
                </div>
              </div>
            </Card>
          )}

          {/* Info box pour les techniciens */}
          {!canAssign && (
            <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <Info size={20} className="text-amber-600 mt-0.5 shrink-0" />
              <div className="text-sm text-amber-800">
                <p className="font-medium">📋 Demande d'intervention soumise</p>
                <p className="text-amber-700 mt-1">
                  Votre demande sera examinée par un responsable qui validera la priorité, 
                  assignera un technicien et planifiera l'intervention selon les disponibilités.
                </p>
              </div>
            </div>
          )}

          {/* Parts Selection */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Pièces nécessaires</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addPart}
                disabled={isPending}
                icon={<Plus size={16} />}
              >
                Ajouter une pièce
              </Button>
            </div>

            {selectedParts.length === 0 ? (
              <p className="text-sm text-neutral-500 text-center py-8">
                Aucune pièce sélectionnée
              </p>
            ) : (
              <div className="space-y-3">
                {selectedParts.map((selectedPart, index) => {
                  const part = parts.find(p => p.id === selectedPart.partId);
                  const subtotal = selectedPart.quantity * selectedPart.unitPrice;
                  const hasStock = part && part.quantityInStock >= selectedPart.quantity;

                  return (
                    <div key={index} className="flex gap-2 items-start p-3 bg-neutral-50 rounded-lg">
                      <div className="flex-1 grid grid-cols-3 gap-2">
                        <div>
                          <select
                            name={`parts[${index}].partId`}
                            value={selectedPart.partId}
                            onChange={(e) => updatePart(index, 'partId', e.target.value)}
                            className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm"
                            disabled={isPending}
                          >
                            <option value="">-- Sélectionner --</option>
                            {parts.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.reference} - {p.name}
                              </option>
                            ))}
                          </select>
                          {part && (
                            <p className="text-xs text-neutral-500 mt-1">
                              Stock: {part.quantityInStock}
                            </p>
                          )}
                        </div>

                        <div>
                          <input
                            type="number"
                            name={`parts[${index}].quantity`}
                            min="1"
                            value={selectedPart.quantity}
                            onChange={(e) => updatePart(index, 'quantity', parseInt(e.target.value) || 1)}
                            placeholder="Qté"
                            className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm"
                            disabled={isPending}
                          />
                        </div>

                        <div>
                          <input
                            type="number"
                            name={`parts[${index}].unitPrice`}
                            min="0"
                            step="0.01"
                            value={selectedPart.unitPrice}
                            onChange={(e) => updatePart(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                            placeholder="Prix unitaire"
                            className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm"
                            disabled={isPending}
                          />
                          {selectedPart.partId && (
                            <p className="text-xs text-neutral-600 mt-1">
                              Sous-total: {subtotal.toFixed(2)} €
                              {!hasStock && <span className="text-red-600 ml-2">⚠️ Stock insuffisant</span>}
                            </p>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => removePart(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                        disabled={isPending}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  );
                })}

                {totalMaterialCost > 0 && (
                  <div className="text-right text-sm font-semibold text-neutral-700 pt-2 border-t">
                    Coût total matériel: {totalMaterialCost.toFixed(2)} €
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Errors & Success */}
          {state?.error && !state.errors && (
            <Alert variant="danger">{state.error}</Alert>
          )}

          {/* Actions */}
          <div className={LAYOUT_STYLES.flexRow}>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isPending}
            >
              Annuler
            </Button>
            <Button type="submit" loading={isPending}>
              <Plus size={16} className="mr-2" />
              Créer l'intervention
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
