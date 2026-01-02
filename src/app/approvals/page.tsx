'use server';

import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/shared/lib/auth';
import { prisma } from '@/lib/prisma';
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

  // Récupérer les interventions en attente d'approbation
  const pendingWorkOrders = await prisma.workOrder.findMany({
    where: { status: 'PENDING' },
    include: {
      asset: { select: { id: true, name: true } },
      assignedTo: { select: { id: true, name: true } },
    },
    orderBy: [
      { priority: 'desc' }, // Urgences en premier
      { createdAt: 'asc' }, // Plus anciennes en premier
    ],
  });

  // Transformer pour le composant
  const workOrders = pendingWorkOrders.map((wo) => ({
    id: wo.id,
    title: wo.title,
    description: wo.description || undefined,
    status: wo.status as any,
    priority: wo.priority as any,
    type: wo.type as any,
    assetId: wo.assetId,
    assetName: wo.asset.name,
    assignedToId: wo.assignedToId || undefined,
    assignedToName: wo.assignedTo?.name || undefined,
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
