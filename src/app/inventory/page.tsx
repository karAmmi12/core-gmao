/**
 * Page Inventaire - Version refactorisée
 */

import { InventoryService } from '@/core/application/services/InventoryService';
import { ConfigurationService } from '@/core/application/services/ConfigurationService';
import { MainLayout } from '@/components/layouts/MainLayout';
import { InventoryContent } from '@/views/inventory/InventoryContent';

export const dynamic = 'force-dynamic';

export default async function InventoryPage() {
  const service = new InventoryService();
  
  const [parts, stats, partCategories] = await Promise.all([
    service.getAllParts(),
    service.getInventoryStats(),
    ConfigurationService.getPartCategories(),
  ]);

  return (
    <MainLayout>
      <InventoryContent parts={parts} stats={stats} partCategories={partCategories} />
    </MainLayout>
  );
}
