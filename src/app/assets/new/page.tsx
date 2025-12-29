/**
 * Page Nouvel Équipement
 */

import { MainLayout, PageHeader, LinkButton } from '@/components';
import { AssetForm } from '@/presentation/components/forms/AssetForm';
import { AssetService } from '@/core/application/services/AssetService';
import { ConfigurationService } from '@/core/application/services/ConfigurationService';

export default async function NewAssetPage() {
  // Charger les assets pour le parent potentiel et les types d'équipements
  const assetService = new AssetService();
  const [assets, assetTypes] = await Promise.all([
    assetService.getAllAssets(),
    ConfigurationService.getAssetTypes(),
  ]);

  return (
    <MainLayout>
      <div className="space-y-6">
        <PageHeader
          title="Nouvel Équipement"
          description="Ajouter un équipement au parc"
          icon="🏭"
          actions={
            <LinkButton href="/assets" variant="ghost">
              ← Retour à la liste
            </LinkButton>
          }
        />
        
        <AssetForm assets={assets} assetTypes={assetTypes} />
      </div>
    </MainLayout>
  );
}
