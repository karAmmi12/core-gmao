import { AssetRepository } from "@/core/domain/repositories/AssetRepository";
import { AssetMapper } from "../dto/AssetMapper";
import { AssetTreeDTO } from "../dto/AssetDTO";

/**
 * Use Case : Récupérer l'arborescence complète des actifs
 * Retourne une structure hiérarchique avec les enfants de chaque actif
 */
export class GetAssetTreeUseCase {
  constructor(private assetRepository: AssetRepository) {}

  async execute(): Promise<AssetTreeDTO[]> {
    // 1. Récupérer tous les actifs
    const assets = await this.assetRepository.findAll();
    
    // 2. Convertir en DTOs
    const assetDTOs = AssetMapper.toDTOList(assets);
    
    // 3. Construire l'arborescence
    const tree = this.buildTree(assetDTOs);
    
    return tree;
  }

  /**
   * Construit une structure d'arbre à partir d'une liste plate d'actifs
   */
  private buildTree(assets: any[], parentId: string | null = null, level: number = 0): AssetTreeDTO[] {
    const children = assets
      .filter(asset => {
        if (parentId === null) {
          return !asset.parentId; // Actifs racines
        }
        return asset.parentId === parentId;
      })
      .map(asset => ({
        ...asset,
        level,
        children: this.buildTree(assets, asset.id, level + 1),
      }));

    return children;
  }
}
