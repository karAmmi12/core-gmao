/**
 * Page Maintenance - Version refactorisée
 */

import DIContainer from '@/core/infrastructure/di/DIContainer';
import { MainLayout } from '@/components/layouts/MainLayout';
import { MaintenanceContent } from '@/views/maintenance/MaintenanceContent';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/shared/lib/auth';
import { redirect } from 'next/navigation';

export const revalidate = 60;

export default async function MaintenancePage() {
  // Vérifier l'authentification
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/login');
  }

  const userRole = session.user.role as string;
  const technicianId = session.user.technicianId;
  
  const maintenanceScheduleService = DIContainer.getMaintenanceScheduleService();
  
  // Les techniciens ne voient que leurs plannings, les managers/admins voient tout
  let schedules;
  if (userRole === 'TECHNICIAN' && technicianId) {
    const maintenanceRepo = DIContainer.getMaintenanceScheduleRepository();
    const rawSchedules = await maintenanceRepo.findByAssignedTo(technicianId);
    
    // Mapper manuellement pour obtenir les DTO avec les noms
    const assetRepo = DIContainer.getAssetRepository();
    const technicianRepo = DIContainer.getTechnicianRepository();
    
    schedules = await Promise.all(
      rawSchedules.map(async (schedule) => {
        const asset = await assetRepo.findById(schedule.assetId);
        let assignedToName: string | undefined;
        if (schedule.assignedToId) {
          const technician = await technicianRepo.findById(schedule.assignedToId);
          assignedToName = technician?.name;
        }
        const { MaintenanceScheduleMapper } = await import('@/core/application/dto/MaintenanceScheduleDTO');
        return MaintenanceScheduleMapper.toDTO(schedule, asset?.name, assignedToName);
      })
    );
  } else {
    schedules = await maintenanceScheduleService.getAllSchedules();
  }

  return (
    <MainLayout>
      <MaintenanceContent schedules={schedules} userRole={userRole} />
    </MainLayout>
  );
}
