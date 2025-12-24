import { Asset } from "@/core/domain/entities/Asset";
import { AssetRepository } from "@/core/domain/repositories/AssetRepository";

export class CreateAssetUseCase {
  // Injection de dépendance
  constructor(private assetRepo: AssetRepository) {}

  async execute(name: string, serialNumber: string) {
    // 1. Appel au domaine pour créer l'entité (et vérifier les règles)
    const newAsset = Asset.create(name, serialNumber);

    // 2. Persistance via le repository
    await this.assetRepo.save(newAsset);

    // 3. Retour simple
    return { id: newAsset.id };
  }
}