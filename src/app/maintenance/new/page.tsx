import { Suspense } from 'react';
import DIContainer from '@/core/infrastructure/di/DIContainer';
import { AssetService } from '@/core/application/services/AssetService';
import { TechnicianService } from '@/core/application/services/TechnicianService';
import { MaintenanceScheduleForm } from '@/presentation/components/features/maintenance/MaintenanceScheduleForm';
import { createMaintenanceScheduleAction } from '@/app/actions';
import { MainLayout } from '@/components';
import { TableSkeleton } from '@/components/common/LoadingSkeletons';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/shared/lib/auth';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

async function NewMaintenanceScheduleContent() {
  const assetService = new AssetService();
  const technicianService = new TechnicianService();

  const [assets, technicians] = await Promise.all([
    assetService.getAllAssets(),
    technicianService.getAllTechnicians(),
  ]);

  return (
    <MaintenanceScheduleForm
      assets={assets}
      technicians={technicians}
      createAction={createMaintenanceScheduleAction}
    />
  );
}

export default async function NewMaintenanceSchedulePage() {
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

  return (
    <MainLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Nouveau planning de maintenance</h1>
        <p className="text-gray-600 mt-1">Créez un planning de maintenance préventive</p>
      </div>

      <Suspense fallback={<TableSkeleton />}>
        <NewMaintenanceScheduleContent />
      </Suspense>
    </MainLayout>
  );
}
