// =============================================================================
// PRISMA PART REQUEST REPOSITORY
// =============================================================================

import { PrismaClient } from '@prisma/client';
import { PartRequest, type PartRequestStatus, type PartRequestUrgency } from '../../domain/entities/PartRequest';
import type { IPartRequestRepository, PartRequestFilters } from '../../domain/repositories/PartRequestRepository';

export class PrismaPartRequestRepository implements IPartRequestRepository {
  constructor(private prisma: PrismaClient) {}

  private mapToDomain(data: {
    id: string;
    partId: string;
    quantity: number;
    requestedById: string;
    reason: string;
    urgency: string;
    workOrderId: string | null;
    assetId: string | null;
    status: string;
    approvedById: string | null;
    approvedAt: Date | null;
    rejectionReason: string | null;
    deliveredAt: Date | null;
    deliveredById: string | null;
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
    part?: {
      id: string;
      reference: string;
      name: string;
      quantityInStock: number;
      unitPrice: number;
    };
    requestedBy?: {
      id: string;
      name: string;
      email: string;
    };
    approvedBy?: {
      id: string;
      name: string;
    } | null;
    workOrder?: {
      id: string;
      title: string;
    } | null;
    asset?: {
      id: string;
      name: string;
    } | null;
  }): PartRequest {
    return PartRequest.fromPersistence({
      id: data.id,
      partId: data.partId,
      quantity: data.quantity,
      requestedById: data.requestedById,
      reason: data.reason,
      urgency: data.urgency as PartRequestUrgency,
      workOrderId: data.workOrderId ?? undefined,
      assetId: data.assetId ?? undefined,
      status: data.status as PartRequestStatus,
      approvedById: data.approvedById ?? undefined,
      approvedAt: data.approvedAt ?? undefined,
      rejectionReason: data.rejectionReason ?? undefined,
      deliveredAt: data.deliveredAt ?? undefined,
      deliveredById: data.deliveredById ?? undefined,
      notes: data.notes ?? undefined,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      part: data.part,
      requestedBy: data.requestedBy,
      approvedBy: data.approvedBy ?? undefined,
      workOrder: data.workOrder ?? undefined,
      asset: data.asset ?? undefined,
    });
  }

  async findById(id: string): Promise<PartRequest | null> {
    const data = await this.prisma.partRequest.findUnique({
      where: { id },
      include: {
        part: {
          select: {
            id: true,
            reference: true,
            name: true,
            quantityInStock: true,
            unitPrice: true,
          },
        },
        requestedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        approvedBy: {
          select: {
            id: true,
            name: true,
          },
        },
        workOrder: {
          select: {
            id: true,
            title: true,
          },
        },
        asset: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!data) return null;

    return this.mapToDomain(data);
  }

  async findAll(filters?: PartRequestFilters): Promise<PartRequest[]> {
    const where: Record<string, unknown> = {};

    if (filters?.status) {
      where.status = Array.isArray(filters.status)
        ? { in: filters.status }
        : filters.status;
    }
    if (filters?.urgency) {
      where.urgency = Array.isArray(filters.urgency)
        ? { in: filters.urgency }
        : filters.urgency;
    }
    if (filters?.requestedById) {
      where.requestedById = filters.requestedById;
    }
    if (filters?.partId) {
      where.partId = filters.partId;
    }
    if (filters?.workOrderId) {
      where.workOrderId = filters.workOrderId;
    }
    if (filters?.assetId) {
      where.assetId = filters.assetId;
    }

    const data = await this.prisma.partRequest.findMany({
      where,
      include: {
        part: {
          select: {
            id: true,
            reference: true,
            name: true,
            quantityInStock: true,
            unitPrice: true,
          },
        },
        requestedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        approvedBy: {
          select: {
            id: true,
            name: true,
          },
        },
        workOrder: {
          select: {
            id: true,
            title: true,
          },
        },
        asset: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [
        { urgency: 'desc' }, // CRITICAL en premier
        { createdAt: 'desc' },
      ],
    });

    return data.map(item => this.mapToDomain(item));
  }

  async findPending(): Promise<PartRequest[]> {
    return this.findAll({ status: 'PENDING' });
  }

  async findByRequestedBy(userId: string): Promise<PartRequest[]> {
    return this.findAll({ requestedById: userId });
  }

  async countPending(): Promise<number> {
    return this.prisma.partRequest.count({
      where: { status: 'PENDING' },
    });
  }

  async save(partRequest: PartRequest): Promise<void> {
    const data = partRequest.toPersistence();

    await this.prisma.partRequest.upsert({
      where: { id: data.id },
      create: {
        id: data.id,
        partId: data.partId,
        quantity: data.quantity,
        requestedById: data.requestedById,
        reason: data.reason,
        urgency: data.urgency,
        workOrderId: data.workOrderId,
        assetId: data.assetId,
        status: data.status,
        approvedById: data.approvedById,
        approvedAt: data.approvedAt,
        rejectionReason: data.rejectionReason,
        deliveredAt: data.deliveredAt,
        deliveredById: data.deliveredById,
        notes: data.notes,
      },
      update: {
        quantity: data.quantity,
        reason: data.reason,
        urgency: data.urgency,
        workOrderId: data.workOrderId,
        assetId: data.assetId,
        status: data.status,
        approvedById: data.approvedById,
        approvedAt: data.approvedAt,
        rejectionReason: data.rejectionReason,
        deliveredAt: data.deliveredAt,
        deliveredById: data.deliveredById,
        notes: data.notes,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.partRequest.delete({
      where: { id },
    });
  }
}
