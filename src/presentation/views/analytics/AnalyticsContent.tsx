/**
 * Analytics Content - Vue client avec graphiques
 */

'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { ChartSkeleton } from '@/presentation/components/common/LoadingSkeletons';
import {
  PageHeader,
  StatsGrid,
  StatCard,
  Button,
  Card,
  Badge,
} from '@/components';

// Chargement dynamique des graphiques avec des squelettes de chargement
const InterventionTrendsChart = dynamic(
  () =>
    import(
      '@/presentation/components/features/analytics/Charts'
    ).then((mod) => mod.InterventionTrendsChart),
  { loading: () => <ChartSkeleton />, ssr: false }
);

const WorkOrderStatusChart = dynamic(
  () =>
    import(
      '@/presentation/components/features/analytics/Charts'
    ).then((mod) => mod.WorkOrderStatusChart),
  { loading: () => <ChartSkeleton />, ssr: false }
);

const TechnicianPerformanceChart = dynamic(
  () =>
    import(
      '@/presentation/components/features/analytics/Charts'
    ).then((mod) => mod.TechnicianPerformanceChart),
  { loading: () => <ChartSkeleton />, ssr: false }
);

const AssetAvailabilityChart = dynamic(
  () =>
    import(
      '@/presentation/components/features/analytics/Charts'
    ).then((mod) => mod.AssetAvailabilityChart),
  { loading: () => <ChartSkeleton />, ssr: false }
);
import { ExportService } from '@/core/application/services/ExportService';
import { LAYOUT_STYLES } from '@/styles/design-system';
import type { DashboardKPIs, MaintenanceStats, InventoryStats, TechnicianPerformance, MonthlyTrend } from '@/core/application/services/AnalyticsService';

interface AnalyticsContentProps {
  kpis: DashboardKPIs;
  maintenanceStats: MaintenanceStats;
  inventoryStats: InventoryStats;
  technicianPerformance: TechnicianPerformance[];
  monthlyTrends: MonthlyTrend[];
  assetAvailability: { assetId: string; assetName: string; totalHours: number; downtimeHours: number; availabilityRate: number; }[];
  statusDistribution: { status: string; count: number; percentage: number }[];
}


const PERIODS: { value: Period; label: string }[] = [
  { value: '7d', label: '7 jours' },
  { value: '30d', label: '30 jours' },
  { value: '90d', label: '90 jours' },
  { value: '1y', label: '1 an' },
];

