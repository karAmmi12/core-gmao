import { AssetRepository } from "@/core/domain/repositories/AssetRepository";
import { WorkOrderRepository } from "@/core/domain/repositories/WorkOrderRepository";

export class GetDashboardStatsUseCase {
  constructor(
    private assetRepo: AssetRepository,
    private orderRepo: WorkOrderRepository
  ) {}

  async execute() {
    const assetStats = await this.assetRepo.getStats();
    const pendingOrders = await this.orderRepo.countPending();
    
    // Stats par type de maintenance
    const ordersByType = await this.orderRepo.countByType?.() || {
      CORRECTIVE: 0,
      PREVENTIVE: 0,
      PREDICTIVE: 0,
      CONDITIONAL: 0
    };

    // On calcule un "Taux de disponibilité" fictif pour le style
    const availabilityRate = assetStats.total > 0 
      ? Math.round((assetStats.running / assetStats.total) * 100) 
      : 100;

    return {
      assets: assetStats,
      pendingOrders,
      availabilityRate,
      ordersByType
    };
  }
}