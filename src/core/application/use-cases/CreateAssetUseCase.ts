import { Asset, AssetHierarchy, AssetStatus } from "@/core/domain/entities/Asset";
import { AssetRepository } from "@/core/domain/repositories/AssetRepository";

export class CreateAssetUseCase {
  // Injection de dépendance
  constructor(private assetRepo: AssetRepository) {}

  async execute(
    name: string,
    serialNumber: string,
    status: AssetStatus = 'RUNNING',
    hierarchy?: AssetHierarchy
  ) {
    // 1. Si un parent est spécifié, vérifier qu'il existe
    if (hierarchy?.parentId) {
      const parent = await this.assetRepo.findById(hierarchy.parentId);
      if (!parent) {
        throw new Error("L'actif parent spécifié n'existe pas");
      }
    }

    // 2. Appel au domaine pour créer l'entité (et vérifier les règles)
    const newAsset = Asset.create(name, serialNumber, hierarchy, status);

    // 3. Persistance via le repository
    await this.assetRepo.save(newAsset);

    // 4. Retour simple
    return { id: newAsset.id };
  }
}