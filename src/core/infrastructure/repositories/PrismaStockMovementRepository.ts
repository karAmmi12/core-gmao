import { StockMovementRepository } from '@/core/domain/repositories/StockMovementRepository';
import { StockMovement, MovementType } from '@/core/domain/entities/StockMovement';
import { prisma } from '@/shared/lib/prisma';

export class PrismaStockMovementRepository implements StockMovementRepository {
  async save(movement: StockMovement): Promise<void> {
    await prisma.stockMovement.create({
      data: {
        id: movement.id,
        partId: movement.partId,
        type: movement.type,
        quantity: movement.quantity,
        reason: movement.reason,
        reference: movement.reference,
        createdAt: movement.createdAt,
        createdBy: movement.createdBy,
      },
    });
  }

  async findByPartId(partId: string): Promise<StockMovement[]> {
    const rawMovements = await prisma.stockMovement.findMany({
      where: { partId },
      orderBy: { createdAt: 'desc' },
    });

    return rawMovements.map((raw) =>
      StockMovement.restore(
        raw.id,
        raw.partId,
        raw.type as MovementType,
        raw.quantity,
        raw.reason ?? undefined,
        raw.reference ?? undefined,
        raw.createdAt,
        raw.createdBy ?? undefined
      )
    );
  }

  async findRecent(limit: number = 50): Promise<StockMovement[]> {
    const rawMovements = await prisma.stockMovement.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    return rawMovements.map((raw) =>
      StockMovement.restore(
        raw.id,
        raw.partId,
        raw.type as MovementType,
        raw.quantity,
        raw.reason ?? undefined,
        raw.reference ?? undefined,
        raw.createdAt,
        raw.createdBy ?? undefined
      )
    );
  }

  async findByType(type: 'IN' | 'OUT'): Promise<StockMovement[]> {
    const rawMovements = await prisma.stockMovement.findMany({
      where: { type },
      orderBy: { createdAt: 'desc' },
    });

    return rawMovements.map((raw) =>
      StockMovement.restore(
        raw.id,
        raw.partId,
        raw.type as MovementType,
        raw.quantity,
        raw.reason ?? undefined,
        raw.reference ?? undefined,
        raw.createdAt,
        raw.createdBy ?? undefined
      )
    );
  }
}
