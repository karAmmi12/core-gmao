'use client';

import { useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { createPartAction } from '@/app/actions';
import { Button, Card, Input } from '@/components';
import { MainLayout } from '@/components/layouts/MainLayout';

const CATEGORIES = [
  { value: 'FILTRES', label: 'Filtres' },
  { value: 'JOINTS', label: 'Joints' },
  { value: 'ROULEMENTS', label: 'Roulements' },
  { value: 'COURROIES', label: 'Courroies' },
  { value: 'LUBRIFIANTS', label: 'Lubrifiants' },
  { value: 'VISSERIE', label: 'Visserie' },
  { value: 'ELECTRICITE', label: 'Électricité' },
  { value: 'HYDRAULIQUE', label: 'Hydraulique' },
  { value: 'PNEUMATIQUE', label: 'Pneumatique' },
  { value: 'AUTRE', label: 'Autre' },
];

export default function NewPartPage() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(createPartAction, null);

  // Rediriger vers la liste si succès
  useEffect(() => {
    if (state?.success && state.data?.id) {
      router.push(`/inventory/${state.data.id}`);
    }
  }, [state?.success, state?.data?.id, router]);

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/inventory">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Nouvelle pièce détachée</h1>
            <p className="text-gray-600">Ajouter une nouvelle pièce à l'inventaire</p>
          </div>
        </div>

        {/* Formulaire */}
        <Card>
          <form action={formAction} className="space-y-6">
            {/* Erreur globale */}
            {state?.error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">{state.error}</p>
              </div>
            )}

            {/* Informations de base */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Informations de base</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="reference" className="block text-sm font-medium mb-2">
                    Référence <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="reference"
                    name="reference"
                    placeholder="FLT-001"
                    required
                    disabled={isPending}
                  />
                </div>

                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-2">
                    Nom <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Filtre à huile hydraulique"
                    required
                    disabled={isPending}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Description détaillée de la pièce..."
                  disabled={isPending}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="category" className="block text-sm font-medium mb-2">
                    Catégorie
                  </label>
                  <select
                    id="category"
                    name="category"
                    className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    disabled={isPending}
                  >
                    <option value="">Sélectionner une catégorie</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="location" className="block text-sm font-medium mb-2">
                    Emplacement
                  </label>
                  <Input
                    id="location"
                    name="location"
                    placeholder="Étagère A-12"
                    disabled={isPending}
                  />
                </div>
              </div>
            </div>

            {/* Stock et prix */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Stock et prix</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="unitPrice" className="block text-sm font-medium mb-2">
                    Prix unitaire (€) <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="unitPrice"
                    name="unitPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="25.50"
                    required
                    disabled={isPending}
                  />
                </div>

                <div>
                  <label htmlFor="minStockLevel" className="block text-sm font-medium mb-2">
                    Stock minimum
                  </label>
                  <Input
                    id="minStockLevel"
                    name="minStockLevel"
                    type="number"
                    min="0"
                    placeholder="5"
                    defaultValue="5"
                    disabled={isPending}
                  />
                </div>
              </div>
            </div>

            {/* Fournisseur */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Fournisseur</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="supplier" className="block text-sm font-medium mb-2">
                    Nom du fournisseur
                  </label>
                  <Input
                    id="supplier"
                    name="supplier"
                    placeholder="Hydro Supply"
                    disabled={isPending}
                  />
                </div>

                <div>
                  <label htmlFor="supplierRef" className="block text-sm font-medium mb-2">
                    Référence fournisseur
                  </label>
                  <Input
                    id="supplierRef"
                    name="supplierRef"
                    placeholder="HS-FLT-2024"
                    disabled={isPending}
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Link href="/inventory">
                <Button type="button" variant="outline" disabled={isPending}>
                  Annuler
                </Button>
              </Link>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Création...' : 'Créer la pièce'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </MainLayout>
  );
}
