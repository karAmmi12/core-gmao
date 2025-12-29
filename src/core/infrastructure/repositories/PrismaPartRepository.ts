import { PartRepository } from '@/core/domain/repositories/PartRepository';
import { Part, PartCategory } from '@/core/domain/entities/Part';
import { prisma } from '@/shared/lib/prisma';

export class PrismaPartRepository implements PartRepository {
  async save(part: Part): Promise<void> {
    await prisma.part.create({
      data: {
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
        createdAt: part.createdAt,
        updatedAt: part.updatedAt,
      },
    });
  }

  async update(part: Part): Promise<void> {
    await prisma.part.update({
      where: { id: part.id },
      data: {
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
        updatedAt: new Date(),
      },
    });
  }

  async findAll(): Promise<Part[]> {
    const rawParts = await prisma.part.findMany({
      orderBy: { name: 'asc' },
    });

    return rawParts.map((raw) =>
      Part.restore(
        raw.id,
        raw.reference,
        raw.name,
        raw.description ?? undefined,
        raw.category as PartCategory | undefined,
        raw.unitPrice,
        raw.quantityInStock,
        raw.minStockLevel,
        raw.supplier ?? undefined,
        raw.supplierRef ?? undefined,
        raw.location ?? undefined,
        raw.createdAt,
        raw.updatedAt
      )
    );
  }

  async findById(id: string): Promise<Part | null> {
    const raw = await prisma.part.findUnique({ where: { id } });
    if (!raw) return null;

    return Part.restore(
      raw.id,
      raw.reference,
      raw.name,
      raw.description ?? undefined,
      raw.category as PartCategory | undefined,
      raw.unitPrice,
      raw.quantityInStock,
      raw.minStockLevel,
      raw.supplier ?? undefined,
      raw.supplierRef ?? undefined,
      raw.location ?? undefined,
      raw.createdAt,
      raw.updatedAt
    );
  }

  async findByReference(reference: string): Promise<Part | null> {
    const raw = await prisma.part.findUnique({ 
      where: { reference: reference.toUpperCase() } 
    });
    if (!raw) return null;

    return Part.restore(
      raw.id,
      raw.reference,
      raw.name,
      raw.description ?? undefined,
      raw.category as PartCategory | undefined,
      raw.unitPrice,
      raw.quantityInStock,
      raw.minStockLevel,
      raw.supplier ?? undefined,
      raw.supplierRef ?? undefined,
      raw.location ?? undefined,
      raw.createdAt,
      raw.updatedAt
    );
  }

  async findLowStock(): Promise<Part[]> {
    const rawParts = await prisma.part.findMany({
      where: {
        quantityInStock: {
          lte: prisma.part.fields.minStockLevel,
        },
      },
      orderBy: { quantityInStock: 'asc' },
    });

    return rawParts.map((raw) =>
      Part.restore(
        raw.id,
        raw.reference,
        raw.name,
        raw.description ?? undefined,
        raw.category as PartCategory | undefined,
        raw.unitPrice,
        raw.quantityInStock,
        raw.minStockLevel,
        raw.supplier ?? undefined,
        raw.supplierRef ?? undefined,
        raw.location ?? undefined,
        raw.createdAt,
        raw.updatedAt
      )
    );
  }

  async findByCategory(category: string): Promise<Part[]> {
    const rawParts = await prisma.part.findMany({
      where: { category },
      orderBy: { name: 'asc' },
    });

    return rawParts.map((raw) =>
      Part.restore(
        raw.id,
        raw.reference,
        raw.name,
        raw.description ?? undefined,
        raw.category as PartCategory | undefined,
        raw.unitPrice,
        raw.quantityInStock,
        raw.minStockLevel,
        raw.supplier ?? undefined,
        raw.supplierRef ?? undefined,
        raw.location ?? undefined,
        raw.createdAt,
        raw.updatedAt
      )
    );
  }

  async updateStock(partId: string, newQuantity: number): Promise<void> {
    await prisma.part.update({
      where: { id: partId },
      data: {
        quantityInStock: newQuantity,
        updatedAt: new Date(),
      },
    });
  }
}
