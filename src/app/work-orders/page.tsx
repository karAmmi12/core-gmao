import DIContainer from "@/core/infrastructure/di/DIContainer";
import { WorkOrderMapper } from "@/core/application/dto/WorkOrderMapper";
import WorkOrdersContent from "@/presentation/views/work-orders/WorkOrdersContent";
import { MainLayout } from "@/presentation/components/layouts/MainLayout";

export default async function WorkOrdersPage() {
  // Fetch work orders
  const workOrderRepo = DIContainer.getWorkOrderRepository();
  const workOrders = await workOrderRepo.findAll();
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
