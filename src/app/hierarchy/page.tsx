import { AssetService } from "@/core/application/services/AssetService";
import { MainLayout } from "@/presentation/components/layouts/MainLayout";
import { AssetTreeView } from "@/presentation/components/features/assets/AssetTreeView";
import { GetAssetTreeUseCase } from "@/core/application/use-cases/GetAssetTreeUseCase";
import DIContainer from "@/core/infrastructure/di/DIContainer";

export const dynamic = 'force-dynamic';

export default async function AssetTreePage() {
  // Récupérer l'arborescence complète
  const assetRepo = DIContainer.getAssetRepository();
  const getTreeUseCase = new GetAssetTreeUseCase(assetRepo);
  const tree = await getTreeUseCase.execute();

  return (
    <MainLayout>
      <div className="container-page">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900">Arborescence du Parc Machine</h1>
          <p className="text-neutral-600 mt-2">
            Vue hiérarchique complète : Site → Bâtiments → Lignes → Machines → Composants
          </p>
        </div>

        <AssetTreeView tree={tree} />
      </div>
    </MainLayout>
  );
}
