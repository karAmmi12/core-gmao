import { AssetService } from "@/core/application/services/AssetService";
import { MainLayout } from "@/presentation/components/layouts/MainLayout";
import { AssetForm } from "@/presentation/components/forms/AssetForm";
import { WorkOrderForm } from "@/presentation/components/features/forms/WorkOrderForm";
import { DashboardHeader } from "@/presentation/components/features/dashboard/DashboardHeader";
import { DashboardStats } from "@/presentation/components/features/dashboard/DashboardStats";
import { DashboardAssetTable } from "@/presentation/components/features/dashboard/DashboardAssetTable";
import { DashboardPendingOrders } from "@/presentation/components/features/dashboard/DashboardPendingOrders";

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const assetService = new AssetService();

  const stats = await assetService.getDashboardStats();
  const assets = await assetService.getAllAssets();

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto px-6 py-8">
        
        <DashboardHeader />

        <div className="mb-8">
          <DashboardStats stats={stats} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          
          <AssetForm />

          <WorkOrderForm assets={assets} />

          <DashboardPendingOrders 
            pendingCount={stats.pendingOrders} 
            availabilityRate={stats.availabilityRate} 
          />

        </div>

        <DashboardAssetTable assets={assets} />
      </div>
    </MainLayout>
  );
}