import { Part } from '@/core/domain/entities/Part';
import { StockMovement } from '@/core/domain/entities/StockMovement';
import { PartDTO, StockMovementDTO } from './PartDTO';

export class PartMapper {
  static toDTO(part: Part): PartDTO {
    return {
      id: part.id,
      reference: part.reference,
      name: part.name,
      description: part.description,
      category: part.category,
      unitPrice: part.unitPrice,
      quantityInStock: part.quantityInStock,
      minStockLevel: part.minStockLevel,
      supplier: part.supplier,
      supplierRef: part.supplierRef,
      location: part.location,
      isLowStock: part.isLowStock(),
      hasStock: part.hasStock(),
      createdAt: part.createdAt.toISOString(),
      updatedAt: part.updatedAt.toISOString(),
    };
  }

  static toDTOList(parts: Part[]): PartDTO[] {
    return parts.map((p) => this.toDTO(p));
  }
}

export class StockMovementMapper {
  static toDTO(movement: StockMovement): StockMovementDTO {
    return {
      id: movement.id,
      partId: movement.partId,
      type: movement.type,
      quantity: movement.quantity,
      reason: movement.reason,
      reference: movement.reference,
      createdAt: movement.createdAt.toISOString(),
      createdBy: movement.createdBy,
    };
  }

  static toDTOList(movements: StockMovement[]): StockMovementDTO[] {
    return movements.map((m) => this.toDTO(m));
  }
}
