import { AssetService } from "@/core/application/services/AssetService";
import DIContainer from "@/core/infrastructure/di/DIContainer";
import { MainLayout } from "@/components/layouts/MainLayout";
import { DashboardContent } from "@/views/dashboard/DashboardContent";
import { getServerSession } from 'next-auth';
import { authOptions } from '@/shared/lib/auth';
import { redirect } from 'next/navigation';
import { MaintenanceScheduleMapper } from '@/core/application/dto/MaintenanceScheduleDTO';

export const dynamic = 'force-dynamic';
export const revalidate = 60; // Cache pendant 60 secondes pour optimiser les performances

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

  const [stats, assets, dueSchedulesRaw] = await Promise.all([
    assetService.getDashboardStats(),
    assetService.getAllAssets(),
    // Les techniciens ne voient que leurs plannings dus, les managers voient tout
    (userRole === 'TECHNICIAN' && technicianId)
      ? maintenanceRepo.findByAssignedTo(technicianId).then(schedules => schedules.filter(s => s.isDue()))
      : maintenanceScheduleService.getDueSchedules(),
  ]);

  // Mapper les entités en DTOs si nécessaire (pour les techniciens)
  const dueSchedules = (userRole === 'TECHNICIAN' && technicianId && Array.isArray(dueSchedulesRaw))
    ? dueSchedulesRaw.map((schedule: any) => 
        schedule.toDTO ? schedule.toDTO() : MaintenanceScheduleMapper.toDTO(schedule)
      )
    : dueSchedulesRaw;

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
