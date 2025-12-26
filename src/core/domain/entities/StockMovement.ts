import { v4 as uuidv4 } from 'uuid';

export type MovementType = 'IN' | 'OUT';

export interface StockMovementInput {
  partId: string;
  type: MovementType;
  quantity: number;
  reason?: string;
  reference?: string;
  createdBy?: string;
}

export class StockMovement {
  private constructor(
    public readonly id: string,
    public readonly partId: string,
    public readonly type: MovementType,
    public readonly quantity: number,
    public readonly reason: string | undefined,
    public readonly reference: string | undefined,
    public readonly createdAt: Date,
    public readonly createdBy: string | undefined
  ) {}

  static create(input: StockMovementInput): StockMovement {
    if (input.quantity <= 0) {
      throw new Error("La quantité doit être supérieure à 0");
    }

    return new StockMovement(
      uuidv4(),
      input.partId,
      input.type,
      input.quantity,
      input.reason,
      input.reference,
      new Date(),
      input.createdBy
    );
  }

  static restore(
    id: string,
    partId: string,
    type: MovementType,
    quantity: number,
    reason: string | undefined,
    reference: string | undefined,
    createdAt: Date,
    createdBy: string | undefined
  ): StockMovement {
    return new StockMovement(
      id,
      partId,
      type,
      quantity,
      reason,
      reference,
      createdAt,
      createdBy
    );
  }

  getSignedQuantity(): number {
    return this.type === 'IN' ? this.quantity : -this.quantity;
  }
}
