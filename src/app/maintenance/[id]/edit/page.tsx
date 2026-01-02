import { Suspense } from 'react';
import DIContainer from '@/core/infrastructure/di/DIContainer';
import { AssetService } from '@/core/application/services/AssetService';
import { TechnicianService } from '@/core/application/services/TechnicianService';
import { MaintenanceScheduleForm } from '@/components/features/forms/MaintenanceScheduleForm';
import { updateMaintenanceScheduleAction } from '@/app/actions';
import { MainLayout } from '@/components';
import { TableSkeleton } from '@/components/common/LoadingSkeletons';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/shared/lib/auth';
import { redirect } from 'next/navigation';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

async function EditMaintenanceScheduleContent({ id }: { id: string }) {
  const maintenanceScheduleService = DIContainer.getMaintenanceScheduleService();
  const assetService = new AssetService();
  const technicianService = new TechnicianService();

  const [schedule, assets, technicians] = await Promise.all([
    maintenanceScheduleService.getScheduleById(id),
    assetService.getAllAssets(),
    technicianService.getAllTechnicians(),
  ]);

  if (!schedule) {
    notFound();
  }

  return (
    <MaintenanceScheduleForm
      assets={assets}
      technicians={technicians}
      createAction={updateMaintenanceScheduleAction}
      existingSchedule={schedule}
    />
  );
}

export default async function EditMaintenanceSchedulePage({ params }: { params: Promise<{ id: string }> }) {
  // Vérifier l'authentification
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/login');
  }

  // Vérifier les permissions - seuls MANAGER et ADMIN
  const userRole = session.user.role as string;
  if (userRole !== 'MANAGER' && userRole !== 'ADMIN') {
    redirect('/maintenance');
  }

  const { id } = await params;

  return (
    <MainLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Modifier le planning de maintenance</h1>
        <p className="text-gray-600 mt-1">Modifiez les paramètres du planning</p>
      </div>

      <Suspense fallback={<TableSkeleton />}>
        <EditMaintenanceScheduleContent id={id} />
      </Suspense>
    </MainLayout>
  );
}
