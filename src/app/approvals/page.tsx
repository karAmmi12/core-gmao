'use server';

import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/shared/lib/auth';
import DIContainer from '@/core/infrastructure/di/DIContainer';
import { GetPendingApprovalsUseCase } from '@/core/application/use-cases/GetPendingApprovalsUseCase';
import PendingApprovalsView from '@/presentation/views/approvals/PendingApprovalsView';
import type { UserRole } from '@/core/domain/entities/User';
import { MainLayout } from '@/presentation/components';

export default async function ApprovalsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/signin');
  }

  // Seuls ADMIN et MANAGER peuvent voir cette page
  const userRole = session.user.role as UserRole;
  if (!['ADMIN', 'MANAGER'].includes(userRole)) {
    redirect('/');
  }

  // Récupérer les interventions en attente via le UseCase
  const workOrderRepo = DIContainer.getWorkOrderRepository();
  const getPendingApprovalsUseCase = new GetPendingApprovalsUseCase(workOrderRepo);
  const pendingWorkOrders = await getPendingApprovalsUseCase.execute();

  // Transformer pour le composant
  const workOrders = pendingWorkOrders.map((wo) => ({
    id: wo.id,
    title: wo.title,
    description: wo.description || undefined,
    status: wo.status as any,
    priority: wo.priority as any,
    type: wo.type as any,
    assetId: wo.assetId,
    assetName: wo.assetName, 
    assignedToId: wo.assignedToId,
    assignedToName: wo.assignedToName,
    createdAt: wo.createdAt.toISOString(),
    scheduledAt: wo.scheduledAt?.toISOString(),
    estimatedCost: wo.estimatedCost || undefined,
    requiresApproval: wo.requiresApproval,
  }));

  // Stats pour le header
  const stats = {
    total: workOrders.length,
    urgent: workOrders.filter(wo => wo.priority === 'HIGH').length,
    preventive: workOrders.filter(wo => wo.type === 'PREVENTIVE').length,
    corrective: workOrders.filter(wo => wo.type === 'CORRECTIVE').length,
  };

  return (
    <MainLayout>
      <PendingApprovalsView workOrders={workOrders} stats={stats} />
    </MainLayout>
  );
}
