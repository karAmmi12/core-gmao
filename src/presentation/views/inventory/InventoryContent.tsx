/**
 * Inventaire - Contenu Client
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  PageHeader,
  Card,
  Badge,
  Button,
  LinkButton,
  EmptyState,
  SearchInput,
  FilterSelect,
  FiltersBar,
  DataTable,
  StatsGrid,
  StatCard,
  ProgressBar,
  type Column,
} from '@/components';
import { useTable } from '@/presentation/hooks';
import { STATUS_CONFIG, formatCurrency, cn, LAYOUT_STYLES } from '@/styles/design-system';
import type { PartDTO, PartStatsDTO } from '@/core/application/dto/PartDTO';
import type { ConfigurationItemDTO } from '@/core/application/dto/ConfigurationDTO';
import { ExportService } from '@/core/application/services/ExportService';

interface InventoryContentProps {
  parts: PartDTO[];
  stats: PartStatsDTO;
  partCategories: ConfigurationItemDTO[];
}

export function InventoryContent({ parts, stats, partCategories }: InventoryContentProps) {
  const [statusFilter, setStatusFilter] = useState<string>('');

  const {
    data,
    searchQuery,
    setSearchQuery,
    clearSearch,
    filters,
    setFilter,
    clearAllFilters,
    totalItems,
    currentPage,
    totalPages,
    goToPage,
    hasNextPage,
    hasPreviousPage,
    nextPage,
    previousPage,
  } = useTable(parts, {
    searchKeys: ['name', 'reference', 'category'],
    pageSize: 15,
  });

  // Apply status filter manually (complex logic)
  const filteredData = statusFilter
    ? data.filter(p => {
        if (statusFilter === 'LOW') return p.isLowStock && p.hasStock;
        if (statusFilter === 'OUT') return !p.hasStock;
        if (statusFilter === 'OK') return !p.isLowStock && p.hasStock;
        return true;
      })
    : data;

  // Export handlers
  const handleExportPDF = () => {
    ExportService.exportInventoryToPDF(parts);
  };

  const handleExportExcel = () => {
    ExportService.exportInventoryToExcel(parts);
  };

  const handleExportCSV = () => {
    ExportService.exportInventoryToCSV(parts);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventaire"
        description="Gestion du stock de pièces détachées"
        icon="📦"
        actions={
          <div className="flex gap-2">
            <Button variant="ghost" onClick={handleExportCSV} icon="📋">
              CSV
            </Button>
            <Button variant="secondary" onClick={handleExportPDF} icon="📄">
              PDF
            </Button>
            <Button variant="secondary" onClick={handleExportExcel} icon="📊">
              Excel
            </Button>
            <LinkButton href="/inventory/new" variant="primary" icon="➕">
              Nouvelle pièce
            </LinkButton>
          </div>
        }
      />

      {/* Stats */}
      <StatsGrid columns={5}>
        <StatCard
          label="Total pièces"
          value={stats.totalParts}
          icon={<span className="text-2xl">📦</span>}
          color="primary"
        />
        <StatCard
          label="Unités en stock"
          value={stats.totalUnits}
          icon={<span className="text-2xl">🔢</span>}
          color="neutral"
        />
        <StatCard
          label="Stock bas"
          value={stats.lowStockParts}
          icon={<span className="text-2xl">⚠️</span>}
          color="warning"
        />
        <StatCard
          label="En rupture"
          value={stats.outOfStockParts}
          icon={<span className="text-2xl">❌</span>}
          color="danger"
        />
        <StatCard
          label="Valeur totale"
          value={formatCurrency(stats.totalValue)}
          icon={<span className="text-2xl">💰</span>}
          color="success"
        />
      </StatsGrid>

      {/* Filters */}
      <FiltersBar onReset={() => { clearAllFilters(); setStatusFilter(''); clearSearch(); }}>
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Rechercher une pièce..."
          className="w-64"
        />
        <FilterSelect
          label="Catégorie"
          value={filters.category as string}
          onChange={(v) => setFilter('category', v)}
          options={partCategories.map(c => ({ value: c.label, label: c.label }))}
        />
        <FilterSelect
          label="Statut"
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: 'OK', label: '✅ En stock' },
            { value: 'LOW', label: '⚠️ Stock bas' },
            { value: 'OUT', label: '❌ Rupture' },
          ]}
        />
      </FiltersBar>

      {/* Table */}
      <Card padding="none">
        <PartsTable parts={filteredData} />
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-200">
            <span className="text-sm text-neutral-500">
              Page {currentPage} sur {totalPages} • {totalItems} pièces
            </span>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={previousPage}
                disabled={!hasPreviousPage}
              >
                ← Précédent
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={nextPage}
                disabled={!hasNextPage}
              >
                Suivant →
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

// =============================================================================
// PARTS TABLE
// =============================================================================

function PartsTable({ parts }: { parts: PartDTO[] }) {
  const columns: Column<PartDTO>[] = [
    {
      key: 'reference',
      header: 'Référence',
      render: (part) => (
        <Link
          href={`/inventory/${part.id}`}
          className="font-mono text-sm font-semibold text-primary-600 hover:text-primary-500"
        >
          {part.reference}
        </Link>
      ),
    },
    {
      key: 'name',
      header: 'Désignation',
      render: (part) => (
        <div>
          <p className="font-medium text-neutral-900">{part.name}</p>
          {part.description && (
            <p className="text-xs text-neutral-500 truncate max-w-xs">{part.description}</p>
          )}
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Catégorie',
      render: (part) => part.category ? (
        <Badge color="neutral" size="sm">{part.category}</Badge>
      ) : '-',
    },
    {
      key: 'unitPrice',
      header: 'Prix unitaire',
      align: 'right',
      render: (part) => (
        <span className="font-medium">{formatCurrency(part.unitPrice)}</span>
      ),
    },
    {
      key: 'quantityInStock',
      header: 'Stock',
      align: 'right',
      render: (part) => (
        <div className="flex flex-col items-end gap-1">
          <span className={cn(
            'font-bold',
            !part.hasStock && 'text-danger-600',
            part.isLowStock && part.hasStock && 'text-warning-600',
            !part.isLowStock && part.hasStock && 'text-neutral-900'
          )}>
            {part.quantityInStock}
          </span>
          <span className="text-xs text-neutral-400">min: {part.minStockLevel}</span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Statut',
      align: 'center',
      render: (part) => {
        if (!part.hasStock) {
          return <Badge color="danger" size="sm">❌ Rupture</Badge>;
        }
        if (part.isLowStock) {
          return <Badge color="warning" size="sm">⚠️ Stock bas</Badge>;
        }
        return <Badge color="success" size="sm">✅ OK</Badge>;
      },
    },
    {
      key: 'location',
      header: 'Emplacement',
      render: (part) => part.location ? (
        <span className="text-sm text-neutral-600">📍 {part.location}</span>
      ) : '-',
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={parts}
      keyField="id"
      emptyState={{
        icon: <span className="text-5xl">📦</span>,
        title: 'Aucune pièce trouvée',
        description: 'Modifiez vos filtres ou ajoutez une nouvelle pièce',
      }}
    />
  );
}
