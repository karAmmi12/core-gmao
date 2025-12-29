import { AssetService } from "@/core/application/services/AssetService";
import DIContainer from "@/core/infrastructure/di/DIContainer";
import { MainLayout } from "@/components/layouts/MainLayout";
import { DashboardContent } from "@/views/dashboard/DashboardContent";

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const assetService = new AssetService();
  const maintenanceScheduleService = DIContainer.getMaintenanceScheduleService();

  const [stats, assets, dueSchedules] = await Promise.all([
    assetService.getDashboardStats(),
    assetService.getAllAssets(),
    maintenanceScheduleService.getDueSchedules(),
  ]);

  return (
    <MainLayout>
      <DashboardContent 
        stats={stats}
        assets={assets}
        dueSchedules={dueSchedules}
      />
    </MainLayout>
  );
}
