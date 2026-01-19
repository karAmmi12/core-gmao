/**
 * Page Techniciens - Version refactorisée
 */

import { TechnicianService } from "@/core/application/services/TechnicianService";
import { MainLayout } from "@/components/layouts/MainLayout";
import { TechniciansContent } from "@/views/technicians/TechniciansContent";

export const revalidate = 60;

export default async function TechniciansPage() {
  const service = new TechnicianService();
  const technicians = await service.getAllTechnicians();

  return (
    <MainLayout>
      <TechniciansContent technicians={technicians} />
    </MainLayout>
  );
}
