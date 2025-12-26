import { Part } from '../entities/Part';

export interface PartRepository {
  save(part: Part): Promise<void>;
  update(part: Part): Promise<void>;
  findAll(): Promise<Part[]>;
  findById(id: string): Promise<Part | null>;
  findByReference(reference: string): Promise<Part | null>;
  findLowStock(): Promise<Part[]>;
  findByCategory(category: string): Promise<Part[]>;
  updateStock(partId: string, newQuantity: number): Promise<void>;
}
