import DIContainer from "@/core/infrastructure/di/DIContainer";
import { GetDashboardStatsUseCase } from "@/core/application/use-cases/GetDashboardStatsUseCase";
import { GetAssetDetailsUseCase } from "@/core/application/use-cases/GetAssetDetailsUseCase";
import { AssetMapper } from "@/core/application/dto/AssetMapper";
import { WorkOrderMapper } from "@/core/application/dto/WorkOrderMapper";
import { AssetDTO, DashboardStatsDTO } from "@/core/application/dto/AssetDTO";
import { AssetDetailsDTO } from "@/core/application/dto/WorkOrderDTO";

export class AssetService {
  private assetRepo = DIContainer.getAssetRepository();
  private orderRepo = DIContainer.getWorkOrderRepository();

  async getDashboardStats(): Promise<DashboardStatsDTO> {
    const useCase = new GetDashboardStatsUseCase(this.assetRepo, this.orderRepo);
    const result = await useCase.execute();
    
    return {
      totalAssets: result.assets.total,
      runningAssets: result.assets.running,
      stoppedAssets: result.assets.stopped,
      brokenAssets: result.assets.broken,
      pendingOrders: result.pendingOrders,
      availabilityRate: result.availabilityRate,
    };
  }

  async getAllAssets(): Promise<AssetDTO[]> {
    const assets = await this.assetRepo.findAll();
    return AssetMapper.toDTOList(assets);
  }

  async getAssetDetails(id: string): Promise<AssetDetailsDTO | null> {
    const useCase = new GetAssetDetailsUseCase(this.assetRepo, this.orderRepo);
    const result = await useCase.execute(id);
    
    if (!result) {
      return null;
    }

    // Mapper les entités en DTOs et charger les pièces
    const historyDTOs = WorkOrderMapper.toDTOList(result.history);
    
    // Charger les pièces pour chaque intervention
    for (const workOrder of historyDTOs) {
      const parts = await this.orderRepo.getWorkOrderParts(workOrder.id);
      workOrder.parts = parts;
    }

    return {
      asset: AssetMapper.toDTO(result.asset),
      history: historyDTOs,
    };
  }
}