import DIContainer from "@/core/infrastructure/di/DIContainer";
import { MainLayout } from "@/components";
import WorkOrderForm from "@/presentation/views/work-orders/WorkOrderForm";
import { getServerSession } from 'next-auth';
import { authOptions } from '@/shared/lib/auth';
import { redirect } from 'next/navigation';

export default async function NewWorkOrderPage() {
  // Authentication
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/login');
  }
  const userRole = session.user.role as string;

  // Fetch assets
  const assetRepo = DIContainer.getAssetRepository();
  const assets = await assetRepo.findAll();
  const assetOptions = assets.map(a => ({
    id: a.id,
    name: a.name,
    serialNumber: a.serialNumber
  }));

  // Fetch technicians
  const technicianRepo = DIContainer.getTechnicianRepository();
  const technicians = await technicianRepo.findAll();
  const technicianOptions = technicians.map(t => ({
    id: t.id,
    name: t.name,
    skills: t.skills
  }));

  // Fetch parts
  const partRepo = DIContainer.getPartRepository();
  const parts = await partRepo.findAll();
  const partOptions = parts.map(p => ({
    id: p.id,
    reference: p.reference,
    name: p.name,
    quantityInStock: p.quantityInStock,
    unitPrice: p.unitPrice
  }));

  // Default priorities (configuration will be added later)
  const priorities = [
    { code: 'LOW', label: 'Normale' },
    { code: 'HIGH', label: 'Urgente' }
  ];

  return (
    <MainLayout>
      <WorkOrderForm
        assets={assetOptions}
        technicians={technicianOptions}
        parts={partOptions}
        priorities={priorities}
        userRole={userRole}
      />
    </MainLayout>
  );
}
