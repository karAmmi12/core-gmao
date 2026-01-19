/**
 * Hiérarchie des Équipements - Version refactorisée
 */

import { GetAssetTreeUseCase } from "@/core/application/use-cases/GetAssetTreeUseCase";
import DIContainer from "@/core/infrastructure/di/DIContainer";
import { MainLayout } from "@/components/layouts/MainLayout";
import { HierarchyContent } from "@/views/hierarchy/HierarchyContent";

export const revalidate = 60;

export default async function HierarchyPage() {
  const assetRepo = DIContainer.getAssetRepository();
  const getTreeUseCase = new GetAssetTreeUseCase(assetRepo);
  const tree = await getTreeUseCase.execute();

  return (
    <MainLayout>
      <HierarchyContent tree={tree} />
    </MainLayout>
  );
}
