import { notFound } from 'next/navigation';
import DIContainer from "@/core/infrastructure/di/DIContainer";
import { WorkOrderMapper } from "@/core/application/dto/WorkOrderMapper";
import WorkOrderEditForm from "@/presentation/views/work-orders/WorkOrderEditForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function WorkOrderEditPage({ params }: PageProps) {
  const { id } = await params;

  // Fetch work order
  const workOrderRepo = DIContainer.getWorkOrderRepository();
  const workOrder = await workOrderRepo.findById(id);

  if (!workOrder) {
    notFound();
  }

  // Can't edit completed or cancelled
  if (workOrder.status === 'COMPLETED' || workOrder.status === 'CANCELLED') {
    notFound();
  }

  const workOrderDTO = WorkOrderMapper.toDTO(workOrder);

  // Fetch asset name
  const assetRepo = DIContainer.getAssetRepository();
  const asset = await assetRepo.findById(workOrder.assetId);
  const assetName = asset?.name || 'Équipement inconnu';

  // Fetch technicians
  const technicianRepo = DIContainer.getTechnicianRepository();
  const technicians = await technicianRepo.findAll();
  const technicianOptions = technicians.map(t => ({
    id: t.id,
    name: t.name
  }));

  return (
    <WorkOrderEditForm
      workOrder={workOrderDTO}
      assetName={assetName}
      technicians={technicianOptions}
    />
  );
}
