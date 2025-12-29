/**
 * Page Nouveau Technicien
 */

import { MainLayout, PageHeader, LinkButton } from '@/components';
import { TechnicianForm } from '@/presentation/components/features/forms/TechnicianForm';
import { ConfigurationService } from '@/core/application/services/ConfigurationService';

export default async function NewTechnicianPage() {
  const skills = await ConfigurationService.getTechnicianSkills();

  return (
    <MainLayout>
      <div className="space-y-6">
        <PageHeader
          title="Nouveau Technicien"
          description="Ajouter un nouveau membre à l'équipe technique"
          icon="👷"
          actions={
            <LinkButton href="/technicians" variant="ghost">
              ← Retour à la liste
            </LinkButton>
          }
        />
        
        <TechnicianForm mode="create" availableSkills={skills} />
      </div>
    </MainLayout>
  );
}
