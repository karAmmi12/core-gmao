import DIContainer from "@/core/infrastructure/di/DIContainer";
import { WorkOrderMapper } from "@/core/application/dto/WorkOrderMapper";
import WorkOrdersContent from "@/presentation/views/work-orders/WorkOrdersContent";
import { MainLayout } from "@/presentation/components/layouts/MainLayout";
import { getServerSession } from 'next-auth';
import { authOptions } from '@/shared/lib/auth';
import { redirect } from 'next/navigation';

interface PageProps {
  searchParams: { page?: string };
}

export default async function WorkOrdersPage({ searchParams }: PageProps) {
  // Vérifier l'authentification
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/login');
  }

  const userRole = session.user.role as string;
  const technicianId = session.user.technicianId;
  const currentPage = Number(searchParams.page) || 1;
  const pageSize = 20;

  // Fetch work orders
  const workOrderRepo = DIContainer.getWorkOrderRepository();
  
  // Les techniciens ne voient que leurs interventions (pas de pagination pour eux)
  // Les managers/admins ont la pagination
  let workOrderDTOs;
  let pagination;
  
  if (userRole === 'TECHNICIAN' && technicianId) {
    const workOrders = await workOrderRepo.findByAssignedTo(technicianId);
    workOrderDTOs = WorkOrderMapper.toDTOList(workOrders);
    pagination = {
      currentPage: 1,
      totalPages: 1,
      totalItems: workOrders.length,
      pageSize: workOrders.length
    };
  } else {
    const result = await workOrderRepo.findAllPaginated(currentPage, pageSize);
    workOrderDTOs = WorkOrderMapper.toDTOList(result.items);
    pagination = {
      currentPage: result.page,
      totalPages: result.totalPages,
      totalItems: result.total,
      pageSize: result.pageSize
    };
  }

  // Fetch technicians for filter
  const technicianRepo = DIContainer.getTechnicianRepository();
  const technicians = await technicianRepo.findAll();
  const technicianOptions = technicians.map(t => ({
    id: t.id,
    name: t.name
  }));

  return (
    <MainLayout>
        <WorkOrdersContent 
        workOrders={workOrderDTOs}
        pagination={pagination}
        technicians={technicianOptions}
        />
    </MainLayout>
  );
}
