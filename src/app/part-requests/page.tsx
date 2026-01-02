// =============================================================================
// PAGE DEMANDES DE PIÈCES
// =============================================================================

import { Suspense } from 'react';
import { getPartRequests, getPendingPartRequestsCount } from './actions';
import { PartRequestsContent } from '@/presentation/views/part-requests/PartRequestsContent';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/shared/lib/auth';
import { redirect } from 'next/navigation';
import DIContainer from '@/core/infrastructure/di/DIContainer';
import { Main } from 'next/document';
import { MainLayout } from '@/presentation/components';

export default async function PartRequestsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/login');
  }

  const userRole = session.user.role;
  const userId = session.user.id;

  // Récupérer les demandes (filtrées selon le rôle)
  const { requests } = await getPartRequests();
  const pendingCount = await getPendingPartRequestsCount();

  // Récupérer la liste des pièces pour le formulaire de demande
  const partRepo = DIContainer.getPartRepository();
  const parts = await partRepo.findAll();

  return (
    <MainLayout>
        <Suspense fallback={<div className="p-8 text-center">Chargement...</div>}>
            <PartRequestsContent 
                requests={requests}
                pendingCount={pendingCount}
                userRole={userRole as any}
                userId={userId}
                parts={parts.map(p => ({
                id: p.id,
                reference: p.reference,
                name: p.name,
                quantityInStock: p.quantityInStock,
                }))}
            />
        </Suspense>
    </MainLayout>
  );
}
