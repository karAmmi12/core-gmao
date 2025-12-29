import { AssetService } from "@/core/application/services/AssetService";
import { notFound } from "next/navigation";
import { MainLayout } from '@/components';
import { AssetDetailCard } from '@/components/features/assets/AssetDetailCard';
import { AssetInterventionHistory } from '@/components/features/assets/AssetInterventionHistory';
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function AssetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const service = new AssetService();
  const data = await service.getAssetDetails(id);

  if (!data) {
    notFound();
  }

  const { asset, history } = data;

  return (
    <MainLayout>
      <div className="container-narrow">
        
        <Link href="/" className="inline-flex items-center link-neutral mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" /> Retour au parc
        </Link>

        <div className="mb-8">
          <AssetDetailCard asset={asset} />
        </div>

        <AssetInterventionHistory history={history} assetId={asset.id} />

      </div>
    </MainLayout>
  );
}
                       