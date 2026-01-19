/**
 * Page Détail / Édition Technicien
 */

import { notFound } from 'next/navigation';
import { MainLayout, PageHeader, LinkButton, Card, Badge, Button } from '@/components';
import { TechnicianForm } from '@/presentation/components/features/technicians/TechnicianForm';
import { GetTechnicianDetailsUseCase } from '@/core/application/use-cases/GetTechnicianDetailsUseCase';
import DIContainer from '@/core/infrastructure/di/DIContainer';
import { TechnicianDetailClient } from './TechnicianDetailClient';
import { ConfigurationService } from '@/core/application/services/ConfigurationService';

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ edit?: string }>;
}

export default async function TechnicianDetailPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { edit } = await searchParams;
  const isEditMode = edit === 'true';

  const technicianRepo = DIContainer.getTechnicianRepository();
  const useCase = new GetTechnicianDetailsUseCase(technicianRepo);
  const technician = await useCase.execute(id);

  if (!technician) {
    notFound();
  }

  // Charger les compétences disponibles en mode édition
  const skills = isEditMode ? await ConfigurationService.getTechnicianSkills() : [];

  return (
    <MainLayout>
      <div className="space-y-6">
        <PageHeader
          title={isEditMode ? 'Modifier le technicien' : technician.name}
          description={isEditMode ? `Édition de ${technician.name}` : technician.email}
          icon="👷"
          actions={
            <div className="flex gap-2">
              <LinkButton href="/technicians" variant="ghost">
                ← Retour
              </LinkButton>
              {!isEditMode && (
                <LinkButton href={`/technicians/${id}?edit=true`} variant="primary">
                  ✏️ Modifier
                </LinkButton>
              )}
            </div>
          }
        />

        {isEditMode ? (
          <TechnicianForm technician={technician} mode="edit" availableSkills={skills} />
        ) : (
          <TechnicianDetailClient technician={technician} />
        )}
      </div>
    </MainLayout>
  );
}
