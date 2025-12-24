import { PrismaAssetRepository } from "@/core/infrastructure/repositories/PrismaAssetRepository";
import { PrismaWorkOrderRepository } from "@/core/infrastructure/repositories/PrismaWorkOrderRepository";
import { AssetRepository } from "@/core/domain/repositories/AssetRepository";
import { WorkOrderRepository } from "@/core/domain/repositories/WorkOrderRepository";

// Container simple (sans bibliothèque externe)
class DIContainer {
  private static assetRepo: AssetRepository | null = null;
  private static workOrderRepo: WorkOrderRepository | null = null;

  static getAssetRepository(): AssetRepository {
    if (!this.assetRepo) {
      this.assetRepo = new PrismaAssetRepository();
    }
    return this.assetRepo;
  }

  static getWorkOrderRepository(): WorkOrderRepository {
    if (!this.workOrderRepo) {
      this.workOrderRepo = new PrismaWorkOrderRepository();
    }
    return this.workOrderRepo;
  }

  // Utile pour les tests : permet d'injecter des mocks
  static setAssetRepository(repo: AssetRepository) {
    this.assetRepo = repo;
  }

  static setWorkOrderRepository(repo: WorkOrderRepository) {
    this.workOrderRepo = repo;
  }

  // Reset pour les tests
  static reset() {
    this.assetRepo = null;
    this.workOrderRepo = null;
  }
}

export default DIContainer;