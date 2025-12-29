'use client';

import { useActionState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, TrendingUp, TrendingDown } from 'lucide-react';
import { addStockMovementAction } from '@/app/actions';
import { Button } from '@/components';
import { Card } from '@/components';
import { Input } from '@/components';
import { useState } from 'react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function StockMovementPage({ params }: PageProps) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(addStockMovementAction, null);
  const [movementType, setMovementType] = useState<'IN' | 'OUT'>('IN');
  const [partId, setPartId] = useState<string>('');

  // Charger l'ID de la pièce
  params.then(({ id }) => {
    if (!partId) setPartId(id);
  });

  // Rediriger vers la page de détails si succès
  if (state?.success) {
    router.push(`/inventory/${partId}`);
  }

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href={`/inventory/${partId}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Mouvement de stock</h1>
            <p className="text-gray-600">Ajouter ou retirer du stock</p>
          </div>
        </div>

        {/* Formulaire */}
        <Card>
          <form action={formAction} className="space-y-6">
            <input type="hidden" name="partId" value={partId} />

            {/* Erreur globale */}
            {state?.error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">{state.error}</p>
              </div>
            )}

            {/* Type de mouvement */}
            <div className="space-y-3">
              <label className="block text-sm font-medium">
                Type de mouvement <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setMovementType('IN')}
                  disabled={isPending}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    movementType === 'IN'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-green-300'
                  }`}
                >
                  <div className="flex items-center justify-center gap-3">
                    <TrendingUp className={`w-6 h-6 ${movementType === 'IN' ? 'text-green-600' : 'text-gray-400'}`} />
                    <div className="text-left">
                      <div className={`font-semibold ${movementType === 'IN' ? 'text-green-900' : 'text-gray-700'}`}>
                        Entrée
                      </div>
                      <div className="text-xs text-gray-500">Réception, retour</div>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setMovementType('OUT')}
                  disabled={isPending}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    movementType === 'OUT'
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 hover:border-red-300'
                  }`}
                >
                  <div className="flex items-center justify-center gap-3">
                    <TrendingDown className={`w-6 h-6 ${movementType === 'OUT' ? 'text-red-600' : 'text-gray-400'}`} />
                    <div className="text-left">
                      <div className={`font-semibold ${movementType === 'OUT' ? 'text-red-900' : 'text-gray-700'}`}>
                        Sortie
                      </div>
                      <div className="text-xs text-gray-500">Utilisation, perte</div>
                    </div>
                  </div>
                </button>
              </div>
              <input type="hidden" name="type" value={movementType} />
            </div>

            {/* Quantité */}
            <div>
              <label htmlFor="quantity" className="block text-sm font-medium mb-2">
                Quantité <span className="text-red-500">*</span>
              </label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                min="1"
                placeholder="10"
                required
                disabled={isPending}
              />
            </div>

            {/* Raison */}
            <div>
              <label htmlFor="reason" className="block text-sm font-medium mb-2">
                Raison
              </label>
              <textarea
                id="reason"
                name="reason"
                rows={3}
                className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder={
                  movementType === 'IN'
                    ? 'Ex: Réception commande fournisseur'
                    : 'Ex: Utilisé pour intervention #1234'
                }
                disabled={isPending}
              />
            </div>

            {/* Référence */}
            <div>
              <label htmlFor="reference" className="block text-sm font-medium mb-2">
                Référence (bon de commande, intervention, etc.)
              </label>
              <Input
                id="reference"
                name="reference"
                placeholder="BC-2024-001"
                disabled={isPending}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Link href={`/inventory/${partId}`}>
                <Button type="button" variant="outline" disabled={isPending}>
                  Annuler
                </Button>
              </Link>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Enregistrement...' : 'Enregistrer le mouvement'}
              </Button>
            </div>
          </form>
        </Card>

        {/* Aide */}
        <Card className="bg-blue-50 border-blue-200">
          <div className="flex gap-3">
            <div className="shrink-0">
              <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                i
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <p className="font-semibold text-blue-900">Information</p>
              <ul className="list-disc list-inside space-y-1 text-blue-800">
                <li><strong>Entrée</strong> : Pour ajouter du stock (réception, retour de prêt, etc.)</li>
                <li><strong>Sortie</strong> : Pour retirer du stock (utilisation sur intervention, perte, rebut, etc.)</li>
                <li>Les mouvements sont enregistrés avec la date et l'heure actuelles</li>
                <li>Le stock sera mis à jour automatiquement après validation</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
