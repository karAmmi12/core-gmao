import { AssetService } from "@/core/application/services/AssetService";
import { notFound } from "next/navigation";
import { MainLayout } from "@/presentation/components/layouts/MainLayout";
import { AssetDetailCard } from "@/presentation/components/features/assets/AssetDetailCard";
import { AssetInterventionHistory } from "@/presentation/components/features/assets/AssetInterventionHistory";
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
      <div className="max-w-4xl mx-auto px-6 py-8">
        
        <Link href="/" className="inline-flex items-center text-slate-500 hover:text-slate-900 mb-6 transition-colors">
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
                       