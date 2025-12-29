'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Box, CheckCircle, AlertCircle, Zap, Activity, Clock,
  Plus, ArrowRight, AlertTriangle, TrendingUp, Calendar
} from 'lucide-react';
import { DashboardStatsDTO, AssetDTO } from '@/core/application/dto/AssetDTO';
import { MaintenanceScheduleDTO } from '@/core/application/dto/MaintenanceScheduleDTO';
import {
  Card,
  Badge,
  Button,
  LinkButton,
  EmptyState,
  PageHeader,
  StatCard,
  StatsGrid,
  DataTable,
  Input,
  type Column
} from '@/components';
import { useSearch } from '@/presentation/hooks';
import { LAYOUT_STYLES, cn } from '@/styles/design-system';

// ============================================================================
// Types
// ============================================================================

interface DashboardContentProps {
  stats: DashboardStatsDTO;
  assets: AssetDTO[];
  dueSchedules: MaintenanceScheduleDTO[];
}

// ============================================================================
// Quick Actions Component
// ============================================================================

function QuickActions() {
  return (
    <Card>
      <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
        <Zap className="text-primary-600" size={20} />
        Actions rapides
      </h3>
      <div className="space-y-2">
        <LinkButton 
          href="/assets/new" 
          variant="outline" 
          className="w-full justify-start"
          icon={<Box size={18} />}
        >
          Nouvel équipement
        </LinkButton>
        <LinkButton 
          href="/work-orders/new" 
          variant="outline" 
          className="w-full justify-start"
          icon={<Activity size={18} />}
        >
          Créer une intervention
        </LinkButton>
        <LinkButton 
          href="/maintenance/schedule/new" 
          variant="outline" 
          className="w-full justify-start"
          icon={<Calendar size={18} />}
        >
          Planifier maintenance
        </LinkButton>
      </div>
    </Card>
  );
}

// ============================================================================
// Alerts Component
// ============================================================================

function DashboardAlerts({ stats }: { stats: DashboardStatsDTO }) {
  const alerts = [];

  if (stats.brokenAssets > 0) {
    alerts.push({
      type: 'danger' as const,
      icon: <AlertTriangle size={18} />,
      message: `${stats.brokenAssets} équipement${stats.brokenAssets > 1 ? 's' : ''} en panne`,
      action: { label: 'Voir', href: '/assets?status=BROKEN' }
    });
  }

  if (stats.stoppedAssets > 0) {
    alerts.push({
      type: 'warning' as const,
      icon: <AlertCircle size={18} />,
      message: `${stats.stoppedAssets} équipement${stats.stoppedAssets > 1 ? 's' : ''} arrêté${stats.stoppedAssets > 1 ? 's' : ''}`,
      action: { label: 'Voir', href: '/assets?status=STOPPED' }
    });
  }

  if (stats.availabilityRate < 80) {
    alerts.push({
      type: 'warning' as const,
      icon: <TrendingUp size={18} />,
      message: `Taux de disponibilité faible: ${stats.availabilityRate.toFixed(1)}%`,
      action: { label: 'Analyser', href: '/analytics' }
    });
  }

  if (alerts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert, index) => (
        <Card 
          key={index} 
          className={cn(
            'border-l-4',
            alert.type === 'danger' && 'border-l-danger-500 bg-danger-50',
            alert.type === 'warning' && 'border-l-warning-500 bg-warning-50'
          )}
        >
          <div className={cn(LAYOUT_STYLES.flexRow, 'justify-between items-center')}>
            <div className={cn(LAYOUT_STYLES.flexRow, 'gap-3')}>
              <div className={cn(
                'w-8 h-8 rounded-lg flex items-center justify-center',
                alert.type === 'danger' && 'bg-danger-100 text-danger-600',
                alert.type === 'warning' && 'bg-warning-100 text-warning-600'
              )}>
                {alert.icon}
              </div>
              <p className="font-medium text-neutral-900">{alert.message}</p>
            </div>
            <Link
              href={alert.action.href}
              className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center gap-1"
            >
              {alert.action.label} <ArrowRight size={14} />
            </Link>
          </div>
        </Card>
      ))}
    </div>
  );
}

// ============================================================================
// Recent Assets Component
// ============================================================================

