import { AssetService } from "@/core/application/services/AssetService";
import { TechnicianService } from "@/core/application/services/TechnicianService";
import DIContainer from "@/core/infrastructure/di/DIContainer";
import { MainLayout } from "@/presentation/components/layouts/MainLayout";
import { AssetForm } from "@/presentation/components/forms/AssetForm";
import { WorkOrderForm } from "@/presentation/components/features/forms/WorkOrderForm";
import { DashboardHeader } from "@/presentation/components/features/dashboard/DashboardHeader";
import { DashboardStats } from "@/presentation/components/features/dashboard/DashboardStats";
import { DashboardAssetTable } from "@/presentation/components/features/dashboard/DashboardAssetTable";
import { DashboardPendingOrders } from "@/presentation/components/features/dashboard/DashboardPendingOrders";
import { DashboardMaintenanceDue } from "@/presentation/components/features/dashboard/DashboardMaintenanceDue";

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const assetService = new AssetService();
  const technicianService = new TechnicianService();
  const inventoryService = DIContainer.getInventoryService();
  const maintenanceScheduleService = DIContainer.getMaintenanceScheduleService();

  const stats = await assetService.getDashboardStats();
  const assets = await assetService.getAllAssets();
  const technicians = await technicianService.getActiveTechnicians();
  const parts = await inventoryService.getAllParts();
  const dueSchedules = await maintenanceScheduleService.getDueSchedules();

  return (
    <MainLayout>
      <div className="container-page">
        
        <DashboardHeader />

        <div className="mb-8">
          <DashboardStats stats={stats} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          
          <AssetForm assets={assets} />

          <WorkOrderForm assets={assets} technicians={technicians} parts={parts} />

          <DashboardMaintenanceDue schedules={dueSchedules} />

        </div>

        <DashboardAssetTable assets={assets} />
      </div>
    </MainLayout>
  );
}