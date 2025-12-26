import { v4 as uuidv4 } from 'uuid';

export type PartCategory = 
  | 'FILTRES' 
  | 'JOINTS' 
  | 'ROULEMENTS' 
  | 'COURROIES' 
  | 'LUBRIFIANTS' 
  | 'VISSERIE' 
  | 'ELECTRICITE' 
  | 'HYDRAULIQUE'
  | 'PNEUMATIQUE'
  | 'AUTRE';

export interface PartCreateInput {
  reference: string;
  name: string;
  description?: string;
  category?: PartCategory;
  unitPrice: number;
  minStockLevel?: number;
  supplier?: string;
  supplierRef?: string;
  location?: string;
}

export class Part {
  private constructor(
    public readonly id: string,
    public readonly reference: string,
    public readonly name: string,
    public readonly description: string | undefined,
    public readonly category: PartCategory | undefined,
    public readonly unitPrice: number,
    public readonly quantityInStock: number,
    public readonly minStockLevel: number,
    public readonly supplier: string | undefined,
    public readonly supplierRef: string | undefined,
    public readonly location: string | undefined,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  static create(input: PartCreateInput): Part {
    if (input.reference.length < 3) {
      throw new Error("La référence doit contenir au moins 3 caractères");
    }

    if (input.name.length < 3) {
      throw new Error("Le nom doit contenir au moins 3 caractères");
    }

    if (input.unitPrice < 0) {
      throw new Error("Le prix unitaire doit être positif");
    }

    const now = new Date();

    return new Part(
      uuidv4(),
      input.reference.toUpperCase(),
      input.name,
      input.description,
      input.category,
      input.unitPrice,
      0, // quantityInStock initial
      input.minStockLevel || 5,
      input.supplier,
      input.supplierRef,
      input.location,
      now,
      now
    );
  }

  static restore(
    id: string,
    reference: string,
    name: string,
    description: string | undefined,
    category: PartCategory | undefined,
    unitPrice: number,
    quantityInStock: number,
    minStockLevel: number,
    supplier: string | undefined,
    supplierRef: string | undefined,
    location: string | undefined,
    createdAt: Date,
    updatedAt: Date
  ): Part {
    return new Part(
      id,
      reference,
      name,
      description,
      category,
      unitPrice,
      quantityInStock,
      minStockLevel,
      supplier,
      supplierRef,
      location,
      createdAt,
      updatedAt
    );
  }

  isLowStock(): boolean {
    return this.quantityInStock <= this.minStockLevel;
  }

  hasStock(): boolean {
    return this.quantityInStock > 0;
  }

  canFulfill(quantity: number): boolean {
    return this.quantityInStock >= quantity;
  }
}