function RecentAssets({ assets }: { assets: AssetDTO[] }) {
  const recentAssets = assets.slice(0, 5);

  if (recentAssets.length === 0) {
    return (
      <Card>
        <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
          <TrendingUp className="text-neutral-600" size={20} />
          Derniers équipements
        </h3>
        <EmptyState
          icon={<Box size={40} className="text-neutral-400" />}
          title="Aucun équipement"
          description="Créez votre premier équipement"
        />
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
          <TrendingUp className="text-neutral-600" size={20} />
          Derniers équipements
        </h3>
        <Link href="/assets" className="text-sm text-primary-600 hover:underline flex items-center gap-1">
          Voir tout <ArrowRight size={14} />
        </Link>
      </div>

      <div className="space-y-2">
        {recentAssets.map((asset) => (
          <Link
            key={asset.id}
            href={`/assets/${asset.id}`}
            className="block p-3 hover:bg-neutral-50 rounded-lg transition-colors border border-transparent hover:border-neutral-200"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-sm text-neutral-900">{asset.name}</h4>
                <p className="text-xs text-neutral-500">{asset.serialNumber}</p>
              </div>
              <Badge
                variant={
                  asset.status === 'RUNNING' ? 'success' :
                  asset.status === 'STOPPED' ? 'warning' :
                  asset.status === 'BROKEN' ? 'danger' : 'neutral'
                }
                size="sm"
              >
                {asset.status === 'RUNNING' ? 'En marche' :
                 asset.status === 'STOPPED' ? 'Arrêté' :
                 asset.status === 'BROKEN' ? 'En panne' : asset.status}
              </Badge>
            </div>
          </Link>
        ))}
      </div>
    </Card>
  );
}

// ============================================================================
// Maintenance Due Component (Simplified)
// ============================================================================

function MaintenanceDue({ schedules }: { schedules: MaintenanceScheduleDTO[] }) {
  if (schedules.length === 0) {
    return (
      <Card>
        <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
          <CheckCircle className="text-success-600" size={20} />
          Maintenance planifiée
        </h3>
        <div className="text-center py-8">
          <CheckCircle size={40} className="text-success-500 mx-auto mb-3" />
          <p className="text-sm text-neutral-600">Aucune maintenance en retard</p>
          <p className="text-xs text-neutral-500 mt-1">Toutes les maintenances sont à jour</p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="text-warning-600" size={20} />
          <h3 className="font-semibold">Maintenance en retard</h3>
          <Badge variant="danger">{schedules.length}</Badge>
        </div>
        <Link href="/maintenance" className="text-sm text-primary-600 hover:underline flex items-center gap-1">
          Voir tout <ArrowRight size={14} />
        </Link>
      </div>

      <div className="space-y-3">
        {schedules.slice(0, 5).map((schedule) => (
          <div key={schedule.id} className="p-3 bg-warning-50 border border-warning-200 rounded-lg">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-sm">{schedule.title}</h4>
                <Link 
                  href={`/assets/${schedule.assetId}`} 
                  className="text-xs text-primary-600 hover:underline"
                >
                  {schedule.assetName}
                </Link>
                <p className="text-xs text-warning-700 mt-1 flex items-center gap-1">
                  <Clock size={12} />
                  Prévue le {new Date(schedule.nextDueDate).toLocaleDateString('fr-FR')}
                </p>
              </div>
              {schedule.priority === 'HIGH' && (
                <Badge variant="danger" size="sm">Urgent</Badge>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ============================================================================
// Dashboard Stats Component
// ============================================================================

function DashboardStats({ stats }: { stats: DashboardStatsDTO }) {
  const statItems = [
    {
      icon: <Box className="text-primary-600" size={24} />,
      label: 'Total Équipements',
      value: stats.totalAssets,
      color: 'primary' as const,
    },
    {
      icon: <CheckCircle className="text-success-600" size={24} />,
      label: 'En fonctionnement',
      value: stats.runningAssets,
      color: 'success' as const,
    },
    {
      icon: <AlertCircle className="text-warning-600" size={24} />,
      label: 'Arrêtés',
      value: stats.stoppedAssets,
      color: 'warning' as const,
    },
    {
      icon: <Zap className="text-danger-600" size={24} />,
      label: 'En panne',
      value: stats.brokenAssets,
      color: 'danger' as const,
    },
    {
      icon: <Activity className="text-primary-600" size={24} />,
      label: 'Interventions en cours',
      value: stats.pendingOrders,
      color: 'primary' as const,
    },
    {
      icon: <CheckCircle className="text-success-600" size={24} />,
      label: 'Taux de disponibilité',
      value: `${stats.availabilityRate.toFixed(1)}%`,
      color: stats.availabilityRate >= 80 ? 'success' as const : 'warning' as const,
    },
  ];

  return (
    <StatsGrid columns={6}>
      {statItems.map((item, index) => (
        <StatCard
          key={index}
          icon={item.icon}
          label={item.label}
          value={item.value}
          color={item.color}
        />
      ))}
    </StatsGrid>
  );
}

// ============================================================================
// Asset Status Config
// ============================================================================

const ASSET_STATUS_CONFIG = {
  RUNNING: { label: 'En marche', variant: 'success' as const },
  STOPPED: { label: 'Arrêté', variant: 'warning' as const },
  MAINTENANCE: { label: 'En maintenance', variant: 'primary' as const },
  BROKEN: { label: 'En panne', variant: 'danger' as const },
};

// ============================================================================
// Asset Table Component
// ============================================================================

function AssetTable({ assets }: { assets: AssetDTO[] }) {
  const { query, setQuery, filteredItems } = useSearch(assets, { searchKeys: ['name', 'serialNumber', 'status'] });

  const columns: Column<AssetDTO>[] = [
    {
      key: 'name',
      header: 'Nom',
      render: (asset) => (
        <span className="font-semibold text-neutral-900">{asset.name}</span>
      ),
    },
    {
      key: 'serialNumber',
      header: 'N° Série',
      render: (asset) => (
        <span className="font-mono text-sm text-neutral-600">{asset.serialNumber}</span>
      ),
    },
    {
      key: 'status',
      header: 'État',
      render: (asset) => {
        const config = ASSET_STATUS_CONFIG[asset.status as keyof typeof ASSET_STATUS_CONFIG] || ASSET_STATUS_CONFIG.RUNNING;
        return <Badge variant={config.variant}>{config.label}</Badge>;
      },
    },
    {
      key: 'createdAt',
      header: 'Ajouté le',
      render: (asset) => (
        <span className="text-sm text-neutral-600">
          {new Date(asset.createdAt).toLocaleDateString('fr-FR')}
        </span>
      ),
    },
    {
      key: 'id',
      header: 'Actions',
      render: (asset) => (
        <Link
          href={`/assets/${asset.id}`}
          className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center gap-1"
        >
          Voir détails <ArrowRight size={14} />
        </Link>
      ),
    },
  ];

  return (
    <Card padding="none">
      <div className="p-6 border-b border-neutral-200 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Parc Machine</h2>
        <Input
          placeholder="Rechercher un équipement..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-64"
        />
      </div>

      {filteredItems.length === 0 ? (
        <EmptyState
          icon={<Box size={48} className="text-neutral-300" />}
          title="Aucun équipement"
          description={query ? "Aucun résultat pour cette recherche" : "Aucun équipement enregistré"}
        />
      ) : (
        <DataTable
          data={filteredItems}
          columns={columns}
          keyField="id"
        />
      )}
    </Card>
  );
}

// ============================================================================
// Main Dashboard Content
// ============================================================================

export function DashboardContent({
  stats,
  assets,
  dueSchedules
}: DashboardContentProps) {
  return (
    <div className="container-page">
      <PageHeader
        title="Tableau de bord"
        description={`Vue d'ensemble — ${new Date().toLocaleDateString('fr-FR')}`}
        icon="📊"
      />

      {/* Stats */}
      <DashboardStats stats={stats} />

      {/* Alerts */}
      <div className="mt-6">
        <DashboardAlerts stats={stats} />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <QuickActions />
        <MaintenanceDue schedules={dueSchedules} />
        <RecentAssets assets={assets} />
      </div>

      {/* Asset Table */}
      <div className="mt-6">
        <AssetTable assets={assets} />
      </div>
    </div>
  );
}
