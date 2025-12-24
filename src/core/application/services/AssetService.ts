import DIContainer from "@/core/infrastructure/di/DIContainer";
import { GetDashboardStatsUseCase } from "@/core/application/use-cases/GetDashboardStatsUseCase";
import { GetAssetDetailsUseCase } from "@/core/application/use-cases/GetAssetDetailsUseCase";
import { AssetMapper } from "@/core/application/dto/AssetMapper";
import { AssetDTO, DashboardStatsDTO } from "@/core/application/dto/AssetDTO";

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

  async getAssetDetails(id: string) {
    const useCase = new GetAssetDetailsUseCase(this.assetRepo, this.orderRepo);
    return useCase.execute(id);
  }
}