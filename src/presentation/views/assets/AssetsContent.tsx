/**
 * Équipements - Contenu Client
 */

'use client';

import { useState } from 'react';
import {
  PageHeader,
  Card,
  Badge,
  Button,
  LinkButton,
  EmptyState,
  SearchInput,
  DataTable,
  StatsGrid,
  StatCard,
  StatusBadge,
  type Column,
} from '@/components';
import Link from 'next/link';
import { useSearch } from '@/presentation/hooks';
import type { AssetDTO } from '@/core/application/dto/AssetDTO';
import { LAYOUT_STYLES, cn } from '@/styles/design-system';

interface AssetsContentProps {
  assets: AssetDTO[];
}

export function AssetsContent({ assets }: AssetsContentProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  
  const { query, setQuery, filteredItems, clearSearch } = useSearch(assets, {
    searchKeys: ['name', 'serialNumber', 'location', 'manufacturer'],
  });

  // Stats
  const runningAssets = assets.filter(a => a.status === 'RUNNING').length;
  const stoppedAssets = assets.filter(a => a.status === 'STOPPED').length;
  const maintenanceAssets = assets.filter(a => a.status === 'MAINTENANCE').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Parc Équipements"
        description={`${assets.length} équipements • ${runningAssets} en service`}
        icon="🏭"
        actions={
          <div className={LAYOUT_STYLES.flexRow}>
            <LinkButton href="/hierarchy" variant="secondary" icon="🌳">
              Vue hiérarchie
            </LinkButton>
            <LinkButton href="/assets/new" variant="primary" icon="➕">
              Nouvel équipement
            </LinkButton>
          </div>
        }
      />

      {/* Stats */}
      <StatsGrid columns={4}>
        <StatCard
          label="Total"
          value={assets.length}
          icon={<span className="text-2xl">🏭</span>}
          color="neutral"
        />
        <StatCard
          label="En service"
          value={runningAssets}
          icon={<span className="text-2xl">✅</span>}
          color="success"
        />
        <StatCard
          label="À l'arrêt"
          value={stoppedAssets}
          icon={<span className="text-2xl">⏸️</span>}
          color="warning"
        />
        <StatCard
          label="En maintenance"
          value={maintenanceAssets}
          icon={<span className="text-2xl">🔧</span>}
          color="danger"
        />
      </StatsGrid>

      {/* Filters & View Toggle */}
      <div className={LAYOUT_STYLES.flexResponsiveBetween}>
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Rechercher un équipement..."
          className="w-full md:w-80"
        />
        <div className={LAYOUT_STYLES.flexRow}>
          <Button
            variant={viewMode === 'grid' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            Grille
          </Button>
          <Button
            variant={viewMode === 'table' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('table')}
          >
            Table
          </Button>
        </div>
      </div>

      {/* Content */}
      {filteredItems.length === 0 ? (
        <EmptyState
          icon={<span className="text-5xl">🏭</span>}
          title={query ? 'Aucun résultat' : 'Aucun équipement'}
          description={query ? `Aucun équipement trouvé pour "${query}"` : 'Ajoutez votre premier équipement'}
          action={
            query ? (
              <Button variant="secondary" onClick={clearSearch}>
                Effacer la recherche
              </Button>
            ) : (
              <LinkButton href="/assets/new" variant="primary">
                Ajouter un équipement
              </LinkButton>
            )
          }
        />
      ) : viewMode === 'grid' ? (
        <AssetsGrid assets={filteredItems} />
      ) : (
        <AssetsTable assets={filteredItems} />
      )}
    </div>
  );
}

// =============================================================================
// GRID VIEW
// =============================================================================

function AssetsGrid({ assets }: { assets: AssetDTO[] }) {
  return (
    <div className={LAYOUT_STYLES.gridResponsive3}>
      {assets.map(asset => (
        <AssetCard key={asset.id} asset={asset} />
      ))}
    </div>
  );
}

function AssetCard({ asset }: { asset: AssetDTO }) {
  const statusConfig: Record<string, { color: 'success' | 'warning' | 'danger'; label: string; icon: string }> = {
    RUNNING: { color: 'success', label: 'En service', icon: '✅' },
    STOPPED: { color: 'warning', label: 'À l\'arrêt', icon: '⏸️' },
    MAINTENANCE: { color: 'danger', label: 'Maintenance', icon: '🔧' },
  };
  
  const status = statusConfig[asset.status] || statusConfig.STOPPED;

  return (
    <Link href={`/assets/${asset.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
        <div className={cn(LAYOUT_STYLES.flexRow, 'justify-between items-start mb-3')}>
          <div className={cn(LAYOUT_STYLES.flexRow, 'gap-3')}>
            <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center text-xl">
              🏭
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900 truncate">{asset.name}</h3>
              <p className="text-sm text-neutral-500">{asset.serialNumber}</p>
            </div>
          </div>
          <Badge color={status.color} size="sm">
            {status.icon} {status.label}
          </Badge>
        </div>

        <div className="space-y-2 text-sm text-neutral-600">
          {asset.location && (
            <p className="flex items-center gap-2">
              <span>📍</span>
              <span>{asset.location}</span>
            </p>
          )}
          {asset.manufacturer && (
            <p className="flex items-center gap-2">
              <span>🏢</span>
              <span>{asset.manufacturer}</span>
            </p>
          )}
          {asset.assetType && (
            <p className="flex items-center gap-2">
              <span>📦</span>
              <span className="capitalize">{asset.assetType.toLowerCase()}</span>
            </p>
          )}
        </div>
      </Card>
    </Link>
  );
}

// =============================================================================
// TABLE VIEW
// =============================================================================

function AssetsTable({ assets }: { assets: AssetDTO[] }) {
  const columns: Column<AssetDTO>[] = [
    {
      key: 'name',
      header: 'Équipement',
      render: (asset) => (
        <Link href={`/assets/${asset.id}`} className="hover:text-primary-600">
          <div>
            <p className="font-medium text-neutral-900">{asset.name}</p>
            <p className="text-sm text-neutral-500">{asset.serialNumber}</p>
          </div>
        </Link>
      ),
    },
    {
      key: 'status',
      header: 'Statut',
      render: (asset) => {
        const statusConfig: Record<string, { color: 'success' | 'warning' | 'danger'; label: string }> = {
          RUNNING: { color: 'success', label: 'En service' },
          STOPPED: { color: 'warning', label: 'À l\'arrêt' },
          MAINTENANCE: { color: 'danger', label: 'Maintenance' },
        };
        const status = statusConfig[asset.status] || statusConfig.STOPPED;
        return <Badge color={status.color} size="sm">{status.label}</Badge>;
      },
    },
    {
      key: 'location',
      header: 'Emplacement',
      render: (asset) => asset.location || '-',
    },
    {
      key: 'manufacturer',
      header: 'Fabricant',
      render: (asset) => asset.manufacturer || '-',
    },
    {
      key: 'assetType',
      header: 'Type',
      render: (asset) => asset.assetType ? (
        <span className="capitalize">{asset.assetType.toLowerCase()}</span>
      ) : '-',
    },
    {
      key: 'actions',
      header: '',
      render: (asset) => (
        <LinkButton href={`/assets/${asset.id}`} variant="ghost" size="sm">
          Voir →
        </LinkButton>
      ),
    },
  ];

  return <DataTable columns={columns} data={assets} keyField="id" />;
}