export function AnalyticsContent({
  kpis,
  maintenanceStats,
  inventoryStats,
  technicianPerformance,
  monthlyTrends,
  assetAvailability,
  statusDistribution,
}: AnalyticsContentProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('30d');

  // Export handlers

  const getExportData = () => ({
    title: 'Rapport Analytics',
    subtitle: `Généré le ${new Date().toLocaleDateString('fr-FR')}`,
    headers: ['Indicateur', 'Valeur'],
    rows: [
      ['Disponibilité moyenne', `${kpis.availability}%`],
      ['MTTR moyen', `${kpis.mttr}h`],
      ['Taux préventif', `${kpis.preventiveRate}%`],
      ['Taux complétion', `${kpis.completionRate}%`],
      ['Total interventions', maintenanceStats.totalInterventions],
      ['Préventif', maintenanceStats.preventiveCount],
      ['Correctif', maintenanceStats.correctiveCount],
      ['Valeur stock', `${inventoryStats.totalValue.toLocaleString('fr-FR')} €`],
    ],
  });
  const handleExportPDF = () => {
    
    ExportService.exportReportToPDF(getExportData(), 'analytics');
  };

  const handleExportExcel = () => {
    ExportService.exportReportToExcel(getExportData(), 'analytics');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Analytics & Reporting"
        description="Indicateurs de performance et tableaux de bord"
        icon="📊"
        actions={
          <div className={LAYOUT_STYLES.flexRow}>
            {PERIODS.map(period => (
              <Button
                key={period.value}
                variant={selectedPeriod === period.value ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setSelectedPeriod(period.value)}
              >
                {period.label}
              </Button>
            ))}
          </div>
        }
      />

      {/* KPIs principaux */}
      <div>
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">
          Indicateurs clés de performance
        </h2>
        <StatsGrid columns={4}>
          <StatCard
            label="Disponibilité moyenne"
            value={`${kpis.availability}%`}
            icon={<span className="text-2xl">📈</span>}
            color={kpis.availability >= 90 ? 'success' : kpis.availability >= 75 ? 'warning' : 'danger'}
          />
          <StatCard
            label="MTTR moyen"
            value={`${kpis.mttr}h`}
            icon={<span className="text-2xl">⏱️</span>}
            color="primary"
          />
          <StatCard
            label="Taux préventif"
            value={`${kpis.preventiveRate}%`}
            icon={<span className="text-2xl">🔧</span>}
            color={kpis.preventiveRate >= 30 ? 'success' : 'warning'}
          />
          <StatCard
            label="Taux complétion"
            value={`${kpis.completionRate}%`}
            icon={<span className="text-2xl">✅</span>}
            color={kpis.completionRate >= 80 ? 'success' : 'warning'}
          />
        </StatsGrid>
      </div>

      {/* Graphiques principaux */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InterventionTrendsChart data={monthlyTrends} />
        <WorkOrderStatusChart data={statusDistribution} />
      </div>

      {/* Stats Maintenance */}
      <Card>
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">
          Statistiques de maintenance
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center p-4 bg-neutral-50 rounded-lg">
            <p className="text-2xl font-bold text-neutral-900">
              {maintenanceStats.totalInterventions}
            </p>
            <p className="text-sm text-neutral-600 mt-1">Total interventions</p>
          </div>
          <div className="text-center p-4 bg-success-50 rounded-lg">
            <p className="text-2xl font-bold text-success-700">
              {maintenanceStats.preventiveCount}
            </p>
            <p className="text-sm text-neutral-600 mt-1">Préventif</p>
          </div>
          <div className="text-center p-4 bg-warning-50 rounded-lg">
            <p className="text-2xl font-bold text-warning-700">
              {maintenanceStats.correctiveCount}
            </p>
            <p className="text-sm text-neutral-600 mt-1">Correctif</p>
          </div>
          <div className="text-center p-4 bg-primary-50 rounded-lg">
            <p className="text-2xl font-bold text-primary-700">
              {maintenanceStats.avgResolutionTime}h
            </p>
            <p className="text-sm text-neutral-600 mt-1">Temps moyen</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-700">
              {maintenanceStats.completionRate}%
            </p>
            <p className="text-sm text-neutral-600 mt-1">Complétion</p>
          </div>
        </div>
      </Card>

      {/* Graphiques performances */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TechnicianPerformanceChart data={technicianPerformance} />
        <AssetAvailabilityChart data={assetAvailability} />
      </div>

      {/* Stats Inventaire */}
      <Card>
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">
          État de l'inventaire
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center p-4 bg-neutral-50 rounded-lg">
            <p className="text-2xl font-bold text-neutral-900">
              {inventoryStats.totalParts}
            </p>
            <p className="text-sm text-neutral-600 mt-1">Références</p>
          </div>
          <div className="text-center p-4 bg-success-50 rounded-lg">
            <p className="text-2xl font-bold text-success-700">
              {inventoryStats.totalValue.toLocaleString('fr-FR')} €
            </p>
            <p className="text-sm text-neutral-600 mt-1">Valeur stock</p>
          </div>
          <div className="text-center p-4 bg-warning-50 rounded-lg">
            <p className="text-2xl font-bold text-warning-700">
              {inventoryStats.lowStockCount}
            </p>
            <p className="text-sm text-neutral-600 mt-1">Stock bas</p>
          </div>
          <div className="text-center p-4 bg-danger-50 rounded-lg">
            <p className="text-2xl font-bold text-danger-700">
              {inventoryStats.outOfStockCount}
            </p>
            <p className="text-sm text-neutral-600 mt-1">Ruptures</p>
          </div>
          <div className="text-center p-4 bg-primary-50 rounded-lg">
            <p className="text-2xl font-bold text-primary-700">
              {inventoryStats.movementsThisMonth}
            </p>
            <p className="text-sm text-neutral-600 mt-1">Mvts ce mois</p>
          </div>
        </div>
      </Card>

      {/* Top/Bottom performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Techniciens */}
        <Card>
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">
            🏆 Top Techniciens
          </h3>
          <div className="space-y-3">
            {technicianPerformance
              .sort((a, b) => b.completionRate - a.completionRate)
              .slice(0, 5)
              .map((tech, idx) => (
                <div key={tech.technicianId} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-neutral-400">#{idx + 1}</span>
                    <div>
                      <p className="font-medium text-neutral-900">{tech.technicianName}</p>
                      <p className="text-sm text-neutral-500">
                        {tech.completed}/{tech.totalAssigned} terminés
                      </p>
                    </div>
                  </div>
                  <Badge color="success" size="lg">
                    {tech.completionRate}%
                  </Badge>
                </div>
              ))}
          </div>
        </Card>

        {/* Assets critiques */}
        <Card>
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">
            ⚠️ Assets à surveiller
          </h3>
          <div className="space-y-3">
            {assetAvailability
              .sort((a, b) => a.availabilityRate - b.availabilityRate)
              .slice(0, 5)
              .map((asset, idx) => (
                <div key={asset.assetId} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">🏭</span>
                    <div>
                      <p className="font-medium text-neutral-900">{asset.assetName}</p>
                      <p className="text-sm text-neutral-500">
                        {asset.downtimeHours}h d'arrêt
                      </p>
                    </div>
                  </div>
                  <Badge 
                    color={
                      asset.availabilityRate >= 90 ? 'success' : 
                      asset.availabilityRate >= 75 ? 'warning' : 
                      'danger'
                    } 
                    size="lg"
                  >
                    {asset.availabilityRate}%
                  </Badge>
                </div>
              ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
