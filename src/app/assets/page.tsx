/**
 * Page Équipements - Liste du parc machine
 */

import { AssetService } from "@/core/application/services/AssetService";
import { MainLayout } from "@/components";
import { AssetsContent } from "@/views/assets/AssetsContent";

export const dynamic = 'force-dynamic';

export default async function AssetsPage() {
  const assetService = new AssetService();
  const assets = await assetService.getAllAssets();

  return (
    <MainLayout>
      <AssetsContent assets={assets} />
    </MainLayout>
  );
}
