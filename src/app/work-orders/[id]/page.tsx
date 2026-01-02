import { notFound } from 'next/navigation';
import DIContainer from "@/core/infrastructure/di/DIContainer";
import { WorkOrderMapper } from "@/core/application/dto/WorkOrderMapper";
import { MainLayout } from "@/components";
import WorkOrderDetail from "@/presentation/views/work-orders/WorkOrderDetail";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function WorkOrderDetailPage({ params }: PageProps) {
  const { id } = await params;

  // Fetch work order
  const workOrderRepo = DIContainer.getWorkOrderRepository();
  const workOrder = await workOrderRepo.findById(id);

  if (!workOrder) {
    notFound();
  }

  const workOrderDTO = WorkOrderMapper.toDTO(workOrder);

  // Fetch asset name
  const assetRepo = DIContainer.getAssetRepository();
  const asset = await assetRepo.findById(workOrder.assetId);
  const assetName = asset?.name || 'Équipement inconnu';

  // Fetch technician name if assigned
  let technicianName: string | undefined;
  if (workOrder.assignedToId) {
    const technicianRepo = DIContainer.getTechnicianRepository();
    const technician = await technicianRepo.findById(workOrder.assignedToId);
    technicianName = technician?.name;
  }

  return (
    <MainLayout>
      <WorkOrderDetail
        workOrder={workOrderDTO}
        assetName={assetName}
        technicianName={technicianName}
      />
    </MainLayout>
  );
}
