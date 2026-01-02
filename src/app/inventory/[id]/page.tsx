import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Package, AlertTriangle, DollarSign, Calendar, TrendingUp, TrendingDown } from 'lucide-react';
import DIContainer from '@/core/infrastructure/di/DIContainer';
import { Card, Badge, Button } from '@/components';
import { MainLayout } from '@/components/layouts/MainLayout';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PartDetailPage({ params }: PageProps) {
  const { id } = await params;
  
  const inventoryService = DIContainer.getInventoryService();
  const part = await inventoryService.getPartById(id);

  if (!part) {
    notFound();
  }

  const movements = await inventoryService.getPartMovements(id);

  // Calculer le statut du stock
  const stockStatus = part.quantityInStock === 0 
    ? { label: 'Rupture', variant: 'danger' as const }
    : part.quantityInStock <= part.minStockLevel
    ? { label: 'Stock bas', variant: 'warning' as const }
    : { label: 'OK', variant: 'success' as const };

  return (
    <MainLayout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/inventory">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{part.name}</h1>
            <p className="text-gray-600">Référence: {part.reference}</p>
          </div>
        </div>
        <Badge variant={stockStatus.variant}>{stockStatus.label}</Badge>
      </div>

      {/* Informations principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Stock actuel */}
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Stock actuel</p>
              <p className="text-3xl font-bold">{part.quantityInStock}</p>
              <p className="text-sm text-gray-500 mt-1">
                Min: {part.minStockLevel} unités
              </p>
            </div>
            <Package className="w-8 h-8 text-blue-500" />
          </div>
        </Card>

        {/* Prix unitaire */}
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Prix unitaire</p>
              <p className="text-3xl font-bold">{part.unitPrice.toFixed(2)} €</p>
              <p className="text-sm text-gray-500 mt-1">
                Valeur stock: {(part.quantityInStock * part.unitPrice).toFixed(2)} €
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-green-500" />
          </div>
        </Card>

        {/* Fournisseur */}
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Fournisseur</p>
              <p className="text-xl font-semibold">{part.supplier || 'Non défini'}</p>
              {part.supplierRef && (
                <p className="text-sm text-gray-500 mt-1">
                  Réf: {part.supplierRef}
                </p>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Détails de la pièce */}
      <Card>
        <h2 className="text-xl font-bold mb-4">Détails</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Catégorie</p>
            <p className="font-medium">{part.category || 'Non catégorisée'}</p>
          </div>
          {part.location && (
            <div>
              <p className="text-sm text-gray-600">Emplacement</p>
              <p className="font-medium">{part.location}</p>
            </div>
          )}
          {part.description && (
            <div className="md:col-span-2">
              <p className="text-sm text-gray-600">Description</p>
              <p className="font-medium">{part.description}</p>
            </div>
          )}
        </div>
      </Card>

      {/* Historique des mouvements */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Historique des mouvements</h2>
          <Link href={`/inventory/${id}/movement`}>
            <Button size="sm">Nouveau mouvement</Button>
          </Link>
        </div>

        {movements.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Aucun mouvement enregistré</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Type</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold">Quantité</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Raison</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold">Stock après</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {movements.map((movement) => {
                  const isIn = movement.type === 'IN';
                  return (
                    <tr key={movement.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {new Date(movement.createdAt).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {isIn ? (
                            <>
                              <TrendingUp className="w-4 h-4 text-green-500" />
                              <Badge variant="success">Entrée</Badge>
                            </>
                          ) : (
                            <>
                              <TrendingDown className="w-4 h-4 text-red-500" />
                              <Badge variant="danger">Sortie</Badge>
                            </>
                          )}
                        </div>
                      </td>
                      <td className={`px-4 py-3 text-right text-sm font-medium ${
                        isIn ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {isIn ? '+' : '-'}{movement.quantity}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {movement.reason || '-'}
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-semibold">
                        {movement.stockAfter ?? '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Alerte stock bas */}
      {part.quantityInStock <= part.minStockLevel && (
        <Card className="border-orange-500 bg-orange-50">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5" />
            <div>
              <h3 className="font-semibold text-orange-900">
                {part.quantityInStock === 0 ? 'Rupture de stock' : 'Stock faible'}
              </h3>
              <p className="text-sm text-orange-800 mt-1">
                {part.quantityInStock === 0 
                  ? 'Cette pièce est en rupture de stock. Veuillez commander auprès du fournisseur.'
                  : `Le stock est en dessous du minimum recommandé (${part.minStockLevel} unités).`
                }
              </p>
            </div>
          </div>
        </Card>
      )}
      </div>
    </MainLayout>
  );
}
