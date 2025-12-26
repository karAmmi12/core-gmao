import { AssetRepository } from "@/core/domain/repositories/AssetRepository";
import { Asset, AssetStatus } from "@/core/domain/entities/Asset";

export class UpdateAssetStatusUseCase {
  constructor(private assetRepo: AssetRepository) {}

  async execute(assetId: string, newStatus: AssetStatus): Promise<void> {
    const asset = await this.assetRepo.findById(assetId);
    
    if (!asset) {
      throw new Error("Équipement introuvable");
    }

    // Créer un nouvel asset avec le nouveau statut
    const updatedAsset = (Asset as any).restore(
      asset.id,
      asset.name,
      asset.serialNumber,
      newStatus,
      asset.createdAt,
      asset.parentId,
      asset.assetType,
      asset.location,
      asset.manufacturer,
      asset.modelNumber
    );

    await this.assetRepo.update(updatedAsset);
  }
}
