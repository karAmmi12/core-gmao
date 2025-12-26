import { Asset } from "@/core/domain/entities/Asset";
import { AssetDTO, AssetTreeDTO } from "./AssetDTO";

export class AssetMapper {
  static toDTO(asset: Asset): AssetDTO {
    return {
      id: asset.id,
      name: asset.name,
      serialNumber: asset.serialNumber,
      status: asset.status,
      createdAt: asset.createdAt.toISOString(),
      parentId: asset.parentId,
      assetType: asset.assetType,
      location: asset.location,
      manufacturer: asset.manufacturer,
      modelNumber: asset.modelNumber,
    };
  }

  static toDTOList(assets: Asset[]): AssetDTO[] {
    return assets.map(this.toDTO);
  }

  // Optionnel : pour reconstituer depuis un DTO (formulaire, API)
  static fromDTO(dto: AssetDTO): Asset {
    return Asset.restore(
      dto.id,
      dto.name,
      dto.serialNumber,
      dto.status as any,
      new Date(dto.createdAt),
      dto.parentId,
      dto.assetType as any,
      dto.location,
      dto.manufacturer,
      dto.modelNumber
    );
  }
}