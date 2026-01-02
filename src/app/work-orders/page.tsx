import DIContainer from "@/core/infrastructure/di/DIContainer";
import { WorkOrderMapper } from "@/core/application/dto/WorkOrderMapper";
import WorkOrdersContent from "@/presentation/views/work-orders/WorkOrdersContent";
import { MainLayout } from "@/presentation/components/layouts/MainLayout";
import { getServerSession } from 'next-auth';
import { authOptions } from '@/shared/lib/auth';
import { redirect } from 'next/navigation';

export default async function WorkOrdersPage() {
  // Vérifier l'authentification
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/login');
  }

  const userRole = session.user.role as string;
  const technicianId = session.user.technicianId;

  // Fetch work orders
  const workOrderRepo = DIContainer.getWorkOrderRepository();
  
  // Les techniciens ne voient que leurs interventions, les managers/admins voient tout
  const workOrders = (userRole === 'TECHNICIAN' && technicianId)
    ? await workOrderRepo.findByAssignedTo(technicianId)
    : await workOrderRepo.findAll();
  
  const workOrderDTOs = WorkOrderMapper.toDTOList(workOrders);

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
        technicians={technicianOptions}
        />
    </MainLayout>
  );
}
