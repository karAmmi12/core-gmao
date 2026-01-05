import { AssetRepository } from "@/core/domain/repositories/AssetRepository";
import { WorkOrderRepository } from "@/core/domain/repositories/WorkOrderRepository";

export class GetDashboardStatsUseCase {
  constructor(
    private assetRepo: AssetRepository,
    private orderRepo: WorkOrderRepository
  ) {}

  async execute() {
    // Exécuter toutes les requêtes en parallèle pour optimiser les performances
    const [assetStats, pendingOrders, ordersByType] = await Promise.all([
      this.assetRepo.getStats(),
      this.orderRepo.countPending(),
      this.orderRepo.countByType?.().catch(() => ({
        CORRECTIVE: 0,
        PREVENTIVE: 0,
        PREDICTIVE: 0,
        CONDITIONAL: 0
      }))
    ]);

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