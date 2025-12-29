/**
 * Page Maintenance - Version refactorisée
 */

import DIContainer from '@/core/infrastructure/di/DIContainer';
import { MainLayout } from '@/components/layouts/MainLayout';
import { MaintenanceContent } from '@/views/maintenance/MaintenanceContent';

export const dynamic = 'force-dynamic';

export default async function MaintenancePage() {
  const maintenanceScheduleService = DIContainer.getMaintenanceScheduleService();
  const schedules = await maintenanceScheduleService.getAllSchedules();

  return (
    <MainLayout>
      <MaintenanceContent schedules={schedules} />
    </MainLayout>
  );
}
