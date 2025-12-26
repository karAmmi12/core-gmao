import { StockMovement } from '../entities/StockMovement';

export interface StockMovementRepository {
  save(movement: StockMovement): Promise<void>;
  findByPartId(partId: string): Promise<StockMovement[]>;
  findRecent(limit?: number): Promise<StockMovement[]>;
  findByType(type: 'IN' | 'OUT'): Promise<StockMovement[]>;
}
