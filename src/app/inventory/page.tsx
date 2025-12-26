import { InventoryService } from '@/core/application/services/InventoryService';
import { MainLayout } from '@/presentation/components/layouts/MainLayout';
import { Package, AlertTriangle, TrendingUp, DollarSign } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function InventoryPage() {
  const service = new InventoryService();
  
  const [parts, stats] = await Promise.all([
    service.getAllParts(),
    service.getInventoryStats(),
  ]);

  return (
    <MainLayout>
      <div className="container-page">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900">📦 Inventaire</h1>
          <p className="text-neutral-600 mt-2">
            Gestion du stock de pièces détachées
          </p>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                <Package className="text-primary-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-neutral-500">Total pièces</p>
                <p className="text-2xl font-bold text-neutral-900">{stats.totalParts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-warning-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="text-warning-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-neutral-500">Stock bas</p>
                <p className="text-2xl font-bold text-warning-700">{stats.lowStockParts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-danger-100 rounded-full flex items-center justify-center">
                <TrendingUp className="text-danger-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-neutral-500">Rupture</p>
                <p className="text-2xl font-bold text-danger-700">{stats.outOfStockParts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-success-100 rounded-full flex items-center justify-center">
                <DollarSign className="text-success-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-neutral-500">Valeur stock</p>
                <p className="text-2xl font-bold text-neutral-900">{stats.totalValue.toFixed(2)}€</p>
              </div>
            </div>
          </div>
        </div>

        {/* Table des pièces */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
          <div className="p-6 border-b border-neutral-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-neutral-900">Liste des pièces</h2>
            <Link
              href="/inventory/new"
              className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg font-semibold transition-colors"
            >
              ➕ Nouvelle pièce
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-600 uppercase">Référence</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-600 uppercase">Nom</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-600 uppercase">Catégorie</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-neutral-600 uppercase">Prix</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-neutral-600 uppercase">Stock</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-neutral-600 uppercase">Min</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-neutral-600 uppercase">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {parts.map((part) => (
                  <tr key={part.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-6 py-4">
                      <Link
                        href={`/inventory/${part.id}`}
                        className="font-mono text-sm font-semibold text-primary-600 hover:text-primary-500"
                      >
                        {part.reference}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-neutral-900">{part.name}</p>
                        {part.description && (
                          <p className="text-sm text-neutral-500">{part.description}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {part.category && (
                        <span className="px-2 py-1 bg-neutral-100 text-neutral-700 rounded text-xs font-medium">
                          {part.category}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-neutral-900">
                      {part.unitPrice.toFixed(2)}€
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span
                        className={`font-bold ${
                          !part.hasStock
                            ? 'text-danger-600'
                            : part.isLowStock
                            ? 'text-warning-600'
                            : 'text-neutral-900'
                        }`}
                      >
                        {part.quantityInStock}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-neutral-500">
                      {part.minStockLevel}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {!part.hasStock ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-danger-100 text-danger-700">
                          ❌ Rupture
                        </span>
                      ) : part.isLowStock ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-warning-100 text-warning-700">
                          ⚠️ Stock bas
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-success-100 text-success-700">
                          ✓ OK
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {parts.length === 0 && (
            <div className="text-center py-12">
              <Package className="mx-auto text-neutral-300" size={64} />
              <p className="text-neutral-500 mt-4">Aucune pièce en stock</p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
