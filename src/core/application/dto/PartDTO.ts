import { PartCategory } from '@/core/domain/entities/Part';

export interface PartDTO {
  id: string;
  reference: string;
  name: string;
  description?: string;
  category?: PartCategory;
  unitPrice: number;
  quantityInStock: number;
  minStockLevel: number;
  supplier?: string;
  supplierRef?: string;
  location?: string;
  isLowStock: boolean;
  hasStock: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StockMovementDTO {
  id: string;
  partId: string;
  type: 'IN' | 'OUT';
  quantity: number;
  reason?: string;
  reference?: string;
  stockAfter: number;
  createdAt: string;
  createdBy?: string;
}

export interface PartStatsDTO {
  totalParts: number;
  lowStockParts: number;
  outOfStockParts: number;
  totalValue: number;
}
