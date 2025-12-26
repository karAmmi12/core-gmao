import { PrismaAssetRepository } from "@/core/infrastructure/repositories/PrismaAssetRepository";
import { PrismaWorkOrderRepository } from "@/core/infrastructure/repositories/PrismaWorkOrderRepository";
import { PrismaTechnicianRepository } from "@/core/infrastructure/repositories/PrismaTechnicianRepository";
import { PrismaPartRepository } from "@/core/infrastructure/repositories/PrismaPartRepository";
import { PrismaStockMovementRepository } from "@/core/infrastructure/repositories/PrismaStockMovementRepository";
import { PrismaMaintenanceScheduleRepository } from "@/core/infrastructure/repositories/PrismaMaintenanceScheduleRepository";
import { AssetRepository } from "@/core/domain/repositories/AssetRepository";
import { WorkOrderRepository } from "@/core/domain/repositories/WorkOrderRepository";
import { TechnicianRepository } from "@/core/domain/repositories/TechnicianRepository";
import { PartRepository } from "@/core/domain/repositories/PartRepository";
import { StockMovementRepository } from "@/core/domain/repositories/StockMovementRepository";
import { MaintenanceScheduleRepository } from "@/core/domain/repositories/MaintenanceScheduleRepository";
import { InventoryService } from "@/core/application/services/InventoryService";
import { MaintenanceScheduleService } from "@/core/application/services/MaintenanceScheduleService";

// Container simple (sans bibliothèque externe)
class DIContainer {
  private static assetRepo: AssetRepository | null = null;
  private static workOrderRepo: WorkOrderRepository | null = null;
  private static technicianRepo: TechnicianRepository | null = null;
  private static partRepo: PartRepository | null = null;
  private static stockMovementRepo: StockMovementRepository | null = null;
  private static maintenanceScheduleRepo: MaintenanceScheduleRepository | null = null;
  private static inventoryService: InventoryService | null = null;
  private static maintenanceScheduleService: MaintenanceScheduleService | null = null;

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

  static getTechnicianRepository(): TechnicianRepository {
    if (!this.technicianRepo) {
      this.technicianRepo = new PrismaTechnicianRepository();
    }
    return this.technicianRepo;
  }

  static getPartRepository(): PartRepository {
    if (!this.partRepo) {
      this.partRepo = new PrismaPartRepository();
    }
    return this.partRepo;
  }

  static getStockMovementRepository(): StockMovementRepository {
    if (!this.stockMovementRepo) {
      this.stockMovementRepo = new PrismaStockMovementRepository();
    }
    return this.stockMovementRepo;
  }

  static getMaintenanceScheduleRepository(): MaintenanceScheduleRepository {
    if (!this.maintenanceScheduleRepo) {
      this.maintenanceScheduleRepo = new PrismaMaintenanceScheduleRepository();
    }
    return this.maintenanceScheduleRepo;
  }

  // Utile pour les tests : permet d'injecter des mocks
  static setAssetRepository(repo: AssetRepository) {
    this.assetRepo = repo;
  }

  static setWorkOrderRepository(repo: WorkOrderRepository) {
    this.workOrderRepo = repo;
  }

  static setTechnicianRepository(repo: TechnicianRepository) {
    this.technicianRepo = repo;
  }

  static setPartRepository(repo: PartRepository) {
    this.partRepo = repo;
  }

  static setStockMovementRepository(repo: StockMovementRepository) {
    this.stockMovementRepo = repo;
  }

  static setMaintenanceScheduleRepository(repo: MaintenanceScheduleRepository) {
    this.maintenanceScheduleRepo = repo;
  }

  static getInventoryService(): InventoryService {
    if (!this.inventoryService) {
      this.inventoryService = new InventoryService();
    }
    return this.inventoryService;
  }

  static getMaintenanceScheduleService(): MaintenanceScheduleService {
    if (!this.maintenanceScheduleService) {
      this.maintenanceScheduleService = new MaintenanceScheduleService(
        this.getMaintenanceScheduleRepository(),
        this.getAssetRepository(),
        this.getTechnicianRepository()
      );
    }
    return this.maintenanceScheduleService;
  }

  // Reset pour les tests
  static reset() {
    this.assetRepo = null;
    this.workOrderRepo = null;
    this.technicianRepo = null;
    this.partRepo = null;
    this.stockMovementRepo = null;
    this.maintenanceScheduleRepo = null;
    this.inventoryService = null;
    this.maintenanceScheduleService = null;
  }
}

export default DIContainer;