import { Asset } from "@/core/domain/entities/Asset";
import { WorkOrder } from "@/core/domain/entities/WorkOrder";
import { AssetRepository } from "@/core/domain/repositories/AssetRepository";
import { WorkOrderRepository } from "@/core/domain/repositories/WorkOrderRepository";

// Ce que le Use Case retourne (DTO)
type Output = {
  asset: Asset;
  history: WorkOrder[];
};

export class GetAssetDetailsUseCase {
  constructor(
    private assetRepo: AssetRepository,
    private workOrderRepo: WorkOrderRepository
  ) {}

  async execute(assetId: string): Promise<Output | null> {
    // 1. On récupère la machine
    const asset = await this.assetRepo.findById(assetId);
    
    if (!asset) {
      return null; // Ou lancer une erreur "AssetNotFound"
    }

    // 2. On récupère son historique
    const history = await this.workOrderRepo.findByAssetId(assetId);

    // 3. On retourne le tout groupé
    return {
      asset,
      history
    };
  }
}