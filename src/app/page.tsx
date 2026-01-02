import { AssetService } from "@/core/application/services/AssetService";
import DIContainer from "@/core/infrastructure/di/DIContainer";
import { MainLayout } from "@/components/layouts/MainLayout";
import { DashboardContent } from "@/views/dashboard/DashboardContent";
import { getServerSession } from 'next-auth';
import { authOptions } from '@/shared/lib/auth';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  // Vérifier l'authentification
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/login');
  }

  const userRole = session.user.role as string;
  const technicianId = session.user.technicianId;

  const assetService = new AssetService();
  const maintenanceScheduleService = DIContainer.getMaintenanceScheduleService();
  const maintenanceRepo = DIContainer.getMaintenanceScheduleRepository();

  const [stats, assets, dueSchedules] = await Promise.all([
    assetService.getDashboardStats(),
    assetService.getAllAssets(),
    // Les techniciens ne voient que leurs plannings dus
    (userRole === 'TECHNICIAN' && technicianId)
      ? maintenanceRepo.findByAssignedTo(technicianId).then(schedules => schedules.filter(s => s.isDue()))
      : maintenanceScheduleService.getDueSchedules(),
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
