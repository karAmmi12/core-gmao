/**
 * Page Analytics - Dashboard avancé avec graphiques et KPIs
 */

import { MainLayout, PageHeader, StatsGrid, StatCard, Button } from '@/components';
import { AnalyticsService } from '@/core/application/services/AnalyticsService';
import { AnalyticsContent } from '@/views/analytics/AnalyticsContent';

export const dynamic = 'force-dynamic';

export default async function AnalyticsPage() {
  const analyticsService = new AnalyticsService();

  const [
    kpis,
    maintenanceStats,
    inventoryStats,
    technicianPerformance,
    monthlyTrends,
    assetAvailability,
    statusDistribution,
  ] = await Promise.all([
    analyticsService.getDashboardKPIs(),
    analyticsService.getMaintenanceStats(),
    analyticsService.getInventoryStats(),
    analyticsService.getTechnicianPerformance(),
    analyticsService.getMonthlyTrends(6),
    analyticsService.getAssetAvailability(),
    analyticsService.getStatusDistribution(),
  ]);

  return (
    <MainLayout>
      <AnalyticsContent
        kpis={kpis}
        maintenanceStats={maintenanceStats}
        inventoryStats={inventoryStats}
        technicianPerformance={technicianPerformance}
        monthlyTrends={monthlyTrends}
        assetAvailability={assetAvailability}
        statusDistribution={statusDistribution}
      />
    </MainLayout>
  );
}
