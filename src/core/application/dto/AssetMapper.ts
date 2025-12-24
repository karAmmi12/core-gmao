import { Asset } from "@/core/domain/entities/Asset";
import { AssetDTO } from "./AssetDTO";

export class AssetMapper {
  static toDTO(asset: Asset): AssetDTO {
    return {
      id: asset.id,
      name: asset.name,
      serialNumber: asset.serialNumber,
      status: asset.status,
      createdAt: asset.createdAt.toISOString(),
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
      new Date(dto.createdAt)
    );
  }
}