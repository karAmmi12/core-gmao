/**
 * Page de démonstration - Automatisation IA Documents
 * MVP pour tester l'extraction de données via IA
 */

import { prisma } from '@/lib/prisma';
import { DemoPageClient } from './DemoPageClient';

export default async function DocumentAutomationDemoPage() {
  // Récupérer un WorkOrder existant pour la démo (en priorité IN_PROGRESS, sinon n'importe lequel)
  const workOrder = await prisma.workOrder.findFirst({
    orderBy: {
      createdAt: 'desc'
    },
    select: {
      id: true,
      title: true,
      status: true,
      asset: {
        select: {
          name: true
        }
      }
    }
  });

  return <DemoPageClient workOrder={workOrder} />;
}
