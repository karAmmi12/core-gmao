// =============================================================================
// PRISMA WORK ORDER PART REPOSITORY
// =============================================================================

import { PrismaClient } from '@prisma/client';
import { WorkOrderPart, type WorkOrderPartStatus } from '../../domain/entities/WorkOrderPart';
import type { IWorkOrderPartRepository, WorkOrderPartFilters } from '../../domain/repositories/WorkOrderPartRepository';

export class PrismaWorkOrderPartRepository implements IWorkOrderPartRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string): Promise<WorkOrderPart | null> {
    const data = await this.prisma.workOrderPart.findUnique({
      where: { id },
      include: {
        part: {
          select: {
            id: true,
            reference: true,
            name: true,
            quantityInStock: true,
          },
        },
        workOrder: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
      },
    });

    if (!data) return null;

    return WorkOrderPart.fromPersistence({
      id: data.id,
      workOrderId: data.workOrderId,
      partId: data.partId,
      quantityPlanned: data.quantityPlanned,
      quantityReserved: data.quantityReserved,
      quantityConsumed: data.quantityConsumed,
      status: data.status as WorkOrderPartStatus,
      unitPrice: data.unitPrice,
      totalPrice: data.totalPrice,
      requestedById: data.requestedById ?? undefined,
      approvedById: data.approvedById ?? undefined,
      approvedAt: data.approvedAt ?? undefined,
      consumedAt: data.consumedAt ?? undefined,
      notes: data.notes ?? undefined,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      part: data.part,
      workOrder: data.workOrder,
    });
  }

  async findByWorkOrderId(workOrderId: string): Promise<WorkOrderPart[]> {
    const data = await this.prisma.workOrderPart.findMany({
      where: { workOrderId },
      include: {
        part: {
          select: {
            id: true,
            reference: true,
            name: true,
            quantityInStock: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return data.map(item => WorkOrderPart.fromPersistence({
      id: item.id,
      workOrderId: item.workOrderId,
      partId: item.partId,
      quantityPlanned: item.quantityPlanned,
      quantityReserved: item.quantityReserved,
      quantityConsumed: item.quantityConsumed,
      status: item.status as WorkOrderPartStatus,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
      requestedById: item.requestedById ?? undefined,
      approvedById: item.approvedById ?? undefined,
      approvedAt: item.approvedAt ?? undefined,
      consumedAt: item.consumedAt ?? undefined,
      notes: item.notes ?? undefined,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      part: item.part,
    }));
  }

  async findAll(filters?: WorkOrderPartFilters): Promise<WorkOrderPart[]> {
    const where: Record<string, unknown> = {};

    if (filters?.workOrderId) {
      where.workOrderId = filters.workOrderId;
    }
    if (filters?.partId) {
      where.partId = filters.partId;
    }
    if (filters?.requestedById) {
      where.requestedById = filters.requestedById;
    }
    if (filters?.status) {
      where.status = Array.isArray(filters.status) 
        ? { in: filters.status }
        : filters.status;
    }

    const data = await this.prisma.workOrderPart.findMany({
      where,
      include: {
        part: {
          select: {
            id: true,
            reference: true,
            name: true,
            quantityInStock: true,
          },
        },
        workOrder: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return data.map(item => WorkOrderPart.fromPersistence({
      id: item.id,
      workOrderId: item.workOrderId,
      partId: item.partId,
      quantityPlanned: item.quantityPlanned,
      quantityReserved: item.quantityReserved,
      quantityConsumed: item.quantityConsumed,
      status: item.status as WorkOrderPartStatus,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
      requestedById: item.requestedById ?? undefined,
      approvedById: item.approvedById ?? undefined,
      approvedAt: item.approvedAt ?? undefined,
      consumedAt: item.consumedAt ?? undefined,
      notes: item.notes ?? undefined,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      part: item.part,
      workOrder: item.workOrder,
    }));
  }

  async findPendingReservations(): Promise<WorkOrderPart[]> {
    return this.findAll({ status: ['PLANNED', 'PARTIALLY_RESERVED'] });
  }

  async save(workOrderPart: WorkOrderPart): Promise<void> {
    const data = workOrderPart.toPersistence();

    await this.prisma.workOrderPart.upsert({
      where: { id: data.id },
      create: {
        id: data.id,
        workOrderId: data.workOrderId,
        partId: data.partId,
        quantityPlanned: data.quantityPlanned,
        quantityReserved: data.quantityReserved,
        quantityConsumed: data.quantityConsumed,
        status: data.status,
        unitPrice: data.unitPrice,
        totalPrice: data.totalPrice,
        requestedById: data.requestedById,
        approvedById: data.approvedById,
        approvedAt: data.approvedAt,
        consumedAt: data.consumedAt,
        notes: data.notes,
      },
      update: {
        quantityPlanned: data.quantityPlanned,
        quantityReserved: data.quantityReserved,
        quantityConsumed: data.quantityConsumed,
        status: data.status,
        unitPrice: data.unitPrice,
        totalPrice: data.totalPrice,
        requestedById: data.requestedById,
        approvedById: data.approvedById,
        approvedAt: data.approvedAt,
        consumedAt: data.consumedAt,
        notes: data.notes,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.workOrderPart.delete({
      where: { id },
    });
  }

  async deleteByWorkOrderId(workOrderId: string): Promise<void> {
    await this.prisma.workOrderPart.deleteMany({
      where: { workOrderId },
    });
  }
}
