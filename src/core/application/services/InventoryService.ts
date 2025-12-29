import DIContainer from '@/core/infrastructure/di/DIContainer';
import { PartDTO, PartStatsDTO, StockMovementDTO } from '@/core/application/dto/PartDTO';
import { PartMapper, StockMovementMapper } from '@/core/application/dto/PartMapper';

export class InventoryService {
  private partRepo = DIContainer.getPartRepository();
  private stockMovementRepo = DIContainer.getStockMovementRepository();

  async getAllParts(): Promise<PartDTO[]> {
    const parts = await this.partRepo.findAll();
    return PartMapper.toDTOList(parts);
  }

  async getPartById(id: string): Promise<PartDTO | null> {
    const part = await this.partRepo.findById(id);
    if (!part) return null;
    return PartMapper.toDTO(part);
  }

  async getLowStockParts(): Promise<PartDTO[]> {
    const parts = await this.partRepo.findLowStock();
    return PartMapper.toDTOList(parts);
  }

  async getPartsByCategory(category: string): Promise<PartDTO[]> {
    const parts = await this.partRepo.findByCategory(category);
    return PartMapper.toDTOList(parts);
  }

  async getPartMovements(partId: string): Promise<StockMovementDTO[]> {
    const part = await this.partRepo.findById(partId);
    if (!part) return [];
    
    const movements = await this.stockMovementRepo.findByPartId(partId);
    
    // Trier par date croissante pour calculer le stock
    const sortedMovements = [...movements].sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
    );
    
    // Calculer le stock après chaque mouvement
    let runningStock = part.quantityInStock;
    const movementsWithStock: StockMovementDTO[] = [];
    
    // Parcourir en ordre inverse pour calculer le stock historique
    for (let i = sortedMovements.length - 1; i >= 0; i--) {
      const movement = sortedMovements[i];
      const dto = StockMovementMapper.toDTO(movement);
      dto.stockAfter = runningStock;
      
      // Ajuster le stock en fonction du type de mouvement (en arrière)
      if (movement.type === 'IN') {
        runningStock -= movement.quantity;
      } else {
        runningStock += movement.quantity;
      }
      
      movementsWithStock.unshift(dto);
    }
    
    return movementsWithStock;
  }

  async getRecentMovements(limit?: number): Promise<StockMovementDTO[]> {
    const movements = await this.stockMovementRepo.findRecent(limit);
    return StockMovementMapper.toDTOList(movements);
  }

  async getInventoryStats(): Promise<PartStatsDTO> {
    const parts = await this.partRepo.findAll();

    const totalParts = parts.length;
    const totalUnits = parts.reduce((sum, p) => sum + p.quantityInStock, 0);
    const lowStockParts = parts.filter((p) => p.isLowStock()).length;
    const outOfStockParts = parts.filter((p) => !p.hasStock()).length;
    const totalValue = parts.reduce(
      (sum, p) => sum + p.unitPrice * p.quantityInStock,
      0
    );

    return {
      totalParts,
      totalUnits,
      lowStockParts,
      outOfStockParts,
      totalValue: Math.round(totalValue * 100) / 100,
    };
  }
}
