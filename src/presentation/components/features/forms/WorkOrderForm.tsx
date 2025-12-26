'use client';

import { createWorkOrderAction } from '@/app/actions';
import { Card, CardHeader } from '@/presentation/components/ui/Card';
import { Input, Select } from '@/presentation/components/ui/Input';
import { Button } from '@/presentation/components/ui/Button';
import { Activity, Plus, Trash2, Package } from 'lucide-react';
import { AssetDTO } from '@/core/application/dto/AssetDTO';
import { TechnicianDTO } from '@/core/application/dto/TechnicianDTO';
import { PartDTO } from '@/core/application/dto/PartDTO';
import { useActionState, useState, useEffect } from 'react';

interface WorkOrderFormProps {
  assets: AssetDTO[];
  technicians: TechnicianDTO[];
  parts: PartDTO[];
}

interface SelectedPart {
  partId: string;
  quantity: number;
  unitPrice: number;
}

export const WorkOrderForm = ({ assets, technicians, parts }: WorkOrderFormProps) => {
  const [state, formAction, isPending] = useActionState(createWorkOrderAction, null);
  const [selectedParts, setSelectedParts] = useState<SelectedPart[]>([]);

  // Réinitialiser les pièces après succès
  useEffect(() => {
    if (state?.success) {
      setSelectedParts([]);
    }
  }, [state?.success]);

  // Date minimale: aujourd'hui
  const today = new Date().toISOString().split('T')[0];

  const addPart = () => {
    setSelectedParts([...selectedParts, { partId: '', quantity: 1, unitPrice: 0 }]);
  };

  const removePart = (index: number) => {
    setSelectedParts(selectedParts.filter((_, i) => i !== index));
  };

  const updatePart = (index: number, field: keyof SelectedPart, value: string | number) => {
    const updated = [...selectedParts];
    if (field === 'partId') {
      updated[index].partId = value as string;
      // Trouver la pièce et pré-remplir le prix
      const part = parts.find(p => p.id === value);
      if (part) {
        updated[index].unitPrice = part.unitPrice;
      }
    } else {
      updated[index][field] = value as any;
    }
    setSelectedParts(updated);
  };

  const handleSubmit = (formData: FormData) => {
    // Ajouter les pièces au formData
    if (selectedParts.length > 0) {
      const validParts = selectedParts.filter(p => p.partId && p.quantity > 0);
      formData.append('parts', JSON.stringify(validParts));
    }
    formAction(formData);
  };

  const totalMaterialCost = selectedParts.reduce((sum, p) => sum + (p.quantity * p.unitPrice), 0);

  return (
    <Card>
      <CardHeader 
        icon={<Activity className="text-primary-600" size={20} />} 
        title="Nouvelle Intervention" 
      />

      <form action={handleSubmit} className="space-y-4">
        {/* Titre */}
        <Input
          label="Titre *"
          name="title"
          placeholder="Ex: Remplacement courroie"
          error={state?.errors?.title?.[0]}
        />

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Description
          </label>
          <textarea
            name="description"
            rows={3}
            placeholder="Détails de l'intervention..."
            className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg
                     focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                     disabled:bg-neutral-100 disabled:cursor-not-allowed"
          />
        </div>

        {/* Priorité */}
        <Select label="Priorité *" name="priority" error={state?.errors?.priority?.[0]}>
          <option value="LOW">Basse</option>
          <option value="HIGH">Haute</option>
        </Select>

        {/* Équipement */}
        <Select 
          label="Équipement concerné *" 
          name="assetId" 
          error={state?.errors?.assetId?.[0]}
        >
          <option value="">-- Sélectionner un équipement --</option>
          {assets.map((asset) => (
            <option key={asset.id} value={asset.id}>
              {asset.name} ({asset.serialNumber})
            </option>
          ))}
        </Select>

        {/* Section Planification */}
        <div className="border-t border-neutral-200 pt-4 mt-6">
          <h3 className="text-sm font-semibold text-neutral-700 mb-3">
            📅 Planification (optionnel)
          </h3>

          {/* Technicien */}
          <Select 
            label="Technicien assigné" 
            name="assignedToId"
            error={state?.errors?.assignedToId?.[0]}
          >
            <option value="">-- Non assigné --</option>
            {technicians
              .filter(tech => tech.isActive)
              .map((tech) => (
                <option key={tech.id} value={tech.id}>
                  {tech.fullName} ({tech.skills.join(', ')})
                </option>
              ))}
          </Select>

          <div className="grid grid-cols-2 gap-4 mt-4">
            {/* Date planifiée */}
            <Input
              label="Date planifiée"
              name="scheduledAt"
              type="datetime-local"
              min={today}
              error={state?.errors?.scheduledAt?.[0]}
            />

            {/* Durée estimée */}
            <Input
              label="Durée estimée (heures)"
              name="estimatedDuration"
              type="number"
              min="0.5"
              step="0.5"
              placeholder="Ex: 2.5"
              error={state?.errors?.estimatedDuration?.[0]}
            />
          </div>
        </div>

        {/* Section Pièces */}
        <div className="border-t border-neutral-200 pt-4 mt-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-neutral-700 flex items-center gap-2">
              <Package size={16} />
              Pièces détachées (optionnel)
            </h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addPart}
              disabled={isPending}
            >
              <Plus size={16} className="mr-1" />
              Ajouter une pièce
            </Button>
          </div>

          {selectedParts.length > 0 && (
            <div className="space-y-3">
              {selectedParts.map((selectedPart, index) => {
                const part = parts.find(p => p.id === selectedPart.partId);
                const hasStock = part && part.quantityInStock >= selectedPart.quantity;
                const subtotal = selectedPart.quantity * selectedPart.unitPrice;

                return (
                  <div key={index} className="flex gap-2 items-start p-3 bg-neutral-50 rounded-lg">
                    <div className="flex-1 grid grid-cols-3 gap-2">
                      <select
                        value={selectedPart.partId}
                        onChange={(e) => updatePart(index, 'partId', e.target.value)}
                        className="px-3 py-2 border border-neutral-300 rounded-lg text-sm"
                        disabled={isPending}
                      >
                        <option value="">-- Sélectionner --</option>
                        {parts.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.reference} - {p.name} (Stock: {p.quantityInStock})
                          </option>
                        ))}
                      </select>

                      <input
                        type="number"
                        min="1"
                        value={selectedPart.quantity}
                        onChange={(e) => updatePart(index, 'quantity', parseInt(e.target.value) || 1)}
                        placeholder="Qté"
                        className="px-3 py-2 border border-neutral-300 rounded-lg text-sm"
                        disabled={isPending}
                      />

                      <div>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={selectedPart.unitPrice}
                          onChange={(e) => updatePart(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                          placeholder="Prix"
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
        </div>

        {/* Messages d'erreur/succès */}
        {state?.error && !state.errors && (
          <div className="bg-danger-50 border border-danger-200 rounded-lg p-3">
            <p className="text-danger-700 text-sm">{state.error}</p>
          </div>
        )}

        {state?.success && (
          <div className="bg-success-50 border border-success-200 rounded-lg p-3">
            <p className="text-success-700 text-sm">✓ Intervention créée avec succès !</p>
          </div>
        )}

        <Button type="submit" isLoading={isPending} className="w-full">
          ➕ Créer l'intervention
        </Button>
      </form>
    </Card>
  );
};
